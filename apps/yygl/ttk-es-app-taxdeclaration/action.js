import React from 'react';
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
import debounce from 'lodash.debounce'
import { fromJS } from 'immutable';
import config from './config';
import extend from './extend';
import { Button, Icon } from 'edf-component';
import RenderTree from './component/RenderTree';
import CustomerClass from './component/CustomerClass';
import UpdateStatus from './component/UpdateStatus';
import {message} from "antd";
import moment from 'moment';
import { DataGrid } from 'edf-component'
import BovmsPurchaseTable from "./component/DataGrid";
import isEqual from 'lodash.isequal';

class action {
	constructor(option) {
		this.metaAction = option.metaAction;
		this.extendAction = option.extendAction;
		this.config = config.current;
		this.webapi = this.config.webapi;
	}

	onInit = ({ component, injections }) => {
		this.extendAction.gridAction.onInit({ component, injections });
		this.component = component;
		this.injections = injections;
        injections.reduce('init');
        this.component.props.year ? this.injections.reduce('update', {path: 'data.year',value:this.component.props.year}):null;
        this.component.props.year ? this.injections.reduce('update', {path: 'data.month',value:this.component.props.month}):null;
        this.component.props.year ? this.injections.reduce('update', {path: 'data.isTypesAll',value:this.component.props.isTypesAll}):null;
        this.component.props.userId ? this.metaAction.sf('data.userIds',[this.component.props.userId]):null;
        this.getpermission();
		let addEventListener = this.component.props.addEventListener;
		if (addEventListener) {
			addEventListener('onTabFocus', :: this.initPage)
        }
		this.initPage()
    };
    initPage = () => {
        // this.metaAction.sf('data.serviceCode', '1')
        // // this.metaAction.sf('data.nsqj', '')
        // let filterFormOld = this.metaAction.gf('data.filterFormOld').toJS()
        // this.metaAction.sf('data.filterForm', fromJS(filterFormOld))
        const pagination = this.metaAction.gf('data.pagination').toJS()
        pagination.currentPage = 1
        this.injections.reduce('update', {path: 'data.pagination',value:pagination})
        // this.metaAction.sf('data.inputVal', '')
        // this.getColumns()
        this.load()
        this.getgwVal();

    }

    // onTabFocus = () => {
    //     this.load()
    // }

    componentWillReceiveProps = async (nextProps) => {
        if( !isEqual(nextProps.month, this.component.props.month) || 
            !isEqual(nextProps.year, this.component.props.year) ||
            !isEqual(nextProps.userId, this.component.props.userId)){
            this.metaAction.sfs({
                'data.year':nextProps.year,
                'data.month':nextProps.month,
                'data.isTypesAll':nextProps.isTypesAll,
                'data.userIds':[nextProps.userId]
            })
            this.load();
        }

        if(!isEqual(nextProps.isRefresh, this.component.props.isRefresh)){
            this.injections.reduce('update', {path:'data.scrollRemember',value: true})
        }else{
            this.injections.reduce('update', {path:'data.scrollRemember',value: false})
        }
    }

    load = async () => {
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }

        this.initColumn()

        const pagination = this.metaAction.gf('data.pagination').toJS()//分页数据
        const inputVal = this.metaAction.gf('data.inputValue')//输入的客户名称或是助记码
        const vatTaxpayer = this.metaAction.gf('data.vatTaxpayer')//纳税人性质
        const shuifei = this.metaAction.gf('data.shuifei')//税费种
        const shenbaoState = this.metaAction.gf('data.shenbaoState')//申报状态
        const roleId = this.metaAction.gf('data.roleId')//岗位
        const userIds = this.metaAction.gf('data.userIds')//人员
        const isTypesAll = this.metaAction.gf('data.isTypesAll');
        const isText = this.metaAction.gf('data.isText');
        let date=new Date;
        let years=date.getFullYear();
        let months=date.getMonth()+1;
        months =(months<10 ? "0"+months:months);
        const year = this.metaAction.gf('data.year') == ''? years.toString() : this.metaAction.gf('data.year')//申报年份
        const month = this.metaAction.gf('data.month') == ''? months.toString() :this.metaAction.gf('data.month')//申报月份
        // const serviceCode = this.metaAction.gf('data.serviceCode')//正常客户和停用客户
        // const filterForm = this.metaAction.gf('data.filterForm').toJS()//隐藏筛选条件
        // console.log('我是筛选数据',filterForm.customerTypeStatus)

