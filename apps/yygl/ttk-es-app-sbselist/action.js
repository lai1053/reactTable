import React from 'react';
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
import { fromJS } from 'immutable';
import config from './config';
import extend from './extend';
import { Icon } from 'edf-component';
import RenderTree from './component/RenderTree';
import CustomerClass from './component/CustomerClass';
import UpdateStatus from './component/UpdateStatus';
import moment from 'moment'
import isEqual from 'lodash.isequal';
import Vtable from './component/vtable';

class action {
	constructor(option) {
		this.metaAction = option.metaAction;
		this.extendAction = option.extendAction;
		this.config = config.current;
        this.webapi = this.config.webapi;
        this.tableRef = React.createRef();
	}

	onInit = ({ component, injections }) => {
		this.extendAction.gridAction.onInit({ component, injections });
		this.component = component;
		this.injections = injections;
		injections.reduce('init');
        this.component.props.year ? this.injections.reduce('update', {path: 'data.year',value:this.component.props.year}):null;
        this.component.props.year ? this.injections.reduce('update', {path: 'data.month',value:this.component.props.month}):null;
        this.component.props.year ? this.injections.reduce('update', {path: 'data.isTypesAll',value:this.component.props.isTypesAll}):null;
        this.component.props.userId ? this.metaAction.sf('data.persioniL',[this.component.props.userId]):null;
        const pagination = this.metaAction.gf('data.pagination').toJS()
        pagination.currentPage = 1
        this.injections.reduce('update', {path: 'data.pagination',value:pagination});
		this.load();
        this.getgwVal();
		this.getpermission()
    };
    componentDidMount = () => {
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }
        this.onResize()
    }

    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
            document.removeEventListener('keydown', this.keyDown, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
            document.detachEvent('keydown', this.keyDown)
        } else {
            window.onresize = undefined
        }
    }

    //重新计算宽高
    onResize = ()=>{
        const ele = document.querySelector('.ttk-es-app-sbselist-tablediv')
        if(ele){
            const tableW = ele && ele.offsetWidth || 0
            const tableH = ele && ele.offsetHeight || 0
            const obj = {tableW, tableH}
            this.metaAction.sf('data.obj', fromJS(obj))
        }else{
            setTimeout(() => {
                this.onResize()
            }, 100)
            return
        }
	}

    componentWillReceiveProps = async (nextProps) => {
        if( !isEqual(nextProps.month, this.component.props.month) || 
            !isEqual(nextProps.year, this.component.props.year) ||
            !isEqual(nextProps.userId, this.component.props.userId)){
            this.metaAction.sfs({
                'data.year':nextProps.year,
                'data.month':nextProps.month,
                'data.isTypesAll':nextProps.isTypesAll,
                'data.persioniL':[nextProps.userId]
            })
            this.load();
        }

        if(!isEqual(nextProps.isRefresh, this.component.props.isRefresh)){
            this.injections.reduce('update', {path:'data.scrollRemember',value: true})
        }else{
            this.injections.reduce('update', {path:'data.scrollRemember',value: false})
        }
    }

    load = async() => {
        this.injections.reduce('tableLoading', true)
        this.initColumn()
        const pagination = this.metaAction.gf('data.pagination').toJS()//分页数据
        let type = this.metaAction.gf('data.checkedKeys.checked').toJS(),
            maxde = this.metaAction.gf('data.maxde'),
            types = 'self',
            all = this.metaAction.gf('data.other.permission.all'),
            vatTaxpayer= this.metaAction.gf('data.vatTaxpayer'),//客户分类
            iptval= this.metaAction.gf('data.iptval'),//客户分类
            persioniL= this.metaAction.gf('data.persioniL'),//persioniL
            gwVal= this.metaAction.gf('data.gwVal'),//gwVal
            isTypesAll = this.metaAction.gf('data.isTypesAll');
        //     seachtext= this.metaAction.gf('data.inputval'),
        //     year= this.metaAction.gf('data.ndValue'),//年度
        //     month= this.metaAction.gf('data.yfValue'),//月份
        //     state= this.metaAction.gf('data.jizztValue'),//记账状态
        //     jzztValue= this.metaAction.gf('data.jzztValue'),//建账状态
        //

        let date=new Date;
        let years=date.getFullYear();
        let months=date.getMonth()+1;
        months =(months<10 ? "0"+months:months);
        const year = this.metaAction.gf('data.year') == ''? years.toString() : this.metaAction.gf('data.year')//申报年份
        const month = this.metaAction.gf('data.month') == ''? months.toString() :this.metaAction.gf('data.month')//申报月份

        if(type.length != 0 && type.length){
            types = 'dept'
        }
        for (let i = 0;i<type.length;i++){
            if(type[i] == maxde && all == 'all'){
                types = 'all'
            }
        }

        this.injections.reduce('update', {path: 'data.treeType',value:types});
        isTypesAll ? types = 'all' : null;
        let option ={
            "entity":
                {
                    "departments":type,
                    "type":types,//"all"
                    "year":year,
                    "month":month,
                    "seachtext":iptval,
                    "roleId":gwVal,
                    "vatTaxpayer":vatTaxpayer,
                    "personId":types=='self'?[]:persioniL
                },
            "page": {
                currentPage:pagination.currentPage,
                pageSize:pagination.pageSize
            }
        }
        let option1 =  {
            "entity": {
                departments:type,
                type:types,//"all"
                serviceCode:'1',
                infoState:'9',
                sfdm:'',
                csdm:'',
                qxdm: '',
                name: '',
                year:year,
                month:month,
                // seachtext:iptval,
                sfz: '',
                sfzzt: '',
                roleId:gwVal,
                vatTaxpayer:vatTaxpayer,
                userIds:types=='self'?[]:persioniL,
            },
            "page": {
                currentPage:pagination.currentPage,
                pageSize:pagination.pageSize
            }
        };
        const res = await this.webapi.getSbse(option)
        const qc = await this.webapi.cxWscSbqcxx(option1)
        this.injections.reduce('tableLoading', false)
        this.injections.reduce('update', {path: 'data.list',value:res.list});
        this.injections.reduce('update', {path: 'data.pagination',value:res.page});
        this.injections.reduce('update', {path: 'data.isTypesAll',value:false});
    };

    addClick =async () =>{
        const pagination = this.metaAction.gf('data.pagination').toJS()//分页数据
        let type = this.metaAction.gf('data.checkedKeys.checked').toJS(),
            maxde = this.metaAction.gf('data.maxde'),
            types = 'self',
            all = this.metaAction.gf('data.other.permission.all'),
            vatTaxpayer= this.metaAction.gf('data.vatTaxpayer'),//客户分类
            iptval= this.metaAction.gf('data.iptval'),//客户分类
            gwVal= this.metaAction.gf('data.gwVal'),//gwVal
            persioniL= this.metaAction.gf('data.persioniL')//persioniL
        //     seachtext= this.metaAction.gf('data.inputval'),
        //     year= this.metaAction.gf('data.ndValue'),//年度
        //     month= this.metaAction.gf('data.yfValue'),//月份
        //     state= this.metaAction.gf('data.jizztValue'),//记账状态
        //     jzztValue= this.metaAction.gf('data.jzztValue'),//建账状态
        //

        let date=new Date;
        let years=date.getFullYear();
        let months=date.getMonth()+1;
        months =(months<10 ? "0"+months:months);
        const year = this.metaAction.gf('data.year') == ''? years.toString() : this.metaAction.gf('data.year')//申报年份
        const month = this.metaAction.gf('data.month') == ''? months.toString() :this.metaAction.gf('data.month')//申报月份

        if(type.length != 0 && type.length){
            types = 'dept'
        }
        for (let i = 0;i<type.length;i++){
            if(type[i] == maxde && all == 'all'){
                types = 'all'
            }
        }
        this.injections.reduce('update', {path: 'data.treeType',value:types});
        const option ={
            "entity":
                {
                    "departments":type,
                    "type":types,//"all"
                    "year":year,
                    "month":month,
                    "seachtext":iptval,
                    "roleId":gwVal,
                    "vatTaxpayer":vatTaxpayer,
                    "personId":types=='self'?[]:persioniL
                },
            "page": {
                currentPage:pagination.currentPage,
                pageSize:pagination.pageSize
            }
        }

        const res = await this.webapi.exportSbse(option)

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


	checkboxChange = () => {

	}

    //跳转单户带菜单
    handleAClick = async (dzCustomerOrgId,dzCustomerName) =>{
        let date=new Date;
        let years=date.getFullYear();
        let months=date.getMonth()+1;
        months =(months<10 ? "0"+months:months);
        const year = this.metaAction.gf('data.year') == ''? years.toString() : this.metaAction.gf('data.year')//申报年份
        const month = this.metaAction.gf('data.month') == ''? months.toString() :this.metaAction.gf('data.month')//申报月份
        // console.log(year,month)
        let appName = '',name='';
        let option = {
            agencyId:dzCustomerOrgId,
            from:'sbjd'
        }
        const res = await this.webapi.judgeUserMenuToDh(option);
        if(res && res.isEnable == 'Y'){
            appName = 'ttk-tax-app-declaration-tax-xdz'
            name = '申报台账'
        }else{
            appName = 'edfx-app-portal'
            name = dzCustomerName
        }
        this.component.props.setGlobalContentWithDanhuMenu({
            pageName:dzCustomerName,
            name:name,
            appName:appName,
            params:{tjNd:year,tjYf:month},
            orgId:dzCustomerOrgId,
        })
    }

	handleRenderText = (name, rowData, index) => {
        if(name == 'name' || name == 'code') {
            return <div title={rowData[name]}
            style={{
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow:'hidden'}}>{rowData[name]}</div>
        } else {
            if (name == 'option') {
                return <a href='javascript:;' onClick={() => this.handleAClick(rowData['orgId'],rowData['name'])}>查看</a>
            }else if(name == 'name' || name == 'zjm'){
                return <div style={{ display: 'block', textAlign:'left'}} onClick={() => this.opense(name,rowData)}>{rowData[name]}</div>//color:'#1f7fbf',textAlign:"right",
            } else {
                let num = rowData[name]
                let num2 = null
                if(!num&&num!==0){//如果值为空，就不显示，如果为0或是其它数字，就格式化两位
                    num2 = ''
                }else{
                    num2 = Number(num).toFixed(2)
                }
                return <a style={{ display: 'block', textAlign:'right'}} onClick={() => this.opense(name,rowData)} title={num2}>{num2}</a>//color:'#1f7fbf',textAlign:"right",
                
            }
        }
    }
    
    opense = async (name,rowData) => {
        const orgId = rowData.orgId;
        let date=new Date;
        let years=date.getFullYear();
        let months=date.getMonth()+1;
        months =(months<10 ? "0"+months:months);
        const year = this.metaAction.gf('data.year') == ''? years.toString() : this.metaAction.gf('data.year')//申报年份
        const month = this.metaAction.gf('data.month') == ''? months.toString() :this.metaAction.gf('data.month')//申报月份
        const href = window.location.href;
        // let sbywbm = '';
        // sbywbmsData.map(item=>{
        //     if(item.id == name){
        //         sbywbm = item.sbywbm
        //     }
        // })
        if(name == 'cswhjsf' || name == 'jyffj' || name == 'dfjyffj'){
            name = 'fjs'
        }
        let option = {
            linkCode:'1203010',
            linkType:'ysdj',
            sourceType:'0',
            requestType:'0',
            requestUrl:href,
            tjNd:year,
            tjYf:month,
            ywlx:'1',
            sbywbm:name,
            orgId:orgId
        }        
        let url = await this.webapi.getSbtzJkxxUrl(option);
        url = url ? window.location.protocol+'//'+url : url
        if(url){
            window.open(url,'_blank');
        }
    }

    //表头渲染
	renderColumns =()=> {
        const columns = this.metaAction.gf('data.other.tableColumns').toJS()

		const resArr = []

		columns.forEach((item, index) => {
            if(item.children){
                const child = [] // 多表头
                item.children.map(subItem=>{
                    child.push({
                        title: subItem.caption,
                        dataIndex: subItem.fieldName,
                        key: subItem.fieldName,
                        width: subItem.width,
                        align: 'left',
                        // flexGrow: 1,
                        render: (text, v, index) => {
                            return this.handleRenderText(subItem.fieldName, v, index)
                        }
                    })
                })
                resArr.push({
                    title: item.caption,
                    align: 'center',
                    children: child,
                    // flexGrow: 1,
                })
            }else{
                let obj = {
                    name: item.fieldName,
                    title: item.fieldName== 'option' ? (
                        <div>
                            <span>{item.caption}</span>
                            <Icon
                                name="columnset"
                                fontFamily='edficon'
                                className='columnset'
                                type='shezhi'
                                onClick={() => this.showTableSetting({ value: true })}
                            />
                        </div>
                    ): item.caption,
                    dataIndex: item.fieldName,
                    width: item.width,
                    key: item.fieldName,
                    align: item.fieldName == 'name'? 'left':'center',
                    flexGrow: item.fieldName == 'name' || item.fieldName == 'option'? 0:1,
                    render: (text, v, index) => {return this.handleRenderText(item.fieldName, v, index)}
                }
                if(item.fieldName == 'option'){
                    obj.fixed = 'right'
                }
    
                resArr.push(obj)
            }
		})

		return resArr
    }
    
    //表格渲染
    renderVTable = () => {
        const _tableSource = this.metaAction.gf('data.list').toJS(),
              _tableSize = this.metaAction.gf('data.obj').toJS(),
              _scrollTop = this.metaAction.gf('data.scrollTop'),
              _scrollRemember = this.metaAction.gf('data.scrollRemember'),
              _columns = this.renderColumns();
        return <Vtable
            ref={this.tableRef}
            metaAction={this.metaAction}
            tableSize={_tableSize}
            tableSource={_tableSource}
            columns={_columns}
            scrollTop={_scrollTop}
            scrollRemember={_scrollRemember}
        />
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
        // this.injections.reduce('tableLoading', true)
        this.injections.reduce('update', {path: 'data.pagination',value:pagination});
        this.load()

    }
    //隐藏列设置
	closeTableSetting = () => {
        this.injections.reduce('tableSettingVisible', { value: false })
    }
    //显示列设置
	showTableSetting = async ({ value, data }) => {
        // const columns = this.metaAction.gf('data.other.columns').toJS()
        // console.log(columns);
        // this.injections.reduce('update', {path: 'data.other.columnDto',value:columns});
        this.injections.reduce('tableSettingVisible', { value })
    }
    //保存列设置
    saveTableSetting = async ({ value, data }) => {
        let isWhsyjsfyl = true, isScjygrsds = true;
        let newColumn = data.map(function (item) {
            if(item.fieldName == "whsyjsfyl"){
                isWhsyjsfyl = item.isVisible
            }else if(item.fieldName == "scjygrsds"){
                isScjygrsds = item.isVisible
            }
            return {
                isVisible:item.isVisible,
                id:item.id
            }
        })
        newColumn.push({
            isVisible:isWhsyjsfyl,
            id:60000200007
        },{
            isVisible:isScjygrsds,
            id:60000200008
        })
        let params = {
            columnDetails:newColumn,
            id:600002,
            ts:moment().format('YYYY-MM-DD hh:mm:ss')
        }

        const res = await this.webapi.updateWithDetail(params)
        if(res&&res.isDefault){
            this.metaAction.toast('success', '修改成功')
        }
        this.injections.reduce('tableSettingVisible', { value })
        await this.initColumn()
       /* const columns = this.metaAction.gf('data.other.columns').toJS()
        this.metaAction.sf('data.other.columnDto', fromJS(columns))
        this.metaAction.sf('data.other.columns', fromJS(data))
        let newTableColumns = data.filter(item=>item.isVisible)
        this.metaAction.sf('data.other.tableColumns', fromJS(newTableColumns))
        this.injections.reduce('tableSettingVisible', { value })*/
    }
    //重置列设置
    resetTableSetting = async () => {
        const reRes = await this.webapi.reInitByUser({code:'declarationTaxList'})
        // console.info(reRes)
        if(reRes&&reRes.length>0&&reRes[0].isDefault){
            this.metaAction.toast('success', '重置成功')
        }
        this.injections.reduce('tableSettingVisible', { value:false })
        this.initColumn()
    }

    //初始化表头
    initColumn = async () => {
        const initRes = await this.webapi.initColumn({listType:600002})
        let tableColumns =  []
        let columns = [
            {
                caption: "客户名称",
                fieldName: "name",
                width: 218,
            },{
                caption: "助记码",
                fieldName: "zjm",
                width: 60,
            },{
                caption: "增值税",
                fieldName: "zzs",
                width: 70,
            },{
                caption: "附加税（费）",
                fieldName: "fjs",
                children:[
                    {
                        caption: "城建税",
                        fieldName: "cswhjsf",
                        width: 70,
                    },{
                        caption: "教育附加",
                        fieldName: "jyffj",
                        width: 70,
                    },{
                        caption: "地方附加",
                        fieldName: "dfjyffj",
                        width: 70,
                    }
                ]

            },{
                caption: "印花税",
                fieldName: "yhs",
                width: 70,
            },{
                caption: "文化建设费",
                fieldName: "whsyjsfyl",
                children:[
                    {
                        caption: "娱乐",
                        fieldName: "whsyjsfyl",
                        width: 70,
                    },{
                        caption: "广告",
                        fieldName: "whsyjsfgg",
                        width: 70,
                    }
                ]
            },{
                caption: "企业所得税",
                fieldName: "qysds",
                width: 70,
            },{
                caption: "个税",
                fieldName: "scjygrsds",
                children:[
                    {
                        caption: "代扣代缴",
                        fieldName: "kjgrsds",
                        width: 70,  
                    },{
                        caption: "生产经营",
                        fieldName: "scjygrsds",
                        width: 70,
                    }
                ]
            },{
                caption: "消费税",
                fieldName: "xfs",
                width: 70,
            },{
                caption: "残保金",
                fieldName: "cbj",
                width: 70,
            },{
                caption: '水利基金',
                fieldName: "sljj",
                width: 70,
            },{
                caption: "工会经费",
                fieldName: "ghjf",
                width: 70,
            }
        ]
        if(initRes){
            initRes.map((item,index)=>{
                let cell = columns.find(el => item.fieldName == el.fieldName)
                if(cell){
                    cell.id = item.id
                    cell.isVisible = item.isVisible
                    cell.isMustSelect = item.isMustSelect
                    tableColumns.push(cell)
                }
            })
        }
        tableColumns.push({id:60000299999, fieldName: 'option', fieldTitle: '操作', caption: '操作', isVisible:true, isMustSelect:true, width: 70})
        let item = tableColumns.splice(11,1);
        tableColumns.splice(8,0,item[0]);
        let newTableColumns = tableColumns.filter(item=>item.isVisible) 
        this.metaAction.sfs({
            'data.other.tableColumns':fromJS(newTableColumns),
            'data.other.columns':fromJS(tableColumns),
            'data.other.columnDto': fromJS(tableColumns)
        })
    }

    renderPopover = () => {
        return <div className='popover'>
            <span><Icon
            fontFamily='edficon'
            type='XDZzhuangtai-yiwancheng'
            className='yiwancheng'/>已完成</span>
            <span><Icon fontFamily='edficon' type='XDZzhuangtai-yishenbao' className='yishenbao'/>已申报</span>
            <span><Icon fontFamily='edficon' type='XDZzhuangtai-wurenwu' className='weishenbao'/>未申报</span>
            <span><Icon fontFamily='edficon' type='XDZzhuangtai-weishenbao' className='wurenwu'/>无任务</span>
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

    getpermission = async () =>{
        let params = {
            // orgId:6896858486553600,
            // userId:"313272023784706048"
        }

        // console.log(renderTreeComponent.props)
        const res = await this.webapi.getfpkh(params)
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

    renderTree = () => {

        let permission = this.metaAction.gf('data.other.permission').toJS();
        let showbm = this.metaAction.gf('data.showbm');
        this.injections.reduce('update', {path: 'data.ifgs',value:permission.all ? '公司的客户' : '部门的客户'});

        return <RenderTree
            treeData={permission.treeData || []}
            title={permission.all ? '公司的客户' : '部门的客户'}
            // self={permission.self || '分配我的客户'}
            self={showbm}
            setData = {this.setData}
            onConfirm={this.handleConfirm}
            onReset={this.handleReset}
            // setmda={this.setmda}
        />
    }
    // setmda =(path,val)=>{
    //     this.metaAction.sf(path,val)
    //     // console.log(this.metaAction.gf('data.checkedKeys.checked'))
    // }
    handleConfirm = (e) => {
        //确定
        this.injections.reduce('update', {path: 'data.checkedKeys.checked',value:e});
        let checked=this.metaAction.gf('data.checkedKeys.checked').toJS();
        let ifgs = this.metaAction.gf('data.ifgs')
        this.load();
        this.getgwVal();
    }
    handleDropDownClick = () => {
        let visible = this.state.visible;
        this.setState({
            visible: !visible
        })
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
        let res = await this.webapi.getgwxx(option)
        list = list.concat(res)
        this.injections.reduce('update', {path: 'data.gwoption',value:list});

    }
    getrenderVal = () =>{
        let res = this.metaAction.gf('data.gwoption').toJS();
        return res
    }

    getpersonVal = () =>{
        let res = this.metaAction.gf('data.persioniLs')
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
        let res = this.metaAction.gf('data.gwVal')
        // console.log('我是',res)
        return res
    }

    renderInput = () => {
        return <CustomerClass
            setData = {this.setData}
            load = {this.load}
            getrenderVal={this.getrenderVal}
            getpersonVal={this.getpersonVal}
            handleSelectPerson={this.handleSelectPerson}
            getRoleId = {this.getRoleId}
            getTreeType={this.getTreeType}
            getYear={this.getYear}
            getMonths={this.getMonths}
        />
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
        // console.log(ret)

        if (ret) return ret
    }
    setData = (path,val) =>{
        this.metaAction.sf(path,val)
    }

    handleRefreshState = async() => {
        // console.log(2222)

        const ret = await this.metaAction.modal('show', {
            title: '更新状态',
            width: 570,
            wrapClassName: 'UpdateStatus',
            children: <UpdateStatus />
        })
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
