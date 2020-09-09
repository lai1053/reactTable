import React from 'react'
import { Map, fromJS } from 'immutable'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { LoadingMask, Button, Icon ,PrintOption3} from 'edf-component'
import extend from './extend'
import config from './config'
import ResetArApAccount from './components/ResetArApAccount'
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
        this.load()
        // this.load(this.component.props.initSearchValue)
        injections.reduce('init')
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
            addEventListener('enlargeClick', () => this.onResize({}))
        }
    }

    onTabFocus = (data) => {
        let periodData = this.metaAction.gf('data.selectData').toJS()
        this.load(data.toJS().initSearchValue)
    }

    load = async (data) => {
        let forwardingFlag = await this.webapi.balancesheet.getCarryForwardingFlag()
        if (forwardingFlag) {
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
        }
        if (this.component.props.initSearchValue) {//跳转到现金流量表 页签之前未打开
            if (data) {
                this.initSearch(data)
                this.metaAction.sf('data.selectType', 'month')
            } else if (this.metaAction.gf('data.period').size != 0) {
                this.initSearch({ period: this.metaAction.gf('data.period') })
            } else {
                this.initSearch(this.component.props.initSearchValue)
            }
            // this.metaAction.sf('data.selectType','month')
        } else if (data) {//页签切换

            this.initSearch(data)
            this.metaAction.sf('data.selectType', 'month')
        } else {

            this.dataInitReduce(this.metaAction.gf('data.selectType') ? this.metaAction.gf('data.selectType') : 'month', null)
        }
    }
    initSearch = async (value) => {
        await this.dataInitReduce('month', value)
        this.metaAction.sf('data.period', value.period)
        // this.refresh()
        // await this.selectDataRequest(value)
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
        let response, res, obj = { type: time }
        let monthClosingFlag = this.metaAction.gf('data.selectTimeTitle')
        if(monthClosingFlag){
            let data = this.metaAction.gf('data.selectTimeData').toJS()
            const item = data.find((o) => o.name == monthClosingFlag)
            let periodData = item
            response = await this.selectDataRequest({ period: periodData, resetArApAccount: this.metaAction.gf(`data.resetArApAccount`) })
        }else{
            response = await this.webapi.balancesheet.init(obj)
        }
        let reqData={
            "year": monthClosingFlag?Number(monthClosingFlag.split('年')[0]):response.selectedPeriod.year,
            "month":  monthClosingFlag?Number(monthClosingFlag.split('年')[1].split('月')[0]):response.selectedPeriod.endMonth
        }
        res = await this.webapi.balancesheet.resetArApAccount(reqData)
        delete res.periods
        delete res.periodTypes
        return Object.assign(response, res)
    }
    dataInitReduce = async (time, search) => {
        let res = await this.dataInit(time)
        let selectTimeTitle=this.metaAction.gf('data.selectTimeTitle')
        let item
        if(this.metaAction.gf('data.selectTimeTitle')){
            let data = this.metaAction.gf('data.selectTimeData').toJS()
            item = data.find((o) => o.name == selectTimeTitle)
            this.metaAction.sf(`data.balanceSheetAmount`, res['balanceSheetAmount'] ?['balanceSheetAmount'] : undefined)
        }else{
            this.metaAction.sf(`data.balanceSheetAmount`, res['reportTemplateDto']['balanceSheetAmount'] ? res['reportTemplateDto']['balanceSheetAmount'] : undefined)
            item = res.periods.find(o => {
                return o.name == this.metaAction.gf('data.selectTimeTitle')
            })
        }
        this.metaAction.sf('data.accountingStandards', this.metaAction.context.get("currentOrg").accountingStandards)
        this.metaAction.sf(`data.resetArApAccount`, res['resetArApAccount'])
        this.metaAction.sf(`data.templateCode`, res['templateCode'])
        // this.metaAction.sf(`data.period`, res['periods'][0] ? res['periods'][0] : undefined)
        // await this.injections.reduce('load', res)
        if (search) {
            delete search.resetArApAccount
            await this.injections.reduce('load', res, search)
            this.metaAction.sf(`data.period`, search.period)
        } else if (item) {
            this.metaAction.sf(`data.period`, item)
            await this.injections.reduce('load', res)

        } else if (!search) {
            this.metaAction.sf(`data.period`, res['selectedPeriod'] ? res['selectedPeriod'] : undefined)
            await this.injections.reduce('load', res)

        }
        await this.refresh(undefined, undefined, undefined, true) //每次加载页面 、修改查询条件（点击刷新按钮除外）时，判断是否显示重算提示框。第二个参数true。
        setTimeout(() => {
            this.onResize()
        }, 20)

    }
    onResize = (e) => {
        let keyRandomTab = Math.floor(Math.random() * 10000)
        this.keyRandomTab = keyRandomTab
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll('app-balancesheet-rpt-table-tbody', 'ant-table-thead', 0, 'ant-table-body', 'data.tableOption', e)
            }
        }, 200)
    }

    getTableScroll = (contaienr, head, num, target, path, e) => {
        try {
            const tableCon = document.getElementsByClassName(contaienr)[0]
            if (!tableCon) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll(contaienr, head, num, target, path)
                }, 500)
                return
            }
            const header = tableCon.getElementsByClassName(head)[0]
            const body = tableCon.getElementsByClassName(target)[0].getElementsByTagName('table')[0]
            const pre = this.metaAction.gf(path).toJS()
            const y = tableCon.offsetHeight - header.offsetHeight - num
            const bodyHeight = body.offsetHeight
            if (bodyHeight > y && y != pre.y) {
                this.metaAction.sf(path, fromJS({ ...pre, y }))
            } else if (bodyHeight < y && pre.y != null) {
                this.metaAction.sf(path, fromJS({ ...pre, y: null }))
            } else {
                return false
            }
        } catch (err) {
            console.log(err)
        }
    }

    selectPeriod = (value, option) => {
        let data
        switch (value) {
            case 'month':
                this.dataInitReduce('month')
                break;
            // case 'quarter':
            //     this.dataInitReduce('quarter')
            //     break;
            // case 'halfYear':
            //     this.dataInitReduce('halfYear')
            //     break;
            // case 'year':
            //     this.dataInitReduce('year')
            //     break;
        }
    }

    selectDataRequest = async (obj) => {
        let loading = this.metaAction.gf('data.loading')
        if (!loading) {
            this.injections.reduce('tableLoading', true)
        }
        obj.templateCode=this.metaAction.gf('data.templateCode')
        obj.resetTaxAmountAccount =this.metaAction.gf('data.resetTaxAmountAccount')
        let response
        
        response = await this.webapi.balancesheet.query(obj)
        this.injections.reduce('tableLoading', false)
        return response
    }
    selectData = async (value) => {
        _hmt && _hmt.push(['_trackEvent', '财务', '资产负债表', '按月查询'])
        
        let data = this.metaAction.gf('data.selectTimeData').toJS()
        const item = data.find((o) => o.name == value)
        let periodData = item, month
        // let periodData = JSON.parse(value)
        let reqData={
            "year": periodData.year,
            "month": periodData.endMonth
        }
        let resData = await this.webapi.balancesheet.resetArApAccount(reqData)
        this.metaAction.sf('data.templateCode',resData.templateCode)
        
        this.metaAction.sf('data.resetTaxAmountAccount',resData.resetTaxAmountAccount)
        let res = await this.selectDataRequest({ period: periodData, resetArApAccount: this.metaAction.gf(`data.resetArApAccount`) })
        if (res.recalculation && res.monthClosingFlag == false) {//recalculation 返回true 与重算，弹出提示框；否则，正常显示
            this.showRecalculationModal()
        }
        await this.injections.reduce('select', res, periodData)
        await this.metaAction.sf(`data.balanceSheetAmount`, res['balanceSheetAmount'] ? res['balanceSheetAmount'] : undefined)
        this.metaAction.sf(`data.period`, periodData)
    }
    openCerti = () => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('期末凭证', 'app-account-final-cetficate')
    }
    refresh = async (resetArApAccount, params, recalculation, canShowConfirm) => {//新加字段canShowConfirm，判断刷新后是否需要弹出重算提示框; recalculation参数是判断查询时是否需要重新计算

        let periodData = this.metaAction.gf(`data.period`), month
        delete periodData.tempWindow
        let res = await this.selectDataRequest({ period: periodData, resetArApAccount: this.metaAction.gf(`data.resetArApAccount`), 'recalculation': recalculation })
        await this.injections.reduce('select', res, periodData)
        await this.metaAction.sf(`data.balanceSheetAmount`, res['balanceSheetAmount'] ? res['balanceSheetAmount'] : undefined)
        if (canShowConfirm && res && res.recalculation && res.monthClosingFlag == false) {//recalculation 返回true 与重算，弹出提示框；否则，正常显示
            this.showRecalculationModal()
        }
    }
    submitSortProof = async (data) => {
        
        this.metaAction.sf(`data.resetArApAccount`, data.resetArApAccount)
        this.metaAction.sf(`data.templateCode`, data.templateCode)
        this.metaAction.sf(`data.resetTaxAmountAccount`, data.resetTaxAmountAccount)
        this.refresh(data.resetArApAccount)
        return data
    }


    reportSetClick = async () => {
        const res = await this.metaAction.modal('show', {
            title: '报表设置',
            width: 700,
            // className: '',
            children: this.metaAction.loadApp('ttk-gl-app-report-setting', {
                store: this.component.props.store,
            }),
            footer: null
        })
    }

    setting = async () => {
        _hmt && _hmt.push(['_trackEvent', '财务', '资产负债表', '设置重分类'])
        let _this = this
        // let monthClosingFlag = this.metaAction.gf('data.monthClosingFlag')
        // if(monthClosingFlag){
        //     return
        // }
        
        let monthClosingFlag = this.metaAction.gf('data.selectTimeTitle')
        let reqData={
            "year": Number(monthClosingFlag.split('年')[0]),
            "month": Number(monthClosingFlag.split('年')[1].split('月')[0]),
        }
        let data = await this.webapi.balancesheet.resetArApAccount(reqData)
        data.monthClosingFlag=monthClosingFlag.split('年')[0]+'-'+Number(monthClosingFlag.split('年')[1].split('月')[0])
        data.accountingStandards = this.metaAction.context.get("currentOrg").accountingStandards
        this.metaAction.modal('show', {
            title: '设置',
            width: 420,
            iconType: null,
            className: 'balance-modal-container1',
            children: <ResetArApAccount callBack={_this.submitSortProof} initData={data} />,
            footer: null
        })
    }

    //报表公式弹框
    openBalancesheetFormula = (index, data, title) => {
        let monthClosingFlag = this.metaAction.gf('data.monthClosingFlag')
        if (monthClosingFlag) {
            return
        }
        let contextData = this.metaAction.context
        return async () => {
            const ret = await this.metaAction.modal('show', {
                title: `编辑公式-${title}`,
                width: 900,
                height: 430,
                bodyStyle: { padding: '5px 0', fontSize: '12px' },
                className: 'app-balancesheet-formula-modal',
                children: this.metaAction.loadApp('app-balancesheet-formula', {
                    store: this.component.props.store,
                    initData: {
                        'index': index,
                        'accountingStandards': contextData._context.currentOrg.accountingStandards,
                        'type': 1,
                        'period': this.metaAction.gf(`data.period`)
                    }
                })
            })

            if (ret) {
                this.refresh(undefined, undefined, undefined, true)
            }
        }
    }

    //是否重算提示框
    showRecalculationModal = async () => {
        let ret = await this.metaAction.modal('confirm', {
            title: '重算提示',
            content: '公式已变更，是否重新计算资产负债表？',
            okText: '重算',
            cancelText: '不重算'
        })

        if (ret) {//点击重算刷新，调用 查询并重新计算 接口
            this.refresh(undefined, undefined, true)
        }
    }

    renderRows = () => {
        let columns = [
            {
                title: '资产',
                dataIndex: 'assets',
                width: '20%',
                key: 'assets'
            }, {
                title: '行次',
                dataIndex: 'rowL',
                width: '6%',
                key: 'rowL',
            }, {
                title: '期末余额',
                dataIndex: 'endAmountL',
                width: '12%',
                key: 'endAmountL',
            }, {
                title: '年初余额',
                dataIndex: 'yearBeginAmountL',
                width: '12%',
                key: 'yearBeginAmountL',
            }, {
                title: this.getLiabilitiesTitle(),
                dataIndex: 'liabilities',
                width: '20%',
                key: 'liabilities',
            }, {
                title: '行次',
                dataIndex: 'rowR',
                width: '6%',
                key: 'rowR',
            }, {
                title: '期末余额',
                dataIndex: 'endAmountR',
                width: '12%',
                key: 'endAmountR',
            }, {
                title: '年初余额',
                dataIndex: 'yearBeginAmountR',
                width: '12%',
                key: 'yearBeginAmountR',
            }
        ]
        let statement = this.metaAction.gf('data.statement') ? this.metaAction.gf('data.statement').toJS() : []
        let statusArr = statement.map(item => {
            if (item.status == 1) {
                return true
            } else {
                return false
            }
        })
        let openBalancesheetFormulaFun = this.openBalancesheetFormula,
            monthClosingFlag = this.metaAction.gf('data.monthClosingFlag')
        if (true) {
            columns[0].render = function (value, row, index) {
                if (!statement[index].assetsDisabled) {
                    return <div className='asset-name-edit-cell  asset-name-edit-cell-a'>
                        <a style={{ overflow: 'hidden', 'textOverflow': 'ellipsis' }} href='javascript:;' title={value} onClick={openBalancesheetFormulaFun(statement[index].rowL, statement[index], statement[index].assets)}
                        >{value}</a>
                        <Icon
                            font-family="edficon"
                            className={monthClosingFlag ? "edficon edficon-bianji cell-icon disabledEditIcon" : "edficon edficon-bianji cell-icon"}
                            disabled={monthClosingFlag}
                            style={{ width: '22px', height: '22px', fontSize: '22px' }}
                            onClick={openBalancesheetFormulaFun(statement[index].rowL, statement[index], statement[index].assets)}
                        />
                    </div>
                } else {
                    return <div className='asset-name-edit-cell'>
                        <span title={value}>{value}</span>
                    </div>
                }
            }

            columns[4].render = function (value, row, index) {
                if (!statement[index].liabilitiesDisabled) {
                    return <div className='asset-name-edit-cell  asset-name-edit-cell-a'>
                        <a style={{ overflow: 'hidden', 'textOverflow': 'ellipsis' }} href='javascript:;' title={value} onClick={openBalancesheetFormulaFun(statement[index].rowR, statement[index], statement[index].liabilities)}>{value}</a>
                        <Icon
                            font-family="edficon"
                            className='edficon edficon-bianji cell-icon'
                            disabled={monthClosingFlag}
                            style={{ width: '22px', height: '22px', fontSize: '22px' }}
                            onClick={openBalancesheetFormulaFun(statement[index].rowR, statement[index], statement[index].liabilities)}
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

    getLiabilitiesTitle = () => {
        let accountingStandards = this.metaAction.context.get("currentOrg").accountingStandards,
            liabilitiesTitle = ''

        if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2007) {
            liabilitiesTitle = '负债及所有者权益'
        } else if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2013) {
            liabilitiesTitle = '负债及所有者权益(或股东权益)'
        } else if (accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization) {
            liabilitiesTitle = '负债和净资产'
        }

        return liabilitiesTitle
    }

    //重新计算接口
    recalculationClick = () => {
        this.refresh(undefined, undefined, true)
    }

    // 期末
    finalSymbol = () => {
        let data = this.metaAction.gf(`data.balanceSheetAmount`), obj

        if (data.assetsPeriodEndAmount && parseFloat((data.assetsPeriodEndAmount).split(',').join('')) == parseFloat((data.liabilitiesPeriodEndAmount).split(',').join(''))) {
            obj = {
                name: 'icon',
                component: '::span',
                children: '=',
                className: 'iconGreen'
            }
        } else if (data.assetsPeriodEndAmount && parseFloat((data.assetsPeriodEndAmount).split(',').join('')) > parseFloat((data.liabilitiesPeriodEndAmount).split(',').join(''))) {
            obj = {
                name: 'icon',
                component: '::span',
                children: '>',
                className: 'iconRed'
            }
        } else if (data.assetsPeriodEndAmount && parseFloat((data.assetsPeriodEndAmount).split(',').join('')) < parseFloat((data.liabilitiesPeriodEndAmount).split(',').join(''))) {
            obj = {
                name: 'icon',
                component: '::span',
                children: '<',
                className: 'iconRed'
            }
        }
        return obj
    }
    // 年初
    beginSymbol = () => {
        let data = this.metaAction.gf(`data.balanceSheetAmount`), obj
        if (data.assetsYearBeginAmount && parseFloat((data.assetsYearBeginAmount).split(',').join('')) == parseFloat((data.liabilitiesYearBeginAmount).split(',').join(''))) {
            obj = {
                name: 'icon',
                component: '::span',
                children: '=',
                className: 'iconGreen'
            }
        } else if (data.assetsYearBeginAmount && parseFloat((data.assetsYearBeginAmount).split(',').join('')) > parseFloat((data.liabilitiesYearBeginAmount).split(',').join(''))) {
            obj = {
                name: 'icon',
                component: '::span',
                children: '>',
                className: 'iconRed'
            }
        } else if (data.assetsYearBeginAmount && parseFloat((data.assetsYearBeginAmount).split(',').join('')) < parseFloat((data.liabilitiesYearBeginAmount).split(',').join(''))) {
            obj = {
                name: 'icon',
                component: '::span',
                children: '<',
                className: 'iconRed'
            }
        }
        return obj
    }

    print = async () => {
        let tempWindow = window.open()
        let forwardingFlag = await this.webapi.balancesheet.getCarryForwardingFlag()
        if (forwardingFlag) {
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
            tempWindow.close()
            return
        } else {

            let params = this.metaAction.gf('data.period')
            params.tempWindow = tempWindow
            await this.webapi.balancesheet.print(params)
        }
        _hmt && _hmt.push(['_trackEvent', '财务', '资产负债表', '打印'])
    }

    export = async () => {

        // let tempWindow = window.open()
        // let forwardingFlag = await this.webapi.balancesheet.getCarryForwardingFlag()
        // if(forwardingFlag){
        //     this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
        //     tempWindow.close()
        //     return
        // }else{
        let params = this.metaAction.gf('data.period')
        // params.tempWindow = tempWindow
        await this.webapi.balancesheet.export(params)
        // }
        _hmt && _hmt.push(['_trackEvent', '财务', '资产负债表', '导出'])

        // delete params.name

    }

    weixinShare = async () => {
        let forwardingFlag = await this.webapi.balancesheet.getCarryForwardingFlag()
        if (forwardingFlag) {
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
            return
        }
        _hmt && _hmt.push(['_trackEvent', '财务', '资产负债表', '微信/QQ分享'])
        let params = this.metaAction.gf('data.period')
        // delete params.name
        const ret = this.metaAction.modal('show', {
            title: '微信/QQ分享',
            width: 300,
            footer: null,
            // closable: false,
            children: this.metaAction.loadApp('app-weixin-share', {
                store: this.component.props.store,
                params: params,
                initData: '/v1/gl/report/balanceSheet/share'
            })
        })
    }

    mailShare = async () => {
        let forwardingFlag = await this.webapi.balancesheet.getCarryForwardingFlag()
        if (forwardingFlag) {
            this.metaAction.toast('warning', '您修改了数据，系统正在重新计算，请稍后')
            return
        }
        _hmt && _hmt.push(['_trackEvent', '财务', '资产负债表', '邮件分享'])
        let params = this.metaAction.gf('data.period'), period, month
        // delete params.name

        if (`${params.period}`.indexOf('0') == -1 && parseInt(params.period) < 10) {
            month = `0${params.period}`
        } else {
            month = `${params.period}`
        }
        if (params.type == 'month') {
            period = `${params.year}.${month}-${params.year}.${month}`
        }
        const ret = this.metaAction.modal('show', {
            title: '邮件分享',
            width: 400,
            // footer: null,
            // closable: false,
            children: this.metaAction.loadApp('app-mail-share', {
                store: this.component.props.store,
                params: { newParams: params },
                shareUrl: '/v1/gl/report/balanceSheet/share',
                printShareUrl: '/v1/gl/report/balanceSheet/print',
                mailShareUrl: '/v1/gl/report/balanceSheet/sendShareMail',
                period: period
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
        let  enableddate=''
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
        } = await this.webapi.balancesheet.getPrintConfig()
        LoadingMask.hide()
        this.metaAction.modal('show', {
            title: '打印设置',
            width: 700,
            footer: null,
            iconType: null,
            okText: '保存',
            className: 'app-balancesheet-rpt-print-modal-container',
            children: <PrintOption3
                height={height}
                printTime={printTime}
                landscape={landscape}
                type={type}
                width={width}
                customPrintTime={customPrintTime}
                samePage = {samePage}
                topPadding = {topPadding}
                bottomPadding = {bottomPadding}
                contentFontSize = {contentFontSize}
                printCover = {printCover}
                leftPadding={leftPadding}
                rightPadding={rightPadding}
                callBack={_this.submitPrint}
                from = 'balancesheetRpt'
                creator={creator}
                supervisor={supervisor}
                enableddate={enableddate}
                creatorType={creatorType}
                supervisorType={supervisorType}
            />
        })
    }
    submitPrint = async (form) => {
        delete  form.creatorButton
        delete  form.enableddate
        delete  form.supervisorButton
        delete  form.timeOriginal
        console.log(form)
        let res = await this.webapi.balancesheet.savePrintConfig(form)
        this.metaAction.toast('success', '打印设置成功')
    }
    getTableClassName = () => {
        let accountingStandards = this.metaAction.context.get("currentOrg").accountingStandards,
            className = '',
            templateCode = this.metaAction.gf('data.templateCode')
        if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2013) {
             className = 'app-balancesheet-rpt-table-tbody smallOrgTable'
        } else if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2007) {
            if(templateCode=='1'){
                className = 'app-balancesheet-rpt-table-tbody orgTableNew'
            }else{
                className = 'app-balancesheet-rpt-table-tbody orgTable'
            }
        } else {
            className = 'app-balancesheet-rpt-table-tbody nonProfitOrgTable'
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
