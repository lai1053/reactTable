import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { fromJS, toJS } from 'immutable'
import config from './config'
import moment from 'moment'
import { FormDecorator } from 'edf-component'
import { consts } from 'edf-consts'
import utils from 'edf-utils'
import extend from './extend'

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        // this.voucherAction = option.voucherAction
        this.extendAction = option.extendAction
        this.selectedOption = []
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({component, injections})
        this.component = component
        this.injections = injections
        injections.reduce('init')
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }
        this.load()
    }

    onTabFocus = async (params) => {
        params = params.toJS()
        if( params.accessType != 0 ) {
            let searchValue = this.metaAction.gf('data.searchValue').toJS()
            if(!(params.initData&&params.initData.type&&params.initData.type=="orders")){
                searchValue.bankAccountId = params.bankAccountId
            } 
            this.searchValueChange({...searchValue})
            if(params.importId) {
                this.importAccount()
            }
        }else{
            const result = await this.webapi.getDisplayDate()
            const { SystemDate, EnableDate } = result
            this.injections.reduce('updateArr',[
                {
                    path: 'data.enableDate',
                    value: utils.date.transformMomentDate(EnableDate)
                }
            ])
            const searchValue = this.metaAction.gf('data.searchValue').toJS()
            this.searchValueChange(searchValue)
        }
    }

    setTableScrollToTop = () => {
        window['ttk-scm-add-bank-statement-list-DataGrid'] = 0
    }

    load = async () => { 
        this.metaAction.sf('data.loading', true)     
        await this.getEnableDate()
        // await this.getAccountList()
        this.getInitOption()
        if(this.component.props.importId) {
            this.importAccount()
        }
    }

    //收入支出格式化
    formatValue = (value) => {
        if(value != undefined) return utils.number.format(value, 2)
    }

    getEnableDate = async() => {
        const result = await this.webapi.getDisplayDate()
        // this.injections.reduce('tableLoading', false)
        const { SystemDate, EnableDate } = result
        let contextDate = SystemDate,
            currentOrg = this.metaAction.context.get("currentOrg")
        if(currentOrg.periodDate){
            contextDate = currentOrg.periodDate
        }

        this.injections.reduce('updateArr',[
            {
                path: 'data.searchValue.beginDate',
                value: utils.date.transformMomentDate(contextDate)
            },
            {
                path: 'data.searchValue.endDate',
                value: utils.date.transformMomentDate(contextDate)
            },
            {
                path: 'data.enableDate',
                value: utils.date.transformMomentDate(EnableDate)
            },
            {
                path: 'data.SystemDate',
                value: utils.date.transformMomentDate(SystemDate)
            }
        ])
        return
    }

    getAccountList = async() => {
        const result = await this.webapi.queryForAccount()
        this.injections.reduce('updateArr',[
            {
                path: 'data.other.accountlist',
                value: result
            }
        ])
    }

    accountKeyDown = (e) => {
        if (e ) {
            if( e.keyCode == 39 || e.keyCode == 40 ) {
                this.accountlistBtn('right')
            }else if ( e.keyCode == 37 || e.keyCode == 38 ) {
                this.accountlistBtn('left')
            }
        }
    }

    componentDidMount = () => {
        document.addEventListener('keydown', this.accountKeyDown, false)
    }

    componentWillUnmount = () => {
        document.removeEventListener('keydown', this.accountKeyDown, false)
    }

    // 这地方的如果使用组件的会是页面失去焦点等问题还是采用自己写的keydown事件
    // componentWillReceiveProps = ({ keydown }) => {
    //     if (keydown && keydown.event) {
    //         let e = keydown.event
    //         if( e.keyCode == 39 || e.keyCode == 40 ) {
    //             this.accountlistBtn('right')
    //         }else if ( e.keyCode == 37 || e.keyCode == 38 ) {
    //             this.accountlistBtn('left')
    //         }
    //     }
    // }

    // 高级搜索查询
    searchValueChange = (value, id) => {
        if(!id) {
            this.injections.reduce('update', { path: 'data.searchValue', value })
        }else {
            value.bankAccountId = this.metaAction.gf('data.searchValue.bankAccountId')
            this.injections.reduce('update', { path: 'data.searchValue', value })
        }
        this.sortParmas()
    }

    // 高级搜索取消
    searchCancelChange = () => {
        let oldSeachValue = this.metaAction.gf('data.other.oldSeachValue')
        if(oldSeachValue){
            this.injections.reduce('update', { path: 'data.searchValue', value: oldSeachValue.toJS() })
        }
    }

    // 高级搜索清空
	clearClick = (value,key) => {
        let oldSeachValue = this.metaAction.gf('data.searchValue').toJS()
        this.injections.reduce('update', { path: 'data.other.oldSeachValue', value: oldSeachValue })

        let SystemDate = this.metaAction.gf('data.SystemDate'),
            contextDate = SystemDate,
            currentOrg = this.metaAction.context.get("currentOrg")
        if(currentOrg.periodDate){
            contextDate = currentOrg.periodDate
        }
        //value.bankAccountId = '',  //简单查询账户名称
        value.receiptPaymentType = 0	//收支状态
        value.reconciliateStatus = 0	//生单状态
        value.endDate = utils.date.transformMomentDate(contextDate)
        value.beginDate = utils.date.transformMomentDate(contextDate)
        value.memo = '' //摘要
        value.reciprocalAccountName = '' //对方账户
        this.injections.reduce('update', { path: 'data.searchValue', value })
	}

    // 点击刷新按钮
    refreshBtnClick = () => {
        this.sortParmas()
    }

    //获取时间选项
    getNormalDateValue = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()
        const arr = []
        arr.push(data.beginDate)
        arr.push(data.endDate)
        return arr
    }

    // 初始化基础信息选项
    getInitOption = async () => {
        let searchValue = this.metaAction.gf('data.searchValue').toJS()
        searchValue.bankAccountId = this.component.props.bankAccountId ? this.component.props.bankAccountId : 1
        this.searchValueChange({...searchValue})
    }

    onPanelChange = (value) => {
        let searchValue = this.metaAction.gf('data.searchValue').toJS()
        searchValue.endDate = value[1]
        searchValue.beginDate = value[0]
        searchValue.receiptPaymentType = 0	//收支状态
        searchValue.reconciliateStatus = 0	//生单状态
        searchValue.memo = '' //摘要
		searchValue.reciprocalAccountName = '' //对方账户
        // 修改逻辑简单搜索也需要重新
        this.searchValueChange({...searchValue})
    }

    // 账户类型发生改变
    accountlistBtn = (type) => {
        const accountlist = this.metaAction.gf('data.other.accountlist').toJS()
        const bankAccountId = this.metaAction.gf('data.searchValue.bankAccountId')
        
        let index = accountlist.findIndex(item => item.id == bankAccountId)
        let id
        switch (type){
            case 'right':
                id = accountlist[index+1]&& accountlist[index+1].id ? accountlist[index+1].id : bankAccountId
                break
            case 'left':
                id = accountlist[index - 1] && accountlist[index - 1].id ? accountlist[index - 1].id : bankAccountId
                break
            default: 
                id =  bankAccountId
                break
        }
        if(id == bankAccountId) return
        this.accountlistChange(id)
    }

    //简单查询账户名称
    accountlistChange = (value) => {
        const accountlist = this.metaAction.gf('data.other.accountlist').toJS()
        const data = this.metaAction.gf('data.searchValue').toJS()
        const item = accountlist.find(index => {
            return index.id == value
        })
        data.receiptPaymentType = 0	//收支状态
        data.reconciliateStatus = 0	//生单状态
        data.memo = '' //摘要
        data.reciprocalAccountName = '' //对方账户
        data.bankAccountId = value
        this.metaAction.sf('data.searchValue', fromJS(data))
        this.sortParmas()
    }

    selectRow = (rowIndex) => (e) => {
		this.injections.reduce('selectRow', rowIndex, e.target.checked)
	}

    getNormalSearchValue = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()
        let date = [ data.beginDate, data.endDate ]
        return { date, query: data.query }
    }

    transformDateToNum=(date)=>{
        try{
            if( !date ){
                return 0
            }
            let time = date
            if( typeof date == 'string' ){
                time = utils.date.transformMomentDate(date)
            }
            return parseInt(`${time.year()}${time.month() < 10 ?  `0${time.month()}` : `${time.month()}`}`)
        }catch(err){
            console.log(err)
            return 0
        }
    }

    /**
     * current 每个月份
     * pointTime 指定比较的时间
     * type 'pre' 前 'next' 后
     * return 返回 true 代表禁用
     */
    disabledDate = (current, pointTime, type) => {
        const enableddate = this.metaAction.gf('data.enableDate')
        const enableddateNum = this.transformDateToNum(enableddate)
        if( type == 'pre' ) {
            let currentMonth = this.transformDateToNum(current)
            return currentMonth < enableddateNum
        }else{
            let currentMonth = this.transformDateToNum(current)
            let pointTimeMonth = this.transformDateToNum(pointTime)
            return currentMonth < pointTimeMonth || currentMonth < enableddateNum
        }
        
    }   
    
    //分页发生变化
    pageChanged = (current, pageSize) => {
        let page = this.metaAction.gf('data.pagination').toJS()
        page = {
            ...page,
            'currentPage': current,
            'pageSize': pageSize ? pageSize : page.pageSize
        }
        // this.metaAction.gf('data.enableDate')
        this.metaAction.sf('data.pagination', fromJS(page))
        this.sortParmas()
    }

    //整合查询条件
    sortParmas = (type) => {
        let loading = this.metaAction.gf('data.loading')
        if(!type && !loading) {
            this.metaAction.sf('data.loading', true)
        }
        let page = this.metaAction.gf('data.pagination').toJS()
        let searchValue = {...this.metaAction.gf('data.searchValue').toJS()}
        searchValue.endDate = searchValue.endDate.format('YYYY-MM')
        searchValue.beginDate = searchValue.beginDate.format('YYYY-MM')
        let params = {
            entity: searchValue,
            page: {
                currentPage: page.currentPage,
                pageSize: page.pageSize
            }
        }
        if(type) {
            return params
        }
        this.requestData(params)
    }

    getListRowsCount = () => {
		return this.metaAction.gf('data.list').size
	}

    //判断合计行
    cellClassName = (data) => {
        if(data.positionFlag == 'last' || data.code == '合计') {
            return 'total'
        }
    }

    //生成单据
    generateDocuments = async(data) => {
        let reconciliatioIds = []
        if(!data) {
            let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid')
            if (!selectedArrInfo.length) {
                this.metaAction.toast('warning', '请选择单据')
                return
            }
            reconciliatioIds = selectedArrInfo.filter(item => {
                if(item.reconciliateStatus == 0){
                    return item.id
                } 
            })
            if(reconciliatioIds.length == 0) {
                this.metaAction.toast('warning', '当前选择单据全部已生单')
                return
            }
            /*if(reconciliatioIds.length != selectedArrInfo.length) {
                this.metaAction.toast('warning', `当前选择单据有${selectedArrInfo.length - reconciliatioIds.length}条已生单`)
            }*/
        }else{
            reconciliatioIds.push(data)
        }
        
        reconciliatioIds = reconciliatioIds.map(item => {return item.id})
        /*const unitsList = await this.webapi.getCorrespondentUnitsList({reconciliatioIds})
        //批量维护往来单位
        if(unitsList.correspondentUnitsList && unitsList.correspondentUnitsList.length != 0) {
            const ret = await this.metaAction.modal('show', {
                title: '创建/匹配往来单位',
                width: 750,
                okText: '下一步',
                wrapClassName: 'correspondent-unit',
                bodyStyle: {
                    height: 320,
                },
                children: this.metaAction.loadApp('ttk-scm-app-matching-unit', {
                    store: this.component.props.store,
                    initData: unitsList.correspondentUnitsList
                })
            })
            if(ret) {
                this.batchOrders(reconciliatioIds)
            }
        }else if( unitsList.correspondentUnitsList && unitsList.correspondentUnitsList.length == 0 ) {
            this.batchOrders(reconciliatioIds)            
        }*/
        //批量生单
        this.batchOrders(reconciliatioIds)
    }

    //批量生单
    batchOrders = async(reconciliatioIds) => {
        let bankAccountId = this.metaAction.gf('data.searchValue.bankAccountId')
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('批量生成收付款单', 'ttk-scm-app-batch-orders',{
                bankAccountId: bankAccountId,
                reconciliatioIds: reconciliatioIds
            })
    }

    //拆分生单
    splitSheet = async(index) => {
        const bankAccountId =  this.metaAction.gf('data.searchValue.bankAccountId')
        let parameter = {
            id : index.id,
            bankAccountId: bankAccountId
        }
        const ret = await this.metaAction.modal('show', {
			title: '拆分银行回单生成多条收付款记录',
            width: 660,
            bodyStyle: {
                height: 420,
            },
			children: this.metaAction.loadApp('ttk-scm-app-split-sheet', {
                store: this.component.props.store,
                parameter
            })
        })

        if(ret){
            this.load()
        }
    }

    //刷新请求数据
    requestData = async (params) => {
        const response = await this.webapi.getList(params)
        this.metaAction.sf('data.loading', false)
        if(response.bankAccountList) {
            let bankAccountList = response.bankAccountList.filter(item=>{
                return item.bankAccountTypeId == 3000050002
            })
            this.injections.reduce('updateArr',[
                {
                    path: 'data.other.accountlist',
                    value: bankAccountList
                },
                {
                    path: 'data.list',
                    value: response.list
                },
                {
                    path: 'data.pagination',
                    value: response.page
                }
            ])
        }
    }

    //批量删除
	delClickBatch = () => {
        let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid'), 
            reconciliateStatus = false
		if (!selectedArrInfo.length) {
			this.metaAction.toast('warning', '请选择单据')
			return
        }
        selectedArrInfo.map(item=>{
            if(item.reconciliateStatus == 0){
                reconciliateStatus = true
            }
        })
        if(!reconciliateStatus){
            this.metaAction.toast('warning', '已经生成收付款单据,不能删除')
            return
        }
		this.del(selectedArrInfo)
	}

    del = async (list) => {
        // for(var i=0;i<list.length;i++){
        //     if(list[i].code){
        //         this.metaAction.toast('warning', '已生单单据不能删除')
		// 	    return
        //     }
        // }
        list = list.map((item) => {
            return{
                id: item.id,
                ts: item.ts
            }
        })
		const ret = await this.metaAction.modal('confirm', {
			title: '删除',
			content: '确认删除?'
        })
        

		if (ret) {
            let response = await this.webapi.delete(list)
			if (response) {
                const { success } = response
                this.sortParmas()
                if( list.length == success.length ) {
                    this.metaAction.toast('success', '删除成功')
                }else {
                    const sucLen = success.length
                    const failLen = list.length - success.length
                    this.metaAction.toast('warn', `${sucLen}删除成功，${failLen}删除失败`)
                }
				
			}
			
		}
	}

    //导入
    exporttemplate = async() => {
        let res = await this.webapi.exporttemplate()
        return res
    }
    
    imports = async(file, bankAccount) => {
        let {accessUrl, originalName, id} = file.toJS()
        let option = {
            accessUrl, 
            oldName: originalName, 
            fileId: id, 
            isRepeatImport: false, 
            bankAccountId: bankAccount ? bankAccount.toJS().id : '',
            isReturnValue: true
        }
        let res = await this.webapi.import(option)
        return res
        
    }

	importAccount = async () => {
        let accountlist = this.metaAction.gf('data.other.accountlist'), fileAccount,
            bankAccountId = this.metaAction.gf('data.searchValue.bankAccountId')
            
        accountlist.toJS().map(item => {
            if(item.id==bankAccountId) fileAccount = fromJS(item)
        })   
        const ret = await this.metaAction.modal('show', {
			title: '导入',
			width: 560,
			okText: '导入',
			children: this.metaAction.loadApp('ttk-scm-app-import', {
                store: this.component.props.store,
                exporttemplate: this.exporttemplate, //下载模板
                imports: this.imports,     //导入
                statement: true,
                accountlist: accountlist,
                fileAccount: fileAccount,
                main: {
                    warn: {
                        name: 'alert',
                        component: 'Alert',
                        showIcon: true,
                        type: 'warning',
                        message: '支持工商银行、建设银行、农业银行、招商银行、北京银行等30多家国有银行及地方银行的对账单自动智能识别导入'
                    },
                    other: [{
                        name: 'title',
                        component: '::h3',
                        _visible: '{{data.main != undefined}}',
                        children: '方法一'
                    }, {
                        name: 'word',
                        component: '::p',
                        children: '1. 请到银行网站下载银行对账单或流水'
                    }, {
                        name: 'word',
                        component: '::p',
                        children: '2. 选择文件进行导入'
                    }]
                }
			})
		})
		
		if (ret) {
            console.log('导入成功')
            this.sortParmas()
			// let fliters = this.metaAction.gf(`data.filter`).toJS()
			// let filter = {}
			// filter.page = fliters.page
			// this.metaAction.sf(`data.filter`, fromJS(filter))
			// this.load()
		}
	}

    //收款、付款链接跳转
    openBill = async (option) => {
        if(option.code.slice(0, 2) == "ZH") {
            const ret = await this.metaAction.modal('show', {
                title: '账户互转',
                width: 700,
                footer: '',
                bodyStyle: {
                    padding: 0,
                    height: 240
                },
                closeModal: this.close,
                closeBack: (back) => { this.closeTip = back },
                children: this.metaAction.loadApp('ttk-scm-app-exchange-accounts', {
                    store: this.component.props.store,
                    initData: option.receivePayId
                })
            })
        }else if(option.inAmount){
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent(
                '收款单',
                'ttk-scm-app-proceeds-card',
                { id: option.receivePayId }
            )
        }else{
            this.component.props.setPortalContent &&
            this.component.props.setPortalContent(
                '付款单',
                'ttk-scm-app-payment-card',
                { id: option.receivePayId }
            )
        }
    }

    close = (value) => {
        this.closeTip()
    }

    // 计算不可选中的时间
    calDisableDate = (current) => {
        const enableDate = this.metaAction.gf('data.enableDate')
        return false
    }

    filterOptionSummary = (input, option) => {
        if (option && option.props && option.props.children) {
          return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
  
        return true
    }

    
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({...option, metaAction}),
		o = new action({...option, metaAction, extendAction}),
		ret = {...metaAction, ...extendAction.gridAction, ...o}

	metaAction.config({metaHandlers: ret})

	return ret
}