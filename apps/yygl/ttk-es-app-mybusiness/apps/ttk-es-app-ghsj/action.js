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
        this.metaAction.sf('data.pagination', fromJS(pagination))
		this.load()
        this.getpermission()
	};

	load = async() => {

	    const pagination = this.metaAction.gf('data.pagination').toJS()//分页数据
	    let finishmark= this.metaAction.gf('data.finishmark'),
            seachtext= this.metaAction.gf('data.inputval'),
            customers= this.metaAction.gf('data.customers'),//客户分类
            year= this.metaAction.gf('data.ndValue'),//年度
            month= this.metaAction.gf('data.yfValue'),//月份
            state= this.metaAction.gf('data.jizztValue'),//记账状态
            jzztValue= this.metaAction.gf('data.jzztValue'),//建账状态
            gwVal= this.metaAction.gf('data.gwVal'),//gwVal
            persioniL= this.metaAction.gf('data.persioniL'),//persioniL
            type = this.metaAction.gf('data.checkedKeys.checked'),
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
                "userIds":persioniL
            },
            "page": {
                currentPage:pagination.currentPage,
                pageSize:pagination.pageSize
            }
        }
        const res = await this.webapi.getOrgJzjdList(option)
        this.injections.reduce('tableLoading', false)
        this.metaAction.sf('data.list',res.list)
        this.metaAction.sf('data.pagination' ,fromJS(res.page))
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
        this.metaAction.sf('data.pagination', fromJS(pagination))
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

    handleAClick = (dzCustomerOrgId,dzCustomerName) => {
        this.component.props.setGlobalContentWithDanhuMenu({
            name:dzCustomerName,
            appName:'app-proof-of-list',//edfx-app-portal
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
                if(rowData['jzzt'] == 0){
                    return <a href='javascript:;'
                              style={{
                                  color: '#999',
                                  cursor: 'not-allowed',
                                  }}>详情</a>
                }else{
                    return <a href='javascript:;' >详情</a>
                //    onClick={() => this.handleAClick(rowData['khorgId'],rowData['name'])}
                }
            } else {
                let type = null
                switch(rowData[name]) {
                    case '0': type = 'XDZzhuangtai-wurenwu'; break;
                    case '1': type = 'XDZzhuangtai-yiwancheng'; break;
                    case '2': type = 'XDZzhuangtai-weishenbao'; break;
                    case '3': type = ''; break;
                    default:  type = 'XDZzhuangtai-weishenbao';
                }

                return <Icon fontFamily='edficon' type={type} className={type}/>
            }
        }
	}

	setMea = (path,val) =>{
	    this.metaAction.sf(path,val)
    }


	renderColumns =()=> {
		const columns = [
			{fieldName: 'name', fieldTitle: '联系人'},
			{fieldName: 'zjm', fieldTitle: '联系方式', width: 100},
			{fieldName: 'state01', fieldTitle: '商机类型', width: 80},
			{fieldName: 'state02', fieldTitle: '商机状态', width: 80},
            {fieldName: 'state07', fieldTitle: '创建日期', width: 80},
            {fieldName: 'state05', fieldTitle: '负责人', width: 80},
            {fieldName: 'state04', fieldTitle: '来源', width: 80},
			// {fieldName: 'state03', fieldTitle: '优先级', width: 80},
			// {fieldName: 'state06', fieldTitle: '创建人', width: 80},
            // {fieldName: 'state08', fieldTitle: '8', width: 80},
            // {fieldName: 'state09', fieldTitle: '9', width: 80},
            // {fieldName: 'state10', fieldTitle: '10', width: 80},
            // {fieldName: 'state11', fieldTitle: '11', width: 80},
            // {fieldName: 'state12', fieldTitle: '12', width: 80},
			{fieldName: 'option', fieldTitle: '操作', width: 70},
		]

		const resArr = []

		columns.forEach((item, index) => {
			let obj = {
				name: item.fieldName,
				title: item.fieldTitle,
				dataIndex: item.fieldName,
                width: item.width,
                align: item.fieldName == 'name'? 'left':'center',
				render: (text, v, index, record) => {return this.handleRenderText(item.fieldName, v, index,record)}
			}
            // item.fieldName == 'option' ? (
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
            // ):
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
        /**
         * 更新栏目
         */
        const code = this.metaAction.gf('data').toJS().other.code
        this.injections.reduce('update', {
            path: 'data.showTableSetting',
            value: false
        })
        const preData = this.metaAction.gf('data.other.columnDto')
        if (value === false) {
            this.injections.reduce('update', {
                path: 'data.other.columnDto',
                value: data
            })
            // const columnSolution = await this.webapi.findByParam({ code: code })
            // if (columnSolution) {
            //     let columnSolutionId = columnSolution.id
            //     const ts = this.metaAction.gf('data.other.ts')
            //     const columnDetail = await this.webapi.updateWithDetail({
            //         "id": columnSolutionId,
            //         "columnDetails": this.combineColumnProp(data),
            //         ts: ts
            //     })
            //     if (columnDetail) {
            //         //一般纳税人的发票号码后要加状态图标
            //         if (this.metaAction.context.get("currentOrg").vatTaxpayerChangeState!==0||this.metaAction.context.get("currentOrg").vatTaxpayer != 2000010002) {
            //             let colu = columnDetail.columnDetails.find(item => item.fieldName == 'invoiceNumber')
            //             let width = colu.width;
            //             let index = fromJS(columnDetail.columnDetails).indexOf(fromJS(colu));
            //             columnDetail.columnDetails[index].width = width + 38;
            //         }
            //         let list = this.metaAction.gf('data.list').toJS();
            //         let hasDraft = false;
            //         list.forEach(item => {
            //             if (/*item.isDraft ||*/  item.discarded) {
            //                 hasDraft = true
            //             }
            //         })
            //         if (hasDraft) {
            //             columnDetail.columnDetails[0].width = columnDetail.columnDetails[0].width + 24.41;
            //         }
            //         this.injections.reduce('settingOptionsUpdate', { visible: value, data: columnDetail.columnDetails })
            //     } else {
            //         this.metaAction.sf('data.other.columnDto', preData)
            //     }
            // } else {
            //     this.metaAction.sf('data.other.columnDto', preData)
            // }
        }
        else {
            this.injections.reduce('tableSettingVisible', { value, data: data })
        }
    }

    xzBtn = async () => {
        const ret = await this.metaAction.modal('show', {
            title: '新增商机',
            width:1100,
            height:450,
            children: this.metaAction.loadApp('ttk-es-app-chooselx', {
                store: this.component.props.store,
                //list: res.data
                // list: result
            })
        });
    }

    renderPopover = () => {
        return <div className='popover'>
            <span><Icon
            fontFamily='edficon'
            type='XDZzhuangtai-yiwancheng'
            className='yiwancheng'/>已完成</span>
            <span><Icon fontFamily='edficon' type='XDZzhuangtai-wurenwu' className='weishenbao'/>未完成</span>
            <span><Icon fontFamily='edficon' type='XDZzhuangtai-weishenbao' className='wurenwu'/>无任务</span>
        </div>
    }


    handleConfirm = (data) => {
        //权限管理点击确认
        //确定
        // this.handleDropDownClick();
        // debugger
        // let checked=this.state.checkedKeys.checked;
        // console.log(e)
        this.metaAction.sf('data.checkedKeys.checked',data)
        let checked=this.metaAction.gf('data.checkedKeys.checked');
        let ifgs = this.metaAction.gf('data.ifgs')
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
        console.log(data)
    }

    //分配给我的、公司的客户、部门的客户
    renderTree = () => {

        let permission = this.metaAction.gf('data.other.permission').toJS();
        let showbm = this.metaAction.gf('data.showbm');
        this.metaAction.sf('data.ifgs',permission.all ? '公司的客户' : '部门的客户')

        return <RenderTree
            treeData={permission.treeData || []}
            title={permission.all ? '公司的客户' : '部门的客户'}
            // self={permission.self || '分配我的客户'}
            self={showbm}
            onConfirm={this.handleConfirm}
            onReset={this.handleReset} />
    }

    getgwVal = async () =>{
        let type = this.metaAction.gf('data.checkedKeys.checked'),
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
// debugger
        this.metaAction.sf('data.gwoption',res);


    }
    getrenderVal = () =>{
        let res = this.metaAction.gf('data.gwoption')
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

    renderInput = () => {
        return <CustomerClass  load={this.load}  setMea={this.setMea}  handleSelectPerson={this.handleSelectPerson} getrenderVal={this.getrenderVal} getpersonVal={this.getpersonVal}/>
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
        console.log(ret)


        if (ret) return ret
    }
    getpermission = async () =>{
        let params = {
            // orgId:6896858486553600,
            // userId:"313272023784706048"
        }

        // console.log(renderTreeComponent.props)
        const res = await this.webapi.getfpkh(params)
        if(res.body.bmxx[0].bmdm){
            this.metaAction.sfs({
                'data.other.permission.treeData':res.body.bmxx,
                'data.other.permission.all':res.body.all,
                // 'data.other.permission.self':res.body.self
                'data.maxde':res.body.bmxx[0].bmdm
            })
        }
    }

    handleRefreshState = async() => {
        console.log(2222)

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
