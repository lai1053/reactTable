import React from 'react'
import { Map, fromJS } from 'immutable'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { LoadingMask, Button,Icon,PrintOption3 } from 'edf-component'
import extend from './extend'
import config from './config'
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
    link = async () => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent(
                '客户使用情况统计表',
                'ttk-omp-app-user-statistics',
                { accessType: 1, initData: { newCertificate: true } }
            )
    }

    onTabFocus = (data) => {//页签切换

        let periodData = this.metaAction.gf('data.selectData').toJS()
        this.load(data.toJS().initSearchValue)
    }

		load = async (data) => {
        let forwardingFlag = await this.webapi.profitStatement.getCarryForwardingFlag()
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
        this.metaAction.sf('data.period',value.period)
        await this.dataInitReduce('month', value)
        // await this.selectDataRequest(value)
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

    dataInit = async (time = 'month') => {
        let response, obj = { type: time }
        response = await this.webapi.profitStatement.init(obj)
        return response
    }
    dataInitReduce = async (time,search) => {

        if(time == 'month'){
            _hmt && _hmt.push(['_trackEvent', '财务', '利润表', '按月查询'])
        }else if(time == 'quarter'){
            _hmt && _hmt.push(['_trackEvent', '财务', '利润表', '按季度查询'])
        }else if(time == 'halfYear'){
            _hmt && _hmt.push(['_trackEvent', '财务', '利润表', '按半年查询'])
        }
        // this.metaAction.sf('data.accountingStandards', this.metaAction.context.get("currentOrg").accountingStandards)
        let res = await this.dataInit(time)
        const item = res.periods.find(o => {
            return o.name == this.metaAction.gf('data.selectTimeTitle')
        })
        if(search){
            delete search.resetArApAccount
            await this.injections.reduce('load', res, search)
            this.metaAction.sf(`data.period`, search.period)
            // this.metaAction.sf('data.selectType','month')
        }else if(item){
            this.metaAction.sf(`data.period`, item)
            await this.injections.reduce('load', res)

        }else if(!search){
            this.metaAction.sf(`data.period`, res['selectedPeriod'] ? res['selectedPeriod'] : undefined)
            await this.injections.reduce('load', res)
            // await this.refresh()
        }
        await this.refresh(undefined, undefined, undefined, true)
        setTimeout(()=>{
            this.onResize()
        },20)
    }
    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(()=>{
            if( keyRandomTab == this.keyRandomTab ){
                this.getTableScroll('app-profitstatement-rpt-table-tbody', 'ant-table-thead', 0 , 'ant-table-body', 'data.tableOption', e)
            }
        },200)
    }

    //报表公式弹框
    openBalancesheetFormula = (index,data) => {
        let monthClosingFlag = this.metaAction.gf('data.monthClosingFlag')

        if(monthClosingFlag){
            return
        }
        let contextData = this.metaAction.context, width = 950

				if (contextData._context.currentOrg.accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization) {
						width = 1250
				}

        return async () => {
            const ret = await this.metaAction.modal('show', {
                title: `编辑公式-${data.project}`,
                width: width,
                height: 430,
                className: 'profitstatement-formula',
                bodyStyle: {padding: '5px 0', fontSize: '12px'},
                children: this.metaAction.loadApp('app-balancesheet-formula', {
                    store: this.component.props.store,
                    initData: {
                        'index': index,
                        'accountingStandards': contextData._context.currentOrg.accountingStandards,
                        'period':this.metaAction.gf(`data.period`),
                        'type':2
                    }
                    // option: option
                })
            })

            if (ret) {
                // this.refresh(undefined, true)
                this.refresh(undefined, undefined, undefined, true)
            }
        }
    }

    //是否重算提示框
    showRecalculationModal = async () => {
				let content = '利润表'

				if (this.metaAction.context.get("currentOrg").accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization) {
						content = '业务活动表'
				}

        let ret = await this.metaAction.modal('confirm', {
            title: '重算提示',
            content: `公式已变更，是否重新计算${content}？`,
            okText: '重算',
            cancelText: '不重算'
        })

        if(ret) {
            this.refresh(undefined, undefined, true )
        }
    }

    renderRows = () => {
        let columns, accountingStandards = this.metaAction.context.get("currentOrg").accountingStandards

        if(accountingStandards == consts.ACCOUNTINGSTANDARDS_2013){
            columns = [
                {
                    title: '项目',
                    dataIndex: 'project',
                    width: '40%',
                    key: 'project'
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
        }else if(accountingStandards == consts.ACCOUNTINGSTANDARDS_2007){
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
                    title: '本期金额',
                    dataIndex: 'amount',
                    width: '15%',
                    key: 'amount',
                },{
                    title: '本年累计金额',
                    dataIndex: 'amountSum',
                    width: '15%',
                    key: 'amountSum',
                },{
                    title: '上年同期累计',
                    dataIndex: 'lastYearAmountSum',
                    width: '15%',
                    key: 'lastYearAmountSum',
                },

            ]
        } else if(accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization) {
						columns = [
								{
										title: '项目',
										dataIndex: 'project',
										width: '32%',
										key: 'project'
								}, {
										title: '行次',
										dataIndex: 'row',
										width: '5%',
										key: 'row',
								}, {
										title: '本月数',
										children: [{
												title: '非限定性',
												dataIndex: 'amountNoLimit',
												width: '11%',
												className:'amountColumnStyle',
												key: 'amountNoLimit'
										}, {
												title: '限定性',
												dataIndex: 'amountLimit',
												width: '11%',
												className:'amountColumnStyle',
												key: 'amountLimit'
										}, {
												title: '合计',
												dataIndex: 'amountSum',
												width: '11%',
												className:'amountColumnStyle',
												key: 'amountSum'
										}]
								}, {
										title: '本年累计数',
										children: [{
												title: '非限定性',
												dataIndex: 'yearAmountNoLimit',
												width: '11%',
												className:'amountColumnStyle',
												key: 'yearAmountNoLimit'
										}, {
												title: '限定性',
												dataIndex: 'yearAmountLimit',
												width: '11%',
												className:'amountColumnStyle',
												key: 'yearAmountLimit'
										}, {
												title: '合计',
												dataIndex: 'yearAmountSum',
												width: '11%',
												className:'amountColumnStyle',
												key: 'yearAmountSum'
										}]
								}
						]
        }

        let statement = this.metaAction.gf('data.statement')?this.metaAction.gf('data.statement').toJS():[]
        let statusArr = statement.map(item => {
            if(item.status ==1) {
                return true
            } else {
                return false
            }
        })
        let openBalancesheetFormulaFun = this.openBalancesheetFormula,
        monthClosingFlag = this.metaAction.gf('data.monthClosingFlag')
        if(true) {
            columns[0].render = function(value,row,index) {
                if(!statement[index].projectDisabled) {
                    return <div className='asset-name-edit-cell asset-name-edit-cell-a'>
                        <a style={{overflow: 'hidden', 'textOverflow': 'ellipsis'}} href='javascript:;' title={value}  onClick={openBalancesheetFormulaFun( statement[index].row ,statement[index] )} >{value}</a>
                        <Icon
                            font-family="edficon"
                            className={monthClosingFlag?"edficon edficon-bianji cell-icon disabledEditIcon":"edficon edficon-bianji cell-icon"}
                            style={{width: '22px',height: '22px',fontSize:'22px'}}
                            disabled={monthClosingFlag}
                            onClick={openBalancesheetFormulaFun( statement[index].row ,statement[index] )}
                        />
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
    selectDataRequest = async (obj) => {
        let response
        let loading = this.metaAction.gf('data.loading')
        if(!loading){
            this.injections.reduce('tableLoading', true)
        }
        response = await this.webapi.profitStatement.query(obj)
        this.injections.reduce('tableLoading', false)
        return response
    }
    selectData = (value) => {
        let data= this.metaAction.gf('data.selectTimeData').toJS()
        const item = data.find((o) =>o.name == value)
        // let periodData = JSON.parse(value),month
        let periodData = item,month
        this.selectDataRequest({period:periodData}).then((res)=> {
            this.injections.reduce('select', res, periodData)
            if(res.recalculation&&res.monthClosingFlag==false) {//recalculation 返回true 与重算，弹出提示框；否则，正常显示
                this.showRecalculationModal()
            }
        })
        this.metaAction.sf(`data.period`, periodData)
    }

    refresh = (page, params, recalculation, canShowConfirm) => {//新加字段canShowConfirm，判断刷新后是否需要弹出重算提示框; recalculation参数是判断查询是是否需要重新计算
        let periodData = this.metaAction.gf(`data.period`),month
        delete periodData.tempWindow
        this.selectDataRequest({period:periodData, 'recalculation': recalculation}).then((res)=> {
            this.injections.reduce('select', res, periodData)

            if(canShowConfirm && res && res.recalculation && res.monthClosingFlag==false) {//recalculation 返回true 与重算，弹出提示框；否则，正常显示
                this.showRecalculationModal()
            }
        })
    }

    //重新计算接口
    recalculationClick = () => {
        this.refresh(undefined, undefined, true)
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
        let forwardingFlag = await this.webapi.profitStatement.getCarryForwardingFlag()
        if(forwardingFlag){
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
            tempWindow.close()
            return
        }else{

            let params = this.metaAction.gf('data.period')
            params.tempWindow = tempWindow
            await await this.webapi.profitStatement.print(params)
        }

        _hmt && _hmt.push(['_trackEvent', '财务', '利润表', '打印'])

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
        } = await this.webapi.profitStatement.getPrintConfig()
        LoadingMask.hide()
        this.metaAction.modal('show', {
            title: '打印设置',
            width: 700,
            footer: null,
            iconType: null,
            okText: '保存',
            className: 'app-profitstatement-rpt-print-modal-container',
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
                from = 'profitstatementRpt'
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
        let res = await this.webapi.profitStatement.savePrintConfig(form)
        this.metaAction.toast('success', '打印设置成功')
    }
	export = async() => {
        // let tempWindow = window.open()
        // let forwardingFlag = await this.webapi.profitStatement.getCarryForwardingFlag()
        // if(forwardingFlag){
        //     this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
        //     tempWindow.close()
        //     return
        // }else{

            let params = this.metaAction.gf('data.period')
            // params.tempWindow = tempWindow
            await this.webapi.profitStatement.export(params)
        // }
        _hmt && _hmt.push(['_trackEvent', '财务', '利润表', '导出'])

	}

	weixinShare = async () => {
        let forwardingFlag = await this.webapi.profitStatement.getCarryForwardingFlag()
        if(forwardingFlag){
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
            return
        }
        _hmt && _hmt.push(['_trackEvent', '财务', '利润表', '微信/QQ分享'])
        let params = this.metaAction.gf('data.period')
        // delete params.name
		const ret = this.metaAction.modal('show', {
			title: '微信/QQ分享',
			width: 300,
			footer: null,
			// closable: false,
			children: this.metaAction.loadApp('app-weixin-share', {
                store: this.component.props.store,
                initData: '/v1/gl/report/profitStatement/share',
                params: params
			})
		})
	}

	mailShare = async () => {
        let forwardingFlag = await this.webapi.profitStatement.getCarryForwardingFlag()
        if(forwardingFlag){
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
            return
        }
        _hmt && _hmt.push(['_trackEvent', '财务', '利润表', '邮件分享'])
        let params = this.metaAction.gf('data.period'),period,month
        // delete params.name
        if(`${params.period}`.indexOf('0') == -1&&parseInt(params.period)<10){

            month = `0${params.period}`
        }else{
            month = `${params.period}`
        }
		const ret = this.metaAction.modal('show', {
			title: '邮件分享',
			width: 400,
			// footer: null,
			// closable: false,
			children: this.metaAction.loadApp('app-mail-share', {
                store: this.component.props.store,
                params: {newParams: params},
                shareUrl: '/v1/gl/report/profitStatement/share',
                printShareUrl: '/v1/gl/report/profitStatement/print',
                mailShareUrl: '/v1/gl/report/profitStatement/sendShareMail',
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
    getTableClassName = () => {
        let accountingStandards = this.metaAction.context.get("currentOrg").accountingStandards,
            className = '',
            templateCode = this.metaAction.gf('data.templateCode')
        if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2013) {
            className = 'app-profitstatement-rpt-table-tbody smallOrgTable'
        } else if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2007) {
            if(templateCode=='1'){
                className = 'app-profitstatement-rpt-table-tbody orgTableNew'
            }else{
                className = 'app-profitstatement-rpt-table-tbody orgTable'
            }
        } else {
            className = 'app-profitstatement-rpt-table-tbody nonProfitOrgTable'
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
