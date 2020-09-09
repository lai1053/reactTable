import React from 'react'
import { Map, fromJS } from 'immutable'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { LoadingMask,PrintOption3 } from 'edf-component'
import config from './config'
import extend from './extend'
import { consts } from 'edf-consts'
import utils from 'edf-utils'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.extendAction = option.extendAction
		this.config = config.current
		this.webapi = this.config.webapi
	}

	onInit = ({ component, injections }) => {
		this.extendAction.gridAction.onInit({ component, injections })
		this.component = component
        this.injections = injections
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
            addEventListener('enlargeClick', () => this.onResize({}))
        }
        injections.reduce('init')
        this.load()
	}
    onTabFocus = (data) => {

        let periodData = this.metaAction.gf('data.selectData').toJS()
        this.load(data.toJS().initSearchValue)
    }
	load = async (data) => {
        let forwardingFlag = await this.webapi.cashFlowStatement.getCarryForwardingFlag()
        if(forwardingFlag){
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
        }

        if(this.component.props.initSearchValue){//跳转到现金流量表 页签之前未打开
            if(data){
                this.initSearch(data)
                this.metaAction.sf('data.selectType','month')
            }else if(this.metaAction.gf('data.period').size!=0){
                this.initSearch({period:this.metaAction.gf('data.period')})
            }else {
                this.initSearch(this.component.props.initSearchValue)
            }
        }else if(data){//页签切换
            this.initSearch(data)
            this.metaAction.sf('data.selectType','month')
        }else{
            this.dataInitReduce(this.metaAction.gf('data.selectType')?this.metaAction.gf('data.selectType'):'month', null)
        }

    }
    initSearch = async  (value) => {
        await this.dataInitReduce(value.period.type, value)
        this.metaAction.sf('data.period',value.period)
        // this.refresh()
    }

    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('resize', this.onResize, false)
            window.removeEventListener('onTabFocus', this.onTabFocus, false)
            window.removeEventListener('enlargeClick', this.onResize, false)
        } else if (window.detachEvent) {
            window.detachEvent('onresize', this.onResize)
            window.detachEvent('onTabFocus', this.onTabFocus)
            window.detachEvent('enlargeClick', () => this.onResize({}))
        } else {
            window.onresize = undefined
        }
    }
    componentDidMount = () => {
        if (window.addEventListener) {
            window.addEventListener('resize', this.onResize, false)
        } else if (window.attachEvent) {
            window.attachEvent('onresize', this.onResize)
        } else {
            window.onresize = this.onResize
        }
    }

	onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(()=>{
            if( keyRandomTab == this.keyRandomTab ){
                this.getTableScroll('app-cashflowstatement-rpt-table-tbody', 'ant-table-thead', 0 , 'ant-table-body', 'data.tableOption', e)
            }
        },200)
    }

    getTableScroll = (contaienr, head, num, target, path, e) => {
        try{
            const tableCon = document.getElementsByClassName(contaienr)[0]
            if( !tableCon ){
                if( e ){
                    return
                }
                setTimeout(()=>{
                    this.getTableScroll(contaienr, head, num, target, path)
                }, 500)
                return
            }
            const header = tableCon.getElementsByClassName(head)[0]
            const body = tableCon.getElementsByClassName(target)[0].getElementsByTagName('table')[0]
            const pre = this.metaAction.gf(path).toJS()
            const y = tableCon.offsetHeight - header.offsetHeight - num
            const bodyHeight = body.offsetHeight

            if( bodyHeight > y && y != pre.y ){
                this.metaAction.sf(path, fromJS({...pre, y}))
            }else if( bodyHeight < y && pre.y != null ){
                this.metaAction.sf(path, fromJS({...pre, y: null}))
            }else {
                return false
            }
        }catch(err){
            console.log(err)
        }
    }
    dataInit = async (time = 'month') => {
        let response, obj = { type: time },getRoleDtoList
        response = await this.webapi.cashFlowStatement.init(obj)
        getRoleDtoList = await this.webapi.cashFlowStatement.getRoleDtoList()
        response.getRoleDtoList = getRoleDtoList
        return response
    }
    dataInitReduce = async (time, search) => {
        if(time == 'month'){
            _hmt && _hmt.push(['_trackEvent', '财务', '现金流量表', '按月查询'])
        }else if(time == 'quarter'){
            _hmt && _hmt.push(['_trackEvent', '财务', '现金流量表', '按季度查询'])
        }else if(time == 'halfYear'){
            _hmt && _hmt.push(['_trackEvent', '财务', '现金流量表', '按半年查询'])
        }
	    let VatTaxpayer = this.metaAction.context.get("currentOrg") || {}
        let res = await this.dataInit(time)

        const item = res.periods.find(o => {
            return o.name == this.metaAction.gf('data.selectTimeTitle')
        })
        if(search){
            delete search.resetArApAccount
            res.selectedPeriod = search.period
            await this.injections.reduce('load', res, VatTaxpayer,search)
            this.metaAction.sf(`data.period`, search.period)
            // this.metaAction.sf('data.selectType','month')
        }else if(item){
            res.selectedPeriod = item
            this.metaAction.sf(`data.period`, item)
            await this.injections.reduce('load', res, VatTaxpayer)
            // await this.refresh()
        }else if(!search){
            this.metaAction.sf(`data.period`, res['selectedPeriod'] ? res['selectedPeriod'] : undefined)
            await this.injections.reduce('load', res,VatTaxpayer)

        }
        await this.refresh()
        setTimeout(()=>{
            this.onResize()
        },20)
    }
    renderRows = () => {
        let columns

        if(this.metaAction.context.get("currentOrg").accountingStandards == consts.ACCOUNTINGSTANDARDS_2013){
            columns = [
                {
                    title: '项目',
                    dataIndex: 'project',
                    width: '40%',
                    key: 'project',

                }, {
                    title: '行次',
                    dataIndex: 'row',
                    width: '10%',
                    key: 'row',
                }, {
                    title: '本年累计金额',
                    dataIndex: 'amountSum',
                    width: '25%',
                    key: 'amountSum',
                }, {
                    title: '本期金额',
                    dataIndex: 'amount',
                    width: '25%',
                    key: 'amount',
                }
            ]
        }else if(this.metaAction.context.get("currentOrg").accountingStandards == consts.ACCOUNTINGSTANDARDS_2007){
            columns = [
                {
                    title: '项目',
                    dataIndex: 'project',
                    width: '45%',
                    key: 'project'
                }, {
                    title: '行次',
                    dataIndex: 'row',
                    width: '10%',
                    key: 'row',
                },{
                    title: '本月金额',
                    dataIndex: 'amount',
                    width: '15%',
                    key: 'amountSum',
                }, {
                    title: '本年累计金额',
                    dataIndex: 'amountSum',
                    width: '15%',
                    key: 'amountSum',
                }, {
                    title: '上年同期累计',
                    dataIndex: 'lastYearAmountSum',
                    width: '15%',
                    key: 'lastYearAmountSum',
                }
            ]
        } else {
						columns = [
								{
										title: '项目',
										dataIndex: 'project',
										width: '35%',
										key: 'project'
								}, {
										title: '行次',
										dataIndex: 'row',
										width: '10%',
										key: 'row',
								},{
										title: '金额',
										dataIndex: 'amountSum',
										width: '25%',
										key: 'amountSum',
								}
						]
				}
        let statement = this.metaAction.gf('data.statement')?this.metaAction.gf('data.statement').toJS():[]
        if(false) {
            columns[0].render = function(value,row,index) {
                if(!statement[index].projectDisabled) {
                    return <div className='asset-name-edit-cell asset-name-edit-cell-a'>
                        <a style={{overflow: 'hidden', 'textOverflow': 'ellipsis'}}
                        href='javascript:;' title={value}
                        // onClick={this.openBalancesheetFormulaFun( statement[index].row ,statement[index] )}
                        >
                        {value}
                        </a>
                        <i
                            font-family="edficon"
                            className='edficon edficon-bianji cell-icon'
                            style={{width: '22px',height: '22px',fontSize:'22px'}}
                            // onClick={this.openBalancesheetFormulaFun( statement[index].row ,statement[index] )}
                        ></i>
                    </div>
                } else {
                    return <div className='asset-name-edit-cell'>
                        <span title={value}>{value}</span>
                    </div>
                }
            }
        }
        return columns
    }
    openBalancesheetFormulaFun = async () => {

    }
    selectDataRequest = async (obj) => {
        let response
        let loading = this.metaAction.gf('data.loading')
        if(!loading){
            this.injections.reduce('tableLoading', true)
        }
        response = await this.webapi.cashFlowStatement.query(obj)
        this.injections.reduce('tableLoading', false)
        return response
    }
    selectData = (value) => {
        let data= this.metaAction.gf('data.selectTimeData').toJS()
        const item = data.find((o) =>o.name == value)
        let periodData = item,month,
            VatTaxpayer = this.metaAction.context.get("currentOrg") || {},
            periodList = this.metaAction.gf('data.selectTimeData').toJS()
        this.selectDataRequest({period:periodData}).then((res)=> {
            this.injections.reduce('select', res, periodData)
        })

	    if(periodData && VatTaxpayer &&
		    VatTaxpayer.enabledYear == periodData.year && periodData.period != 1){
		    this.metaAction.sf('data.other.beginningPeriod', true)
	    }else{
		    this.metaAction.sf('data.other.beginningPeriod', false)
        }

        let currentMonth = this.metaAction.context.get("currentOrg").enabledMonth , current
        if(currentMonth < 10&&`${currentMonth}`.indexOf('0')==-1){
            current = `${this.metaAction.context.get("currentOrg").enabledYear}年0${currentMonth}月`
        }else{
            current = `${this.metaAction.context.get("currentOrg").enabledYear}年${currentMonth}月`
        }
        if(this.metaAction.gf('data.userRole') == false){
            this.metaAction.sf('data.isBeginningPeriodShow',false)
        }else{
            if(periodData.type=="month"){

                if( current == periodData.name&&periodData.period != 1){
                    this.metaAction.sf('data.isBeginningPeriodShow',true)
                }else{
                    this.metaAction.sf('data.isBeginningPeriodShow',false)
                }
            }else if(periodData.type=="quarter"){
                if(parseInt(currentMonth)!=1&&periodData.name==periodList[periodList.length-1]['name']){
                    this.metaAction.sf('data.isBeginningPeriodShow',true)
                }else{
                    this.metaAction.sf('data.isBeginningPeriodShow',false)
                }
            }else if(periodData.type=="halfYear"){
                if(parseInt(currentMonth)!=1&&periodData.name==periodList[periodList.length-1]['name']){
                    this.metaAction.sf('data.isBeginningPeriodShow',true)
                }else{
                    this.metaAction.sf('data.isBeginningPeriodShow',false)
                }
            }
        }

        this.metaAction.sf(`data.period`, periodData)
    }
    // fieldChange = (path, value) => {
    //     this.metaAction.sf('data.selectType',value)
    // }
    refresh = (page) => {
        let periodData = this.metaAction.gf(`data.period`),month
        console.log(periodData)
        delete periodData.tempWindow
        this.selectDataRequest({period:periodData}).then((res)=> {
            this.injections.reduce('select', res, periodData)
        })
        // this.selectData(JSON.stringify(periodData))
    }

    selectPeriod = (value, option) => {
        let data, response
        switch(value){
            case 'month':
                this.dataInitReduce('month')
                this.metaAction.sf('data.selectType','month')
                break;
            case 'quarter':
                this.dataInitReduce('quarter')
                this.metaAction.sf('data.selectType','quarter')
                break;
            case 'halfYear':
                this.dataInitReduce('halfYear')
                this.metaAction.sf('data.selectType','halfYear')
                break;

        }
    }

	print = async() => {
        let tempWindow = window.open()
        let forwardingFlag = await this.webapi.cashFlowStatement.getCarryForwardingFlag()
        if(forwardingFlag){
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
            tempWindow.close()
            return
        }else{

            let params = this.metaAction.gf('data.period')
            params.tempWindow = tempWindow
            await this.webapi.cashFlowStatement.print(params)
        }

        _hmt && _hmt.push(['_trackEvent', '财务', '现金流量表', '打印'])

	}
    printset = (e) => {
        switch (e.key) {
          case 'printset':
              this.setupClick()
              break;
          default:

        }
    }
    setupClick = async () => {
        let _this = this
        LoadingMask.show()
        const { enabledMonth, enabledYear } = this.metaAction.context.get('currentOrg')
        let enableddate=''
        if (enabledMonth && enabledYear) {
            enableddate=utils.date.transformMomentDate(`${enabledYear}-${enabledMonth}`)
        }
        const {
            height,
            printTime,
            landscape,
            type,
            width,
            leftPadding,
            rightPadding,
            topPadding,
            bottomPadding,
            contentFontSize,
            printCover,
            customPrintTime,
            creator,
            supervisor,
            creatorType,
            supervisorType,
            samePage
        } = await this.webapi.cashFlowStatement.getPrintConfig()
        LoadingMask.hide()
        this.metaAction.modal('show', {
            title: '打印设置',
            width: 700,
            footer: null,
            iconType: null,
            okText: '保存',
            className:'app-profitstatement-rpt-print-modal-container',
            children: <PrintOption3
                height={height}
                printTime={printTime}
                landscape={landscape}
                type={type}
                width={width}
                samePage = {samePage}
                topPadding = {topPadding}
                bottomPadding = {bottomPadding}
                contentFontSize = {contentFontSize}
                printCover = {printCover}
                leftPadding={leftPadding}
                rightPadding={rightPadding}
                callBack={_this.submitPrint}
                enableddate={enableddate}
                from = 'cashflowstatementRpt'
                creator={creator}
                supervisor={supervisor}
                creatorType={creatorType}
                supervisorType={supervisorType}
                customPrintTime={customPrintTime}
            />
        })
    }
    submitPrint = async (form) => {
        delete  form.creatorButton
        delete  form.enableddate
        delete  form.supervisorButton
        delete  form.timeOriginal
        console.log(form)
        let res = await this.webapi.cashFlowStatement.savePrintConfig(form)
        this.metaAction.toast('success', '打印设置成功')
    }
	export = async() => {
        // let tempWindow = window.open()
        // let forwardingFlag = await this.webapi.cashFlowStatement.getCarryForwardingFlag()
        // if(forwardingFlag){
        //     this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
        //     tempWindow.close()
        //     return
        // }else{

            let params = this.metaAction.gf('data.period')
            // params.tempWindow = tempWindow
            await this.webapi.cashFlowStatement.export(params)
        // }
        _hmt && _hmt.push(['_trackEvent', '财务', '现金流量表', '导出'])

	}

	weixinShare = async () => {
        let forwardingFlag = await this.webapi.cashFlowStatement.getCarryForwardingFlag()
        if(forwardingFlag){
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
            return
        }
        _hmt && _hmt.push(['_trackEvent', '财务', '现金流量表', '微信/QQ分享'])
        let params = this.metaAction.gf('data.period')
        // delete params.name
		const ret = this.metaAction.modal('show', {
			title: '微信/QQ分享',
			width: 300,
			footer: null,
			// closable: false,
			children: this.metaAction.loadApp('app-weixin-share', {
                store: this.component.props.store,
                initData: '/v1/gl/report/cashFlowStatement/share',
                params: params
			})
		})
	}

	mailShare = async () => {
        let forwardingFlag = await this.webapi.cashFlowStatement.getCarryForwardingFlag()
        if(forwardingFlag){
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
            return
        }
        _hmt && _hmt.push(['_trackEvent', '财务', '现金流量表', '邮件分享'])
        let params = this.metaAction.gf('data.period'),period
		const ret = this.metaAction.modal('show', {
			title: '邮件分享',
			width: 400,
			// footer: null,
			// closable: false,
			children: this.metaAction.loadApp('app-mail-share', {
                store: this.component.props.store,
                params: {newParams: params},
                shareUrl: '/v1/gl/report/cashFlowStatement/share',
                mailShareUrl: '/v1/gl/report/cashFlowStatement/sendShareMail',
                printShareUrl: '/v1/gl/report/cashFlowStatement/print',
                period: params.name
			})
		})
	}

	shareClick = (e) => {
		switch (e.key) {
			case 'weixinShare':
				this.weixinShare()
				break;
			case 'mailShare':
				this.mailShare()
				break;
		}
	}

	beginningPeriod = async () => {
        let period = this.metaAction.gf('data.period')
        // let list = this.metaAction.gf('data.statement')
        // let beginningPeriod = await this.webapi.cashFlowStatement.periodBeginInit()
		const ret = await this.metaAction.modal('show', {
			title: '现金流量期初录入',
			width: 700,
			bodyStyle: {height: 410},
            // footer: null,
            okText: "保存",
			children: this.metaAction.loadApp('app-cashflowstatement-card', {
				store: this.component.props.store,
                period: period,
                // list: beginningPeriod.datas,
                accountingStandards: this.metaAction.context.get("currentOrg").accountingStandards
			}),
		})
		if (ret) {
			this.refresh()
		}
    }

    //
    projectManageClick = async () => {
        let period = this.metaAction.gf('data.period')
        // delete period.name
        const ret = await this.metaAction.modal('show', {
			title: '现金流量分配',
			width: 900,
			bodyStyle: {height: 390},
            // footer: null,
            okText: "保存",
			children: this.metaAction.loadApp('app-cashflowstatement-distribution', {
                store: this.component.props.store,
                periodData: this.metaAction.gf(`data.period`),
                // initData: res,
                // period: period,
                // list: beginningPeriod.datas,
                accountingStandards: this.metaAction.context.get("currentOrg").accountingStandards
			}),
        })

        if (ret) {
			this.refresh()
		}
    }

		getTableClassName = () => {
				let accountingStandards = this.metaAction.context.get("currentOrg").accountingStandards,
						className = ''

			  console.log('accountingStandards:' + accountingStandards )
				if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2013) {
						className = 'app-cashflowstatement-rpt-table-tbody smallOrgTable'
				} else if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2007) {
						className = 'app-cashflowstatement-rpt-table-tbody orgTable'
				} else {
						className = 'app-cashflowstatement-rpt-table-tbody nonProfitOrgTable'
						// nonProfitOrgTable
				}

				return className
		}
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...o }
    metaAction.config({ metaHandlers: ret })
    return ret
}
