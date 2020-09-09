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
		// let addEventListener = this.component.props.addEventListener;
		// if (addEventListener) {
		// 	addEventListener('onTabFocus', :: this.onTabFocus)
		// }
        // this.metaAction
        const pagination = this.metaAction.gf('data.pagination').toJS()
        pagination.currentPage = 1
        this.injections.reduce('update', {path: 'data.pagination',value:pagination});
        this.component.props.year ? this.injections.reduce('update', {path: 'data.ndValue',value:this.component.props.year}):null;
        this.component.props.year ? this.injections.reduce('update', {path: 'data.yfValue',value:this.component.props.month}):null;
        this.component.props.year ? this.injections.reduce('update', {path: 'data.isTypesAll',value:this.component.props.isTypesAll}):null;
        this.component.props.userId ? this.metaAction.sf('data.persioniL',[this.component.props.userId]):null;
		this.load()
        this.getpermission()
        this.getgwVal()
    };
    
    componentWillReceiveProps = async (nextProps) => {
        if( !isEqual(nextProps.month, this.component.props.month) || 
            !isEqual(nextProps.year, this.component.props.year) ||
            !isEqual(nextProps.userId, this.component.props.userId)){
            // console.log('刷新');
            this.metaAction.sfs({
                'data.ndValue':nextProps.year,
                'data.yfValue':nextProps.month,
                'data.isTypesAll':nextProps.isTypesAll,
                'data.persioniL':[nextProps.userId]
            })
            this.load();
        }
    }

	load = async() => {
       
        this.injections.reduce('tableLoading', true)
        // this.getFinishValue()//获取完成标志
	    const pagination = this.metaAction.gf('data.pagination').toJS()//分页数据
	    let finishmark= await this.getFinishValue(),//获取完成标志
            seachtext= this.metaAction.gf('data.inputval'),
            customers= this.metaAction.gf('data.customers'),//客户分类
            year= parseInt(this.metaAction.gf('data.ndValue')),//年度
            month= parseInt(this.metaAction.gf('data.yfValue')),//月份
            state= this.metaAction.gf('data.jizztValue'),//记账状态
            jzztValue= this.metaAction.gf('data.jzztValue'),//建账状态
            gwVal= this.metaAction.gf('data.gwVal'),//gwVal
            persioniL= this.metaAction.gf('data.persioniL'),//persioniL
            type = this.metaAction.gf('data.checkedKeys.checked').toJS(),
            maxde = this.metaAction.gf('data.maxde'),
            types = 'self',
            all = this.metaAction.gf('data.other.permission.all'),
            isText = this.metaAction.gf('data.isText'),
            isTypesAll = this.metaAction.gf('data.isTypesAll');
        if(type.length != 0 && type.length){
            types = 'dept'
        }
        for (let i = 0;i<type.length;i++){
            if(type[i] == maxde && all == 'all'){
                types = 'all'
            }
        }
        // this.metaAction.sf('data.treeType',types)
        this.injections.reduce('update', {path: 'data.treeType',value:types});
        isTypesAll ? types = 'all' : null;
	    let option ={
            "entity": {
                "bmdm": "",
                "departments":type,
                "type":types,//"all"
                "finishMark":finishmark,
                "seachtext":seachtext,
                "state":state,
                "year":year,
                "jzzt":jzztValue,
                "month":month,
                "khfl":customers,
                "roleId":gwVal,
                "userIds":types=='self'?[]:persioniL
            },
            "page": {
                currentPage:pagination.currentPage,
                pageSize:pagination.pageSize
            }
        }
        let res = await this.webapi.getOrgJzjdList(option)
        res.list.map(item=>{
            item.isText = isText;
        })
        this.injections.reduce('tableLoading', false)
        this.injections.reduce('update', {path: 'data.list',value:res.list});
        this.injections.reduce('update', {path: 'data.pagination',value:res.page});

        let tableColumns =  [
            {id:1, fieldName: 'name', fieldTitle: '客户名称', caption: '客户名称', isVisible:true, isMustSelect:true, width: 190},
            {id:2, fieldName: 'zjm', fieldTitle: '助记码', caption: '助记码', isVisible:true, width: 100},
            {id:3, fieldName: 'state01', fieldTitle: '1', caption: '1', isVisible:true, width: 75},
            {id:4, fieldName: 'state02', fieldTitle: '2', caption: '2', isVisible:true, width: 75},
            {id:5, fieldName: 'state03', fieldTitle: '3', caption: '3', isVisible:true, width: 75},
            {id:6, fieldName: 'state04', fieldTitle: '4', caption: '4', isVisible:true, width: 75},
            {id:7, fieldName: 'state05', fieldTitle: '5', caption: '5', isVisible:true, width: 75},
            {id:8, fieldName: 'state06', fieldTitle: '6', caption: '6', isVisible:true, width: 75},
            {id:9, fieldName: 'state07', fieldTitle: '7', caption: '7', isVisible:true, width: 75},
            {id:10, fieldName: 'state08', fieldTitle: '8', caption: '8', isVisible:true, width: 75},
            {id:11, fieldName: 'state09', fieldTitle: '9', caption: '9', isVisible:true, width: 75},
            {id:12, fieldName: 'state10', fieldTitle: '10', caption: '10', isVisible:true, width: 75},
            {id:13, fieldName: 'state11', fieldTitle: '11', caption: '11', isVisible:true, width: 75},
            {id:14, fieldName: 'state12', fieldTitle: '12', caption: '12', isVisible:true, width: 75},
            {id:15, fieldName: 'option', fieldTitle: '操作', caption: '操作', isVisible:true, isMustSelect:true, width: 100},
        ]
        this.injections.reduce('update', {path: 'data.other.tableColumns',value:tableColumns});
        // this.injections.reduce('update', {path: 'data.isTypesAll',value:false});

    };

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
        this.injections.reduce('update', {path: 'data.pagination',value:pagination});
        this.load()

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

    handleAClick = async (dzCustomerOrgId,dzCustomerName) => {
        let appName = '',name='';
        let option = {
            agencyId:dzCustomerOrgId,
            from:'jzjd'
        }
        const res = await this.webapi.judgeUserMenuToDh(option);
        if(res && res.isEnable == 'Y'){
            appName = 'app-proof-of-list'
            name = '凭证'
        }else{
            appName = 'edfx-app-portal'
            name = dzCustomerName
        }
        // console.log(appName);
        // console.log(name);
        this.component.props.setGlobalContentWithDanhuMenu({
            pageName:dzCustomerName,
            name:name,
            appName:appName,//edfx-app-portal
            params:{},
            orgId:dzCustomerOrgId
            // showHeader:true
        })
    }

	handleRenderText = (name, rowData, index,record) => {
        // console.log(name, rowData, index)
        if(name == 'name' || name == 'zjm') {
            return <div title={rowData[name]}
            style={{
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow:'hidden'}}>{rowData[name]}</div>
        } else {
            if (name == 'option') {
                if(rowData['jzzt'] == 0 || 
                  (rowData.accountState && rowData.accountState == '003') ||
                  (rowData.debitState && (rowData.debitState == '001' || rowData.debitState == '003'))
                  ){
                    return <a href='javascript:;'
                              style={{
                                  color: '#999',
                                  cursor: 'not-allowed',
                                  }}>进入账套</a>
                }else{
                    return <a href='javascript:;' onClick={() => this.handleAClick(rowData['khorgId'],rowData['name'])}>进入账套</a>
                }
            } else {
                let type = null
                if(rowData.isText){
                    switch(rowData[name]) {
                        case '0': type = '未完成'; break;
                        case '1': type = '已完成'; break;
                        default:  type = '无任务';
                    }
            
                    return <span>{type}</span>
                }else{
                    switch(rowData[name]) {
                        case '0': type = 'XDZzhuangtai-wurenwu'; break;
                        case '1': type = 'XDZzhuangtai-yiwancheng'; break;
                        default:  type = '';
                    }
    
                    return <Icon fontFamily='edficon' type={type} className={type}/>
                }
            }
        }
	}

	setMea = (path,val) =>{
        this.metaAction.sf(path,val)
    }


	renderColumns =()=> {
        const columns = this.metaAction.gf('data.other.tableColumns').toJS()

		const resArr = []

		columns.forEach((item, index) => {
			let obj = {
				name: item.fieldName,
                // title: item.fieldName == 'option' ? (
                //     <div>
                //         <span>{item.fieldTitle}</span>
                //         <Icon
                //             name="columnset"
                //             fontFamily='edficon'
                //             className='columnset'
                //             // type="shezhi"
                //             type='shezhi'
                //             onClick={() => this.showTableSetting({ value: true })}
                //         />
                //     </div>
                // ):item.fieldTitle,
                title:item.fieldTitle,
				dataIndex: item.fieldName,
                width: item.width,
                align: item.fieldName == 'name'? 'left':'center',
				render: (text, v, index, record) => {return this.handleRenderText(item.fieldName, v, index,record)}
			}

                resArr.push(obj)
		})

		return resArr
	}


	closeTableSetting = () => {
        this.injections.reduce('tableSettingVisible', { value: false })
    }
    resetTableSetting = async () => {
        // const code = this.metaAction.gf('data').toJS().other.code
        // //重置栏目
        // let res = await this.webapi.reInitByUser({ code: code })
        // await this.sortParmas(null, null, null, 'init')
        // const data = this.metaAction.gf('data').toJS()
        // this.injections.reduce('settingOptionsUpdate', { visible: false, data: data.other.columnDto })

    }

    showTableSetting = async ({ value, data }) => {
        const columns = this.metaAction.gf('data.other.columns').toJS()
        this.injections.reduce('update', {path: 'data.other.columnDto',value:columns});    
        this.injections.reduce('tableSettingVisible', { value })
    }
    saveTableSetting = ({ value, data }) => {
        // console.info(data)
        const columns = this.metaAction.gf('data.other.columns').toJS()
        this.metaAction.sfs({
            'data.other.columnDto': fromJS(columns),
            'data.other.columns': fromJS(data)
        })
        let newTableColumns = data.filter(item=>item.isVisible)
        this.injections.reduce('update', {path: 'data.other.tableColumns',value:newTableColumns}); 
        this.injections.reduce('tableSettingVisible', { value })
    }

    renderPopover = () => {
        return <div className='popover'>
            <div>
                <Icon
                fontFamily='edficon'
                type='XDZzhuangtai-yiwancheng'
                className='yiwancheng'/>
                已完成 
                <span className='boldText'>: 已结账或者已结转损益</span>
            </div>
            <div>
                <Icon fontFamily='edficon' type='XDZzhuangtai-wurenwu' className='weishenbao'/>
                未完成
                <span className='boldText'>: 未结账或者未完成结转损益</span>
            </div>
            <div>
                <span className='boldText' style={{marginLeft:'52px'}}>空 : 未建账/无任务</span>
            </div>
        </div>
    }


    handleConfirm = (data) => {
        //权限管理点击确认
        //确定
        // this.handleDropDownClick();
        // debugger
        // let checked=this.state.checkedKeys.checked;
        // console.log(e)
        this.injections.reduce('update', {path: 'data.checkedKeys.checked',value:data}); 
        this.injections.reduce('update', {path: 'data.isTypesAll',value:false}); 
        // let checked=this.metaAction.gf('data.checkedKeys.checked');
        // let ifgs = this.metaAction.gf('data.ifgs')
        // this.props.onConfirm && this.props.onConfirm(checked)
        // if(checked.length !=0 && checked.length != undefined){
        //     this.metaAction.sf('data.showbm',ifgs);
        // }else{
        //     this.metaAction.sf('data.showbm','分配给我的客户');
        // }
        this.load();
        this.getgwVal();
    }
    handleReset = (data) => {
        //权限管理点击重置
        // console.log(data)
    }

    //分配给我的、公司的客户、部门的客户
    renderTree = () => {

        let permission = this.metaAction.gf('data.other.permission').toJS();
        let showbm = this.metaAction.gf('data.showbm');
        this.injections.reduce('update', {path: 'data.ifgs',value:permission.all ? '公司的客户' : '部门的客户'}); 

        return <RenderTree
            treeData={permission.treeData || []}
            title={permission.all ? '公司的客户' : '部门的客户'}
            // self={permission.self || '分配我的客户'}
            self={showbm}
            setMea = {this.setMea}
            onConfirm={this.handleConfirm}
            onReset={this.handleReset} />
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

        let res = await this.webapi.getgwxx(option)
        this.injections.reduce('update', {path: 'data.gwoption',value:res}); 


    }
    getrenderVal = () =>{
        let res = this.metaAction.gf('data.gwoption').toJS();
	    return res
    }
    getfishVal = () =>{
        let res = this.metaAction.gf('data.finishmark')
        return res
    }

    getpersonVal = () =>{
        // let res = this.metaAction.gf('data.persioniL')
        // return res
        let res = ''
        // let num = this.metaAction.gf('data.num');
        // if(num == 1){
        //     res = this.metaAction.gf('data.users').toJS()
        // }else {
            res = this.metaAction.gf('data.users')
        // }
        return res
    }

    getTreeType = () =>{
        let res = this.metaAction.gf('data.treeType')
        // console.log('我是',res)
        return res
    }
    getRoleId = () =>{
        let res = this.metaAction.gf('data.gwVal')
        // console.log('我是',res)
        return res
    }
    renderInput = () => {
        let year= parseInt(this.metaAction.gf('data.ndValue')),//年度
            month= parseInt(this.metaAction.gf('data.yfValue'));//月份
        return <CustomerClass
            load={this.load}
            setMea={this.setMea}
            handleSelectPerson={this.handleSelectPerson}
            getrenderVal={this.getrenderVal}
            getpersonVal={this.getpersonVal}
            getRoleId = {this.getRoleId}
            getTreeType={this.getTreeType}
            getfishVal = {this.getfishVal}
            year={year}
            month={month}
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

    handleRefreshState = async() => {
        // console.log(2222)

        const ret = await this.metaAction.modal('show', {
            title: '更新状态',
            width: 570,
            wrapClassName: 'UpdateStatus',
            children: <UpdateStatus />
        })
    }

    getFinishValue = async() =>{
        let res = await this.webapi.queryfinish()
        this.injections.reduce('update', {path: 'data.finishmark',value:res.finishmark}); 
        return res.finishmark;
    }

    changeText = () => {
        // console.log(this.metaAction.gf('data.list'));
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
        // console.log(this.metaAction.gf('data.list'));
        let tableData = this.metaAction.gf("data.list").toJS();
        tableData.map(item=>{
            item.isText = false;
        })
        this.metaAction.sfs({
            'data.list':fromJS(tableData),
            'data.isText':false
        })
    }

    addClick = async () => {
	    let pagination = this.metaAction.gf('data.pagination').toJS(),//分页数据
	        finishmark= this.metaAction.gf('data.finishmark'),//获取完成标志
            seachtext= this.metaAction.gf('data.inputval'),
            customers= this.metaAction.gf('data.customers'),//客户分类
            year= parseInt(this.metaAction.gf('data.ndValue')),//年度
            month= parseInt(this.metaAction.gf('data.yfValue')),//月份
            state= this.metaAction.gf('data.jizztValue'),//记账状态
            jzztValue= this.metaAction.gf('data.jzztValue'),//建账状态
            gwVal= this.metaAction.gf('data.gwVal'),//gwVal
            persioniL= this.metaAction.gf('data.persioniL'),//persioniL
            type = this.metaAction.gf('data.checkedKeys.checked').toJS(),
            types = this.metaAction.gf('data.treeType'),
            isTypesAll = this.metaAction.gf('data.isTypesAll');
        isTypesAll ? types = 'all' : null;
        const option ={
            entity: {
                "bmdm": "",
                "departments":type,
                "type":types,//"all"
                "finishMark":finishmark,
                "seachtext":seachtext,
                "state":state,
                "year":year,
                "jzzt":jzztValue,
                "month":month,
                "khfl":customers,
                "roleId":gwVal,
                "userIds":types=='self'?[]:persioniL
            },
            page: {
                currentPage:1,
                pageSize:100000
            }
        }

        const res = await this.webapi.exportJzjdList(option);
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