        /*.........左侧树权限start..........*/
        let type = this.metaAction.gf('data.checkedKeys.checked').toJS(),
            maxde = this.metaAction.gf('data.maxde'),
            types = 'self',
            all = this.metaAction.gf('data.other.permission.all')

        if(type.length != 0 && type.length){
            types = 'dept'
        }
        for (let i = 0;i<type.length;i++){
            if(type[i] == maxde  && all=="all"){
                types = 'all'
            }
        }
        this.injections.reduce('update', {path: 'data.treeType',value:types})
        isTypesAll ? types = 'all' : null;

        /*.........左侧树权限end..........*/

        /***********根据左侧树权限显示岗位和人员start******************/
        // if(types == 'self'){
        //     this.metaAction.sf('data.roleId',fromJS([]))
        // }else {
        //     this.metaAction.sf('data.userIds',fromJS([]))
        // }

        /***********根据左侧树权限显示岗位和人员end******************/

        let entity = {
            departments:type,
            type:types,
            serviceCode:'1',
            vatTaxpayer:vatTaxpayer,
            infoState:'9',
            sfdm:'',
            csdm:'',
            qxdm: '',
            name:inputVal,
            year:year,
            month:month,
            sfz:shuifei,
            sfzzt:shenbaoState,
            roleId:roleId,
            userIds:types=='self'?[]:userIds
        }
        const params = {
            entity:entity,
            page:{
                currentPage:pagination.currentPage,
                pageSize:pagination.pageSize
            }
        }
        const params1 = {
            entity:entity
        }
        let resp = await this.webapi.sbjd.querySBList(params)
        let allresp = await this.webapi.sbjd.getSbjzUserParams(params1)
        const qc = await this.webapi.sbjd.cxWscSbqcxx(params)
        if (!this.mounted) return
        if (resp) {   
            resp.list.map(item=>{
                item.isText = isText;
            })
            this.injections.reduce('update', {
                path: 'data.tableCheckbox',
                value: {
                    checkboxValue: [],
                    selectedOption: []
                }
            })
            this.injections.reduce('load', resp)

            setTimeout(() => {
                this.onResize()
                this.injections.reduce('tableLoading', false)
            }, 50) 

            let sysOrgDtoList = [];
            if(allresp.length>0){
                allresp.map(item=>{
                    let dataItem = {
                        orgId: item.orgId || '',
                        djxh: item.DJXH || '',
                        areaType: item.areaType || '',
                        swjgdm: item.swjgdm || '',
                        Infostatic: item.infostatic || ''
                    }  
                    sysOrgDtoList.push(dataItem);
                })
            }

            let params2 = {
                sysOrgDtoList:sysOrgDtoList,
                from:"sbjd"
            }
            const ret = await this.webapi.sbjd.getJzjdOrSbjdTj(params2);
            if(ret){
                this.metaAction.sfs({
                    'data.huizong.yiwanshui' : ret.sizeBySbAlready,
                    // 'data.huizong.yishenbao' : ret.ysb,
                    'data.huizong.weishenbao' : ret.sizeBySbNoFinish,
                    'data.huizong.wurenwu' : ret.sizeByjKNoStart,
                })
            }
        } else {
            this.injections.reduce('tableLoading', false)
        }
    }

    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll()
            }
        }, 200)
    }

    getQc = async () => {
        this.injections.reduce('tableLoading', true)
        const vatTaxpayer = this.metaAction.gf('data.vatTaxpayer'),//纳税人性质
              inputVal = this.metaAction.gf('data.inputValue'),//输入的客户名称或是助记码
              shuifei = this.metaAction.gf('data.shuifei'),//税费种
              shenbaoState = this.metaAction.gf('data.shenbaoState'),//申报状态
              roleId = this.metaAction.gf('data.roleId'),//岗位
              userIds = this.metaAction.gf('data.userIds'),//人员
              pagination = this.metaAction.gf('data.pagination').toJS(),
              isTypesAll = this.metaAction.gf('data.isTypesAll');
        let date=new Date,
            years=date.getFullYear(),
            months=date.getMonth()+1;
        months =(months<10 ? "0"+months:months);
        const year = this.metaAction.gf('data.year') == ''? years.toString() : this.metaAction.gf('data.year')//申报年份
        const month = this.metaAction.gf('data.month') == ''? months.toString() :this.metaAction.gf('data.month')//申报月份
        let type = this.metaAction.gf('data.checkedKeys.checked').toJS(),
        maxde = this.metaAction.gf('data.maxde'),
        types = 'self',
        all = this.metaAction.gf('data.other.permission.all')

        if(type.length != 0 && type.length){
            types = 'dept'
        }
        for (let i = 0;i<type.length;i++){
            if(type[i] == maxde  && all=="all"){
                types = 'all'
            }
        }
        this.injections.reduce('update', {path: 'data.treeType',value:types})
        isTypesAll ? types = 'all' : null;
        let entity = {
            departments:type,
            type:types,
            serviceCode:'1',
            vatTaxpayer:vatTaxpayer,
            infoState:'9',
            sfdm:'',
            csdm:'',
            qxdm: '',
            name:inputVal,
            year:year,
            month:month,
            sfz:shuifei,
            sfzzt:shenbaoState,
            roleId:roleId,
            userIds:types=='self'?[]:userIds
        }
        const params = {
            entity:entity,
            page:{
                currentPage:pagination.currentPage,
                pageSize:pagination.pageSize
            }
        }
        const qc = await this.webapi.sbjd.cxWscSbqcxx(params)
        this.injections.reduce('tableLoading', false)
        if(qc){
            console.log(qc,'3333')
            if (qc.wscSbqcCount > 0){
                await this.metaAction.modal('warning', {
                    content:(
                        <div>
                            <p>系统检测到有{qc.wscSbqcCount}个客户正在生成清册，该部分客户的税种状态请稍后刷新页面进行查看！</p>
                        </div>
                    ),
                    okText: '确定',
                });
            }
        }
    }

	getTableScroll = (type) => {
        try {
			let activeKey = this.metaAction.gf(`data.activeKey`)
			// let tableOption = this.metaAction.gf(`data.table${activeKey}.tableOption`).toJS()

            let dom = document.getElementsByClassName(`table${activeKey}`)[0]
            let tableDom,tableOption={}
            if (!dom) {
                // if (type) {
                //     return
                // }
                setTimeout(() => {
                    this.getTableScroll()
                }, 20)
            }
            tableDom = dom.getElementsByClassName('ant-table-tbody')[0];
            tableDom.scrollTop = 0;
            tableDom.scrollLeft = 0;

            let tableHeadDom = dom.getElementsByClassName('ant-table-thead')[0];
            if (tableDom && dom) {
                let num = dom.offsetHeight - tableDom.offsetHeight

                let number = tableHeadDom.offsetHeight
                if (num < (number+2)) {
                    const width = dom.offsetWidth
                    const height = dom.offsetHeight
                    tableOption = {
                        ...tableOption,
                        y: height - (number+2)
                    }
					// this.metaAction.sf(`data.tab${activeKey}.tableOption`, fromJS(tableOption))
					return tableOption
                } else { // 当数量太少 不用出现滚动条
					delete tableOption.y
					return tableOption
                    // this.metaAction.sf(`data.tab${activeKey}.tableOption`, fromJS(tableOption))
                }
            }
        } catch (err) {
            // console.log(err)
        }
	}


	checkboxChange = (arr, itemArr) => {
        this.injections.reduce('update', {path: 'data.test',value:itemArr})
        // console.log('數據ID',arr)
        // console.log('數據本身',itemArr)
        // debugger
        let newArr = []
        let argID = []//id
        let areaType = []//id
        let argOrgID = []//orgid
        arr.forEach(item => {
            if (item) {
                argID.push(item)
            }
        });
        itemArr.forEach(item => {
            if (item) {
                areaType.push(item.areaType)
            }
        });
        this.injections.reduce('update', {path: 'data.areaType',value:areaType})
        this.injections.reduce('update', {path: 'data.orgArr',value:argOrgID})
        itemArr.forEach( item => {
            if(item){
                argOrgID.push(item.orgId)
            }
        })
        let date=new Date;
        let years=date.getFullYear();
        let months=date.getMonth()+1;
        months =(months<10 ? "0"+months:months);
        let year =  this.metaAction.gf('data.year') == ''? years.toString() : this.metaAction.gf('data.year')//申报年份;
        let month = this.metaAction.gf('data.month') == ''? months.toString() :this.metaAction.gf('data.month')//申报月份;
        for (let i = 0;i < argOrgID.length; i++){
            let arg = {};
            arg.orgId = argOrgID[i];
            arg.areaType = areaType[i];
            arg.year = year;
            arg.month = month;
            newArr.push(arg)
        }
        // console.log('我是参数',newArr)
        this.injections.reduce('update', {path: 'data.updateState',value:newArr})
        let newItemArr = []

        itemArr.map(item => {
            if (item) {
                newItemArr.push(item)
            }
        })
        this.injections.reduce('update', {
            path: 'data.tableCheckbox',
            value: {
                checkboxValue: argID,
                selectedOption: newItemArr
            }
        })
        this.selectedOption = newItemArr

    }

    handleAClick = async (name,orgId,areaType) => {
        let date=new Date;
        let years=date.getFullYear();
        let months=date.getMonth()+1;
        months =(months<10 ? "0"+months:months);
        let year = this.metaAction.gf('data.year') == ''? years.toString() : this.metaAction.gf('data.year')//申报年份
        let month = this.metaAction.gf('data.month') == ''? months.toString() :this.metaAction.gf('data.month')//申报月份
        let appName = '';
        // console.log(typeof (year+'-'+month),'年月')
       if(areaType == '1'){//这个是跳云上电局的
           this.component.props.setGlobalContentWithDanhuMenu({
               pageName:name,
               name:'申报缴款',
               appName:'ttk-taxapply-app-electronic-tax',
               params:{linkCode: 12010, linkType: 'ysdj', requestType: 0, tjNd: year, tjYf: month},
               orgId:orgId
               // showHeader:true
           })
        }else {
            let dzCustomerName = '';
            let option = {
                agencyId:orgId,
                from:'sbjd'
            }
            const res = await this.webapi.sbjd.judgeUserMenuToDh(option);
            if(res && res.isEnable == 'Y'){
                appName = 'ttk-taxapply-app-taxlist'
                dzCustomerName = '申报缴款'
            }else{
                appName = 'edfx-app-portal'
                dzCustomerName = name
            }
           this.component.props.setGlobalContentWithDanhuMenu({
               pageName:name,
               name:dzCustomerName,
               appName: appName,
               // appName:'ttk-taxapply-app-electronic-tax',
               params:{defaultYearMonth:year+'-'+month},
               orgId:orgId
               // showHeader:true
           })
       }
    }
    
    renderTable = () => {
        const { checkboxValue } = this.metaAction.gf('data.tableCheckbox').toJS();
        const tableData = this.metaAction.gf("data.list").toJS(),
              tableSettingData = this.metaAction.gf('data.other.columnDto').toJS(),
              scrollRemember = this.metaAction.gf('data.scrollRemember'),
              scrollTop = this.metaAction.gf('data.scrollTop');
        return (
            <BovmsPurchaseTable
                className="ttk-es-app-taxdeclaration-Body"
                reLoad={this.initPage}
                data={tableData}
                webapi={this.webapi}
                metaAction={this.metaAction}
                store={this.component.props.store}
                checkboxChange={this.checkboxChange}
                selectedRowKeys={checkboxValue}
                setGlobalContentWithDanhuMenu={this.component.props.setGlobalContentWithDanhuMenu}
                showTableSetting={this.showTableSetting}
                handleAClick1={this.handleAClick}
                tableSettingData={tableSettingData}
                scrollTop={scrollTop}
                scrollRemember={scrollRemember}
            ></BovmsPurchaseTable>
        );
    }

    resetTableSetting = async ({ value, data }) => {
        // const columns = []
        // const serviceCode = this.metaAction.gf('data.serviceCode')
        // const pageID = serviceCode === '1' ? 'batchCustomGeneral' : 'batchCustomSmall'
        // for (const item of data) {
        //     item.isVisible ? columns.push(item.id) : null
        // }
        // const resp = await this.webapi.invoice.upDateColumn({
        //     pageID,
        //     columnjson: JSON.stringify(columns)
        // })
        // if (!this.mounted) return
        // if (resp) {
        //     this.getColumns()
        //     this.injections.reduce('tableSettingVisible', { value })
        // }

    }
    //关闭栏目设置
    closeTableSetting = () => {
        this.injections.reduce('tableSettingVisible', { value: false })
    }

	// 显示列设置
    showTableSetting = ({ value, data }) => {
        // const columns = this.metaAction.gf('data.other.columns').toJS()
        // this.injections.reduce('update', {path: 'data.other.columnDto',value:columns})
        this.injections.reduce('tableSettingVisible', { value })
    }
    saveTableSetting = async ({ value, data }) => {
        let isWhsyjsfyl = true, isKjgrsds = true;
        let newColumn = data.map(function (item) {
            if(item.fieldName == "whsyjsfyl"){
                isWhsyjsfyl = item.isVisible
            }else if(item.fieldName == "kjgrsds"){
                isKjgrsds = item.isVisible
            }
            return {
                isVisible:item.isVisible,
                id:item.id
            }
        })
        newColumn.push({
            isVisible:isWhsyjsfyl,
            id:60000100007
        },{
            isVisible:isKjgrsds,
            id:60000100011
        })
        let params = {
            columnDetails:newColumn,
            id:600001,
            ts:moment().format('YYYY-MM-DD hh:mm:ss')
        }

        const res = await this.webapi.sbjd.updateWithDetail(params)
        if(res&&res.isDefault){
            this.metaAction.toast('success', '修改成功')
        }
        this.injections.reduce('tableSettingVisible', { value })
        this.injections.reduce('update', {path: 'data.isSaveTableCol',value:true})
        await this.initColumn()
    }
    resetTableSetting = async () => {
        const reRes = await this.webapi.sbjd.reInitByUser({code:'declarationProgressList'})
        // console.info(reRes)
        if(reRes&&reRes.length>0&&reRes[0].isDefault){
            this.metaAction.toast('success', '重置成功')
        }
        this.injections.reduce('tableSettingVisible', { value:false })
        this.injections.reduce('update', {path: 'data.isSaveTableCol',value:true})
        this.initColumn()
    }
    getListRowsCount = () => {
		return this.metaAction.gf('data.list').size
	}

    dealColWidth = (newTableColumns) => {
        // const {width,height} = this.metaAction.gf('data.tableSize').toJS();
        // 1340为初始宽度，16为总列数
        if(width && width < 1340) {
            return width
        }
        
        let sumWidthOne = 0, col = [], num = 0, columnsSumWidth = 0, increment = 0;
        // if(!columnsData || !columnsData.length>0){
        //     col = columns
        //     num = 19
        // }else{
            // col = columnsData
            // col.map(item=>{
            //     if(item.children){
            //         item.children.map(el=>{
            //             columnsSumWidth += el.width
            //         })
            //         num += item.children.length
            //     }else{
            //         columnsSumWidth += item.width
            //         num++
            //     }
            // })
        // }
        increment = Math.floor((tableW - this.state.tableSize.width) / 19)
        // if(tableW){
        //     increment = Math.floor((tableW - this.state.tableSize.width) / num)
        // }else{
        //     columnsSumWidth += 50;
        //     increment = Math.floor((this.state.tableSize.width - columnsSumWidth) / num)
        // }
        for(const item of columns) {
            if(item.children) {
                for(const el of item.children) {
                    el.width += increment
                    sumWidthOne += el.width
                }
            } else if(item.dataIndex=='name'){
                item.width += increment*3
                sumWidthOne += item.width
            } else if(item.dataIndex=='helpCode' || item.dataIndex=='option'){
                sumWidthOne += item.width
            }else{
                item.width += increment
                sumWidthOne += item.width
            }
        }
        // if(tableW){
        //     return sumWidthOne+50
        // }else{
        //     return col
        // }   
        return sumWidthOne+50   
	}

    initColumn = async () => {
        const initRes = await this.webapi.sbjd.initColumn({listType:600001})
        let tableColumns =  []
        if(initRes){
            initRes.map(function (item) {
                if(item.fieldName != 'whsyjsfgg' && item.fieldName != 'scjygrsds'){
                    if(item.fieldName == 'whsyjsfyl'){
                        item.caption = '文化建设费'
                    }else if(item.fieldName == 'kjgrsds'){
                        item.caption = '个税'
                    }else if(item.fieldName == 'xfs'){
                        item.caption = '消费税'
                    }
                    let columnObj = {
                        id:item.id,
                        fieldName:item.fieldName,
                        fieldTitle:item.caption,
                        caption:item.caption,
                        isVisible:item.isVisible,
                        isMustSelect:item.isMustSelect,
                    }
                    tableColumns.push(columnObj)
                }
            })
        }
        tableColumns.push({id:60000199999, fieldName: 'option', fieldTitle: '操作', caption: '操作', isVisible:true, isMustSelect:true, width: 90})
        let item1 = tableColumns.splice(6,1);
        let item2 = tableColumns.splice(12,1);
        tableColumns.splice(7,0,item1[0])
        tableColumns.splice(8,0,item2[0])
        let newTableColumns = tableColumns.filter(item=>item.isVisible)
        this.metaAction.sfs({
            'data.other.tableColumns':fromJS(newTableColumns),
            'data.other.columns':fromJS(tableColumns),
            'data.other.columnDto': fromJS(tableColumns)
        })
    }

    renderPopover = () => {
        return <div className='popover'>
                    <div>
                        <div className='status-title'>单个税种状态：</div>
                        <div className='status-context'>
                            <Icon fontFamily='edficon' type='XDZzhuangtai-yiwancheng' className='yiwancheng'/>
                            已完成
                            <span className='boldText'>: 已申报已缴款</span>
                        </div>
                        <div className='status-context'><Icon fontFamily='edficon' type='XDZzhuangtai-yishenbao' className='yishenbao'/>
                            已申报
                            <span className='boldText'>: 已申报未缴款</span>
                        </div>
                        <div className='status-context'><Icon fontFamily='edficon' type='XDZzhuangtai-wurenwu' className='weishenbao'/>
                            未申报
                            <span className='boldText'>: 未申报未缴款</span>
                        </div>
                        <div className='status-context'>
                            <span className='boldText' style={{marginLeft:'52px'}}>空 : 无任务</span>
                        </div>
                    </div>
                    <div>
                        <div className='status-title'>汇总状态：</div>
                        <div className='status-context'><Icon fontFamily='edficon' type='XDZzhuangtai-yiwancheng' className='yiwancheng'/>
                            已完成
                            <span className='boldText'>: 所有税种均已申报已缴款</span>
                        </div>
                        <div className='status-context'><Icon fontFamily='edficon' type='XDZzhuangtai-wurenwu' className='weishenbao'/>
                            <span className='boldText' style={{margin:'0px'}}>未完成 ：存在未申报或未缴款税种</span>
                        </div>
                        <div className='status-context'>
                            <span className='boldText' style={{marginLeft:'52px'}}>空 : 无任务</span>
                        </div>
                    </div> 
                </div>
    }


    handleConfirm = (data) => {
        //权限管理点击确认
        // console.log(data);
    }
    handleReset = (data) => {
        //权限管理点击重置
        // console.log(data)
    }

    //分配给我的、公司的客户、部门的客户
    renderTree = () => {

        let permission = this.metaAction.gf('data.other.permission').toJS();
        let showbm = this.metaAction.gf('data.showbm');
        this.injections.reduce('update', {path: 'data.ifgs',value:permission.all ? '公司的客户' : '部门的客户'})

        return <RenderTree
            treeData={permission.treeData || []}
            title={permission.all ? '公司的客户' : '部门的客户'}
            // self={permission.self || '分配我的客户'}
            self={showbm}
            setData = {this.setData}
            onConfirm={this.handleConfirm}
            onReset={this.handleReset}
            getgwVal = {this.getgwVal}
        />
    }
    handleConfirm = (data) => {
        //权限管理点击确认
        this.injections.reduce('update', {path: 'data.checkedKeys.checked',value:data})
        this.injections.reduce('update', {path: 'data.isTypesAll',value:false})
        this.load();
    }
    handleReset = (data) => {
        //权限管理点击重置
        this.injections.reduce('update', {path: 'data.checkedKeys.checked',value:data})
        this.injections.reduce('update', {path: 'data.isTypesAll',value:false})
        this.load();
    }

    getgwVal = async () =>{
        let type = this.metaAction.gf('data.checkedKeys.checked').toJS(),
            maxde = this.metaAction.gf('data.maxde'),
            types = 'self',
            all = this.metaAction.gf('data.other.permission.all')

        if(type.length != 0 && type.length){
            types = 'dept'
        }
        for (let i = 0;i<type.length;i++){
            if(type[i] == maxde && all == 'all'){
                types = 'all'
            }
        }
        let option ={
            "departments":type,
            "type":types,//"all"
        }

        let list = [
            {
                id:'',
                postName:'全部'
            }
        ]
        let res = await this.webapi.sbjd.getgwxx(option)
        list = list.concat(res)
        // debugger
        this.injections.reduce('update', {path: 'data.gwoption',value:list})

    }
    getrenderVal = () =>{
        let res = this.metaAction.gf('data.gwoption').toJS();
        // console.log('我是',res)
        return res
    }
    getTreeType = () =>{
        let res = this.metaAction.gf('data.treeType')
        // console.log('我是',res)
        return res
    }
    getYear = () =>{
        let res = this.metaAction.gf('data.year')
        // console.log('我是',res)
        return res
    }
    getMonths = () =>{
        let res = this.metaAction.gf('data.month')
        // console.log('我是',res)
        return res
    }
    getRoleId = () =>{
        let res = this.metaAction.gf('data.roleId')
        // console.log('我是',res)
        return res
    }
    getpersonVal = () =>{
        let res = this.metaAction.gf('data.users')
        return res
    }

    getpermission = async () =>{
        let params = {
            // orgId:6896858486553600,
            // userId:""
        }

        // console.log(renderTreeComponent.props)
        //debugger
        const res = await this.webapi.sbjd.getfpkh(params)
        if(res && res.body){
			this.metaAction.sfs({
				'data.other.permission.treeData':res.body.bmxx,
				'data.other.permission.all':res.body.all,
				// 'data.other.permission.self':res.body.self
			})
			if(res.body.bmxx && Array.isArray(res.body.bmxx) && res.body.bmxx.length > 0){
				let maxdeValue = res.body.bmxx[0].bmdm || '';
				this.injections.reduce('update',{path:'data.maxde',value:maxdeValue});
			}
		}
    }

    changeText = () => {
        let tableData = this.metaAction.gf("data.list").toJS();
        tableData.map(item=>{
            item.isText = true;
        })
        this.metaAction.sfs({
            'data.list':fromJS(tableData),
            'data.isText':true
        })
    }
    changeIcon = () => {
        let tableData = this.metaAction.gf("data.list").toJS();
        tableData.map(item=>{
            item.isText = false;
        })
        this.metaAction.sfs({
            'data.list':fromJS(tableData),
            'data.isText':false
        })
    }

    renderInput = () => {
        return <CustomerClass
            handleSelectPerson={this.handleSelectPerson}
            load = {this.load}
            setData = {this.setData}
            getrenderVal={this.getrenderVal}
            getpersonVal={this.getpersonVal}
            getRoleId = {this.getRoleId}
            getTreeType={this.getTreeType}
            getYear={this.getYear}
            getMonths={this.getMonths}
        />
    }

    setData = (path,val) =>{
        this.metaAction.sf(path,val)
    }


    handleSelectPerson = async() => {
        const ret = await this.metaAction.modal('show', {
            title: '选择人员',
            wrapClassName: 'selectPerson-card',
            width: 490,
            children: this.metaAction.loadApp('ttk-es-app-seluser', {
                store: this.component.props.store,
            }),
        })

        // console.log(ret, 'ret')

        if (ret) return ret
    }

    handleRefreshState = async() => {//状态更新
        // console.log(2222)

        // const ret = await this.metaAction.modal('show', {
        //     title: '更新状态',
        //     width: 570,
        //     wrapClassName: 'UpdateStatus',
        //     children: <UpdateStatus />
        // })
        const { checkboxValue } = this.metaAction.gf('data.tableCheckbox').toJS()
        if(checkboxValue && checkboxValue.length === 0){
            message.warning('请先选择客户！')
            return
        }else {
            await this.getQc();//拉取清册
            this.injections.reduce('tableLoading', true)
            let data = this.metaAction.gf('data.updateState').toJS();
            // console.log('我是更新状态',data)
            let res =await this.webapi.sbjd.updateState(data)
            // console.log(res,'res')
            // if (res) {
                // let result = await this.webapi.sbjd.updateList({sequenceNo: res},5000)
                let result = await this.webapi.sbjd.updateStateReturn()
                // console.log(result, 'result');
                this.injections.reduce('tableLoading', false)

                let list = result.list
                const ret = await this.metaAction.modal('show', {
                    title: '更新状态',
                    className: 'ttk-es-app-taxdeclaration-update-progress-modal',
                    wrapClassName: 'card-archive',
                    width: 500,
                    height: 500,
                    footer:null,
                    children: this.metaAction.loadApp('ttk-es-app-taxdeclaration-update-progress', {
                        store: this.component.props.store,
                        list:list
                    })
                });
                this.load();
            // }
        }
    }

    componentDidMount = () => {
        this.mounted = true
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }
    }
    componentWillUnmount = () => {
        this.mounted = false
        const win = window
        if (win.removeEventListener) {
            win.removeEventListener('resize', this.onResize, false)
            document.removeEventListener('keydown', this.keyDown, false)
        } else if (win.detachEvent) {
            win.detachEvent('onresize', this.onResize)
            document.detachEvent('keydown', this.keyDown)
        } else {
            win.onresize = undefined
        }
    }

    //分页发生变化
    pageChanged = (current, pageSize) => {
        let { pagination, list } = this.metaAction.gf('data').toJS()
        const len = list.length
        if (pageSize) {
            pagination = {
                ...pagination,
                'currentPage': len === 0 ? 1 : current,
                'pageSize': pageSize
            }
        } else {
            pagination = {
                ...pagination,
                'currentPage': len === 0 ? 1 : current,
            }
        }
        this.injections.reduce('tableLoading', true)
        this.injections.reduce('update', {path: 'data.pagination',value:pagination})
        this.load()

    }

    addClick = async () => {
        const pagination = this.metaAction.gf('data.pagination').toJS(),//分页数据
              inputVal = this.metaAction.gf('data.inputValue'),//输入的客户名称或是助记码
              vatTaxpayer = this.metaAction.gf('data.vatTaxpayer'),//纳税人性质
              shuifei = this.metaAction.gf('data.shuifei'),//税费种
              shenbaoState = this.metaAction.gf('data.shenbaoState'),//申报状态
              roleId = this.metaAction.gf('data.roleId'),//岗位
              userIds = this.metaAction.gf('data.userIds'),//人员
              isTypesAll = this.metaAction.gf('data.isTypesAll');
        let date=new Date;
        let years=date.getFullYear();
        let months=date.getMonth()+1;
        months =(months<10 ? "0"+months:months);
        const year = this.metaAction.gf('data.year') == ''? years.toString() : this.metaAction.gf('data.year')//申报年份
        const month = this.metaAction.gf('data.month') == ''? months.toString() :this.metaAction.gf('data.month')//申报月份

        /*.........左侧树权限start..........*/
        let type = this.metaAction.gf('data.checkedKeys.checked').toJS(),
            types = this.metaAction.gf('data.treeType');
        isTypesAll ? types = 'all' : null;
        const option = {
            entity:{
                departments:type,
                type:types,
                serviceCode:'1',
                vatTaxpayer:vatTaxpayer,
                infoState:'9',
                sfdm:'',
                csdm:'',
                qxdm: '',
                name:inputVal,
                year:year,
                month:month,
                sfz:shuifei,
                sfzzt:shenbaoState,
                roleId:roleId,
                userIds:types=='self'?[]:userIds
            },
            page:{
                currentPage:1,
                pageSize:100000
            }
        }

        const res = await this.webapi.sbjd.exportSbjdList(option);
    }

}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...o };
	metaAction.config({ metaHandlers: ret });
	return ret;
}
