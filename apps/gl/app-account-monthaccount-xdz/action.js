
import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { List, fromJS } from 'immutable'
import moment from 'moment'
import config from './config'
import { consts } from 'edf-consts'
import utils from 'edf-utils'
import * as data from './data'
import InventoryCosting from './components/InventoryCosting'
import ExchangeGainOrLoss from './components/ExchangeGainOrLoss'
import MonthEndingClosingTips from './components/MonthEndingClosingTips'
import ProfitAndLoss from './components/ProfitAndLoss'
import { FormDecorator, Checkbox, Input, message, Button, Timeline, Select, Collapse, Icon } from 'edf-component'
import { debug } from 'util';

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }
        let fromXDZmanufacturing = this.component.props.initData && this.component.props.initData.fromXDZmanufacturing
        let year = this.component.props.initData && this.component.props.initData.year,
        month = this.component.props.initData && this.component.props.initData.month
        this.year = year
        this.month = month
        injections.reduce('init', {
            isPop: this.component.props.isPop,
            fromXDZmanufacturing,
            period: `${year}-${month}`
        })
        this.metaAction.sf('data.loading', true)
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
        }
        this.load()
    }
    onTabFocus = async (data) => {
        this.metaAction.sfs({
            'data.other.isMonthEndingClosing': false,
            'data.other.checkAll': false,
            'data.oldList': this.metaAction.gf('data.list')
        })
        await this.refresh()
    }

    componentWillUnmount = () => {
        if (window.removeEventListener) {
            window.removeEventListener('onTabFocus', this.onTabFocus, false)
        } else if (window.detachEvent) {
            window.detachEvent('onTabFocus', this.onTabFocus)
        }
    }

    setTabState = () => {
        //控制折叠面板
        if (this.metaAction.gf('data.isExpand')) {
            let activeKeys = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6']
            this.metaAction.sfs({
                'data.activeKey': activeKeys,
                'data.activeBtn': true
            })
        } else {
            this.metaAction.sfs({
                'data.activeKey': [],
                'data.activeBtn': false
            })
        }
    }
    load = async (year) => {
        sessionStorage.removeItem('monthEndingClosingNum')
        //期末凭证所需接口
        let org = this.metaAction.context.get('currentOrg'),
            periodDate = this.metaAction.gf('data.other.period')?this.metaAction.gf('data.other.period').split('-'):org.periodDate.split('-'),
            accountingStandards = org.accountingStandards,
            cerficateData = this.webapi.queryAllCertificate({ year: periodDate[0], month: periodDate[1], businessTypeId: 5000040022}),
            defaultPeriod = await this.webapi.getDisplayPeriod(),
            getGenarateMode = await this.webapi.getGenarateMode({ year: periodDate[0], month: periodDate[1] }),
            oldList = this.metaAction.gf('data.oldList') ? this.metaAction.gf('data.oldList').toJS() : [],
            currentYear = moment().format('YYYY'),//当前年份
            enabledYear = this.metaAction.context.get("currentOrg").enabledYear, //启用年份
            enabledMonth = this.metaAction.context.get("currentOrg").enabledMonth, //启用月份
            response,
            fromXDZmanufacturing = this.component.props.initData && this.component.props.initData.fromXDZmanufacturing
        this.metaAction.sfs({
            'data.other.disabledDate': `${org.enabledYear}-${org.enabledMonth}`,
            'data.other.comparePeriod': `${defaultPeriod.year}-${defaultPeriod.period}`,//结账需比较的期间，并非默认期间
            // 'data.other.period': periodDate,
            'data.other.period': `${periodDate[0]}-${periodDate[1]}`,
            'data.other.defaultPeriod': org.periodDate,
            'data.generateMode': getGenarateMode,
            'data.other.accountingStandards': accountingStandards
        })
        await this.comparePeriod(org.periodDate)
        this.metaAction.sf('data.activeKey', [])
        if (year) {
            response = await this.webapi.query({ year: year })
        } else {
            response = await this.webapi.query({ year: currentYear })
        }
        if (response.finalRecord.month) {
            this.metaAction.sf('data.initialBalanceShow', false)
        } else {
            this.metaAction.sf('data.initialBalanceShow', true)
        }
        let data = await cerficateData
        response.cerficateData = data.list
        response.isHasExchangeRate = data.isHasExchangeRate
        this.injections.reduce('load', response)
        this.metaAction.sf('data.loading', false)
    }
    getPhoto = (type) => {
        if (type == 'initialBalance') {
            return './vendor/img/gl/qqye.png'
        } else if (type == 'voucherAudit') {
            return './vendor/img/gl/pzjc.png'
        } else if (type == 'accountBalanceCheck') {
            return './vendor/img/gl/kmye.png'
        } else if (type == 'profitLoss') {
            return './vendor/img/gl/syjz.png'
        } else if (type == 'reportCheck') {
            return './vendor/img/gl/cwbb.png'
        } else {
            return './vendor/img/gl/zcqk.png'
        }
    }
    //月份渲染
    monthCellCustom = (date) => {
        let currentOrg = this.metaAction.context.get("currentOrg"),
            enableTime = currentOrg.enabledYear + '-' + currentOrg.enabledMonth,
            maxClosingPeriod = currentOrg.maxClosingPeriod
        return <DateCellCustom enableTime={enableTime} maxClosingPeriod={maxClosingPeriod} nowTime={date.format('YYYY-MM')}></DateCellCustom>
    }
    accountCheck = async () => {//结账检查
        this.metaAction.sfs({
            'data.loading': true,
            'data.other.rotation': true,
            'data.other.checkBtn': false
        })
        let { year, month } = await this.getCurrentAccount(),
            currentOrg = this.metaAction.context.get("currentOrg"),
            accountingStandards = currentOrg.accountingStandards

        if (this.metaAction.gf('data.other.isMonthEndingClosing') == true) {
            this.metaAction.toast('warning', '正在检查，请勿重复点击检查按钮')
            return
        }
        if (Math.floor(moment(currentOrg.enabledYear + '-' + currentOrg.enabledMonth).format('YYYYMM')) == Math.floor(moment(`${year}-${month}`).format('YYYYMM'))) {
            this.metaAction.sf('data.initialBalanceShow', true)
        } else {
            this.metaAction.sf('data.initialBalanceShow', false)
        }
        this.metaAction.sf('data.other.isMonthEndingClosing', true)
        let response = await this.webapi.check({ year, month })
        await this.injections.reduce('account', response, accountingStandards)
        let item1 = response.mecBalanceDto.mecDtoList.find(o => {
            return o.accountBalance < 0
        })
        let item2 = response.mecBalanceDto.mecBalanceDiffDtoList.find(o => {
            return o.diffVal < 0
        })
        if (!item1) {//除固定无形资产一级科目
            this.metaAction.sf('data.firstSubject', true)
        } else {
            this.metaAction.sf('data.firstSubject', false)
        }
        if (item2) {//资产一级科目
            this.metaAction.sf('data.firstSubjectAsset', true)
        } else {
            this.metaAction.sf('data.firstSubjectAsset', false)
        }
        if (JSON.stringify(response.initialBalance) == "{}") {//不存在期初余额时
            //可以结账的条件
            if (response.profitLoss != 0 &&
                // response.voucherAudit.docExistence &&
                response.reportCheck.balanceSheetPass
                // response.reportCheck.balanceAndCashFlowPass
            ) {//新加两个字段分别代表 资产负债表 例如表是否需要重算 &&
                // !response.reportCheck.isNeedBalanceRecalculation &&
                // !response.reportCheck.isNeedProfitStatementRecalculation
                //不能结账的条件
                if (!item1 &&
                    !item2 &&
                    response.documentNumber.docCodeIsSeries &&
                    response.assetCheck.state &&
                    response.documentNumber.docCodeIsSequence &&
                    response.reportCheck.balanceAndProfitStatementPass &&
                    !response.reportCheck.isNeedBalanceRecalculation &&
                    !response.reportCheck.isNeedProfitStatementRecalculation
                ) {
                    this.injections.reduce('btnState', {
                        isBtnShow: false,//检查按钮
                        isAgainShow: false,//重新检查按钮
                        isAccountShow: true,  //结账按钮，
                        immediatelyAccountBtn: true
                    })
                }
                else {
                    this.injections.reduce('btnState', {
                        isBtnShow: false,
                        isAgainShow: true,
                        isAccountShow: true,
                        immediatelyAccountBtn: true
                    })
                }
            } else {
                this.injections.reduce('btnState', {
                    isBtnShow: false,
                    isAgainShow: true,
                    isAccountShow: false,
                    immediatelyAccountBtn: false
                })
            }
        } else {//存在期初余额时
            if (response.profitLoss != 0 &&
                response.initialBalance &&
                response.initialBalance.checkPeriodBegin &&
                response.initialBalance.checkYearBegin &&
                // response.voucherAudit.docExistence &&
                response.reportCheck.balanceSheetPass
                // response.reportCheck.balanceAndCashFlowPass
            ) {//新加两个字段分别代表 资产负债表 例如表是否需要重算 &&
                // !response.reportCheck.isNeedBalanceRecalculation &&
                // !response.reportCheck.isNeedProfitStatementRecalculation
                //可以结账的条件
                if (!item1 &&
                    !item2 &&
                    response.initialBalance &&
                    response.assetCheck.state &&
                    response.documentNumber.docCodeIsSeries &&
                    response.documentNumber.docCodeIsSequence &&
                    response.reportCheck.balanceAndProfitStatementPass &&
                    !response.reportCheck.isNeedBalanceRecalculation &&
                    !response.reportCheck.isNeedProfitStatementRecalculation
                ) {
                    //不可以结账的条件
                    this.injections.reduce('btnState', {
                        isBtnShow: false,
                        isAgainShow: false,
                        isAccountShow: true,
                        immediatelyAccountBtn: true
                    })
                }
                else {
                    this.injections.reduce('btnState', {
                        isBtnShow: false,
                        isAgainShow: true,
                        isAccountShow: true,
                        immediatelyAccountBtn: true
                    })
                }
            } else {
                this.injections.reduce('btnState', {
                    isBtnShow: false,
                    isAgainShow: true,
                    isAccountShow: false,
                    immediatelyAccountBtn: false
                })
            }
        }
        this.metaAction.sf('data.isExpand', true)//是否展开
        await this.setTabState()
        this.metaAction.sfs({
            'data.loading': false,
            'data.other.rotation': false,
            'data.other.isMonthEndingClosing': false
        })
    }

    accountCheckAgain = async () => {
        await this.accountCheck()
    }
    isShowLinkBtn = (type, data) => {
        if (type == 'initialBalance') {
            if (data.initialBalance && data.initialBalance.checkPeriodBegin && data.initialBalance.checkYearBegin && data.initialBalance.checkLossProfit) {
                return true
            } else {
                return false
            }
        }

    }
    comparePeriod = async (value) => {
        let choosePeriod
        if (value) {
            choosePeriod = new Date(value)
        } else {
            choosePeriod = utils.moment.stringToMoment(this.metaAction.gf('data.other.period'))
        }
        let defaultPeriod = utils.moment.stringToMoment(this.metaAction.gf('data.other.comparePeriod')),
            period = await this.getCurrentAccount(),
            diff = choosePeriod - defaultPeriod
        let result = await this.isFinalAccounted()
        if (diff < 0) {
            if (result) {//已经结账并且是最后一个已结账期间,显示反结账
                this.metaAction.sfs({
                    'data.other.unMonthEndingClosingBtn': true,
                    'data.other.isEdit': false,
                    'data.other.lastIsAccountedMonth': true
                })
            } else {//已经结账但不是最后一个已结账期间,不显示反结账，结账按钮置灰
                this.metaAction.sfs({
                    'data.other.unMonthEndingClosingBtn': true,
                    'data.other.isEdit': false,
                    'data.other.lastIsAccountedMonth': false
                })
            }
            this.metaAction.sf('data.other.isAccountedMonth', true)
        } else {//所选期间存在未结账，则可编辑
            this.metaAction.sfs({
                'data.other.unMonthEndingClosingBtn': false,
                'data.other.isEdit': true,
                'data.other.isAccountedMonth': false
            })
        }
        return diff
    }

    monthEndingClosing = async () => {//结账
        let diff = await this.comparePeriod(),
            period = this.metaAction.gf('data.other.comparePeriod').split('-'),
            currentPeriod = this.metaAction.gf('data.other.period').split('-')
        if (this.metaAction.gf('data.other.isMonthEndingClosing') == true) {
            this.metaAction.toast('warning', '正在结账，请勿重复点击结账按钮')
            return
        }
        this.metaAction.sf('data.other.isMonthEndingClosing', true)
        if (diff < 0) {//所选期间是结账期间,则不可编辑
            return
        } else if (diff > 0) {//所选期间之前存在未结账期间
            const ret = await this.metaAction.modal('show', {
                title: '提示',
                children: (
                    <div style={{ margin: '20px 0px' }}>{period[0]}年{period[1]}月 - {currentPeriod[0]}年{currentPeriod[1]}月均未结账，系统将批量对其结账</div>
                ),
                cancelText: '取消',
                okText: '确定',
                width: 400,
                height: 250
            })
            if (ret) {
                this.metaAction.sf('data.loading', true)
                let monthlyClosingBatch = await this.webapi.monthlyClosingBatch({ year: currentPeriod[0], month: currentPeriod[1] })
                let monthlyClosingYear = monthlyClosingBatch && monthlyClosingBatch.month == 1 ? monthlyClosingBatch.year - 1 : monthlyClosingBatch.year
                let monthlyClosingMonth = monthlyClosingBatch && monthlyClosingBatch.month == 1 ? 12 : monthlyClosingBatch.month - 1
                //批量结账
                let warningFlag = false
                let diff = utils.moment.stringToMoment(`${period[0]}-${period[1]}`) - utils.moment.stringToMoment(`${monthlyClosingBatch.year}-${monthlyClosingBatch.month}`)
                if (diff >= 0) {
                    warningFlag = true
                }
                this.metaAction.sf('data.loading', false)
                if (monthlyClosingBatch) {
                    let list = this.getTipContent(monthlyClosingBatch.list)
                    const ret2 = await this.metaAction.modal('show', {
                        title: '提示',
                        children: <MonthEndingClosingTips warningFlag={warningFlag} data={list} currentYear={period[0]} currentMonth={period[1]} monthlyClosingYear={monthlyClosingYear} monthlyClosingMonth={monthlyClosingMonth} />,
                        cancelText: '取消',
                        width: 600,
                        footer: null,
                        // height: 250,
                        wrapClassName: 'monthaccount-modal'
                    })
                    this.component.props.onPortalReload && this.component.props.onPortalReload()
                    let monthEndingClosingNum = sessionStorage.getItem('monthEndingClosingNum')
                    monthEndingClosingNum += monthlyClosingBatch.list.length
                    sessionStorage.setItem('monthEndingClosingNum', monthEndingClosingNum)
                    this.metaAction.sfs({
                        'data.isBtnShow': true,
                        'data.isAgainShow': false,
                        'data.isAccountShow': false,
                        'data.immediatelyAccountBtn': false,
                        'data.initialBalanceShow': false,
                        'data.isExpand': false
                    })
                    await this.refresh()
                    await this.setCurrentAccount()
                    this.metaAction.sf('data.other.isMonthEndingClosing', false)
                    await this.accountCheck()
                }

            } else {
                this.metaAction.sf('data.other.isMonthEndingClosing', false)
                return
            }
        } else {
            let { year, month } = await this.getCurrentAccount(),
                auditResponse = await this.webapi.auditByPeriod({ year, period: month }),
                response = await this.webapi.monthEndingClosing({ year, month })
            if (response) {
                this.metaAction.toast('success', `${period[0]}年${period[1]}月结账成功 将自动跳转至${Number(period[1]) + 1 > 12 ? Number(period[0]) + 1 : Number(period[0])}年${(Number(period[1]) + 1) > 12 ? 1 : Number(period[1]) + 1}月，您可继续结账`)
                this.component.props.onPortalReload && this.component.props.onPortalReload()
                let monthEndingClosingNum = sessionStorage.getItem('monthEndingClosingNum')
                monthEndingClosingNum++
                sessionStorage.setItem('monthEndingClosingNum', monthEndingClosingNum)
                this.metaAction.sfs({
                    'data.isBtnShow': true,
                    'data.isAgainShow': false,
                    'data.isAccountShow': false,
                    'data.immediatelyAccountBtn': false,
                    'data.initialBalanceShow': false,
                    'data.isExpand': false,
                    'data.continueEndClosing': monthEndingClosingNum >= 1 ? true : false
                })
                await this.refresh()
                await this.setCurrentAccount()
            }
        }
        this.metaAction.sf('data.other.isMonthEndingClosing', false)
    }
    getTipContent = (list) => {
        let listTips = []
        let accountingStandards = this.metaAction.context.get("currentOrg").accountingStandards
        list.map((item, index) => {
            let checkMsg = item.checkMsg
            listTips[index] = {}
            listTips[index].checkListMsg = []
            listTips[index].key = `${item.year}年${item.month}月`
            listTips[index].title = `${item.year}年${item.month}月`
            if (checkMsg.initialBalance) {
                //期初余额
                if (checkMsg.initialBalance.checkPeriodBegin == false) {
                    listTips[index].checkListMsg.push({ isWarning: false, content: '期初余额试算不平衡' })
                }
                if (checkMsg.initialBalance.checkYearBegin == false) {
                    listTips[index].checkListMsg.push({ isWarning: false, content: '年初余额试算不平衡' })
                }
                if (checkMsg.initialBalance.checkLossProfit == false) {
                    listTips[index].checkListMsg.push({ isWarning: false, content: '损益类科目的期初余额不为0' })
                }
            }
            if (checkMsg.documentNumber) {
                //凭证
                if (checkMsg.documentNumber.docCodeIsSeries == false) {
                    listTips[index].checkListMsg.push({ isWarning: true, content: '本月凭证存在断号' })
                }
            }
            if (checkMsg.mecBalanceDto && checkMsg.mecBalanceDto.mecDtoList) {
                checkMsg.mecBalanceDto.mecDtoList.map((subitem, subindex) => {
                    if (subitem.accountBalance < 0) {
                        listTips[index].checkListMsg.push({ isWarning: true, content: `${subitem.gradeName} ${subitem.accountCode} ${subitem.accountName} 余额小于0，请查看明细账` })
                    }
                })
            }
            if (checkMsg.mecBalanceDto && checkMsg.mecBalanceDto.mecBalanceDiffDtoList) {
                checkMsg.mecBalanceDto.mecBalanceDiffDtoList.map((subitem, subindex) => {
                    if (subitem.diffVal < 0) {
                        if (subitem.accountCode1.slice(0, 4) == '1601') {
                            let warningItem = listTips[index].checkListMsg.find(item => item.content == '固定资产异常')
                            if (warningItem) {
                                listTips[index].checkListMsg.push({ isWarning: true, content: `${subitem.accountCode1} ${subitem.accountName1}原值 - ${subitem.accountCode2} ${subitem.accountName2}折旧 < 0,请查看余额表` })
                            } else {
                                listTips[index].checkListMsg.push({ isWarning: true, content: '固定资产异常' })
                                listTips[index].checkListMsg.push({ isWarning: true, content: `${subitem.accountCode1} ${subitem.accountName1}原值 - ${subitem.accountCode2} ${subitem.accountName2}折旧 < 0,请查看余额表` })
                            }
                        } else {
                            let warningItem = listTips[index].checkListMsg.find(item => item.content == '无形资产异常')
                            if (warningItem) {
                                listTips[index].checkListMsg.push({ isWarning: true, content: `${subitem.accountCode1} ${subitem.accountName1}原值 - ${subitem.accountCode2} ${subitem.accountName2}摊销 < 0,请查看余额表` })
                            } else {
                                listTips[index].checkListMsg.push({ isWarning: true, content: '无形资产异常' })
                                listTips[index].checkListMsg.push({ isWarning: true, content: `${subitem.accountCode1} ${subitem.accountName1}原值 - ${subitem.accountCode2} ${subitem.accountName2}摊销 < 0,请查看余额表` })
                            }
                        }
                    }
                })
            }
            if (checkMsg.profitLoss == 0) {
                listTips[index].checkListMsg.push({ isWarning: false, content: accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization ? '净资产结转未完成' : '损益结转未完成' })
            }
            if (checkMsg.reportCheck) {
                if (checkMsg.reportCheck.balanceSheetPass == false) {
                    listTips[index].checkListMsg.push({ isWarning: false, content: '资产负债表不平衡，请查看资产负债表' })
                }
                if (checkMsg.reportCheck.isNeedBalanceRecalculation == true) {
                    listTips[index].checkListMsg.push({ isWarning: true, content: '资产负债表数据变更，需要重新计算！请查看资产负债表' })
                }
                if (checkMsg.reportCheck.isNeedProfitStatementRecalculation == true) {
                    listTips[index].checkListMsg.push({ isWarning: true, content: `${this.getProfitRptName()}数据变更，需要重新计算！请查看${this.getProfitRptName()}` })
                }
                if (checkMsg.reportCheck.balanceAndCashFlowPass == false) {
                    listTips[index].checkListMsg.push({ isWarning: true, content: '资产负债表与现金流量表勾稽不正确，请查看资产负债表、现金流量表' })
                }
                if (checkMsg.reportCheck.balanceAndProfitStatementPass == false) {
                    listTips[index].checkListMsg.push({ isWarning: true, content: `资产负债表与${this.getProfitRptName()}勾稽不正确，请查看资产负债表、${this.getProfitRptName()}` })
                }
            }
            if (checkMsg.assetCheck) {
                if (checkMsg.assetCheck.state == false) {
                    listTips[index].checkListMsg.push({ isWarning: true, content: '还未计提折旧' })
                }
            }
        })
        return listTips
    }
    undoMonthEndingClosing = async () => {//反结账
        let isEdit = this.metaAction.gf('data.other.isEdit'),
            lastIsAccountedMonth = this.metaAction.gf('data.other.lastIsAccountedMonth'),
            finalRecord = this.metaAction.gf('data.finalRecord') && this.metaAction.gf('data.finalRecord').toJS(),
            period = this.metaAction.gf('data.other.comparePeriod').split('-'),
            currentPeriod = this.metaAction.gf('data.other.period').split('-'),
            dataList = this.metaAction.gf('data.dataList') && this.metaAction.gf('data.dataList').toJS(),
            option,
            res
        option = dataList.find(item => item.year == currentPeriod[0] && item.month == currentPeriod[1])
        if (this.metaAction.gf('data.other.isMonthEndingClosing') == true) {
            this.metaAction.toast('warning', '正在反结账，请勿重复点击反结账按钮')
            return
        }
        this.metaAction.sfs({
            'data.other.isMonthEndingClosing': true,
            'data.disabledUndoMonthEndingClosing': true
        })
        if (!lastIsAccountedMonth) {
            const ret = await this.metaAction.modal('show', {
                title: '提示',
                children: (
                    <div style={{ margin: '20px 0px' }}>{currentPeriod[0]}年{currentPeriod[1]}月 - {finalRecord.year}年{finalRecord.month}月均已结账，系统将批量对其反结账</div>
                ),
                cancelText: '取消',
                okText: '确定',
                width: 400,
                height: 250
            })
            if (ret) {
                res = await this.webapi.undoMonthEndingClosing({ id: option.id, batchOption: true })
            } else {
                this.metaAction.sf('data.other.isMonthEndingClosing', false)
                return
            }
        } else {
            res = await this.webapi.undoMonthEndingClosing({ id: finalRecord.id, batchOption: false })
        }

        if (res) {
            this.metaAction.sfs({
                'data.disabledUndoMonthEndingClosing': false,
                'data.other.isAccountedMonth': false
            })
            this.component.props.onPortalReload && this.component.props.onPortalReload()
            this.metaAction.toast('success', '反结账成功')
        }
        this.metaAction.sfs({
            'data.other.unMonthEndingClosingBtn': false,
            'data.other.isEdit': true
        })
        await this.setCurrentAccount()
        this.metaAction.sfs({
            'data.immediatelyAccountBtn': false,
            'data.other.isMonthEndingClosing': false
        })
    }
    isAccountedMonth = async () => {//判断是否已结账
        let defaultPeriod = utils.moment.stringToMoment(this.metaAction.gf('data.other.comparePeriod')),
            period = utils.moment.stringToMoment(this.metaAction.gf('data.other.period'))
        if (period < defaultPeriod) {
            this.metaAction.sf('data.other.isAccountedMonth', true)
        } else {
            this.metaAction.sf('data.other.isAccountedMonth', false)
        }
    }
    isFinalAccounted = async () => {//判断是否是最后一个结账期间
        let defaultPeriod = this.metaAction.gf('data.other.comparePeriod')
        let period = this.metaAction.gf('data.other.period'),
            isFinalAccountedYear,
            year = Number(defaultPeriod.split('-')[0]),
            isFinalAccountedMonth,
            month = Number(defaultPeriod.split('-')[1]),
            isFinalAccountedPeriod
        if (month == 1) {
            isFinalAccountedMonth = 12
            isFinalAccountedYear = year - 1
        } else {
            isFinalAccountedMonth = month - 1
            isFinalAccountedYear = year
        }

        isFinalAccountedPeriod = `${isFinalAccountedYear}-${isFinalAccountedMonth}`
        let date1 = period.replace(/\-\d{1}$/, function (m) {
            return '-0' + m.charAt(1)
        }),
            date2 = isFinalAccountedPeriod.replace(/\-\d{1}$/, function (m) {
                return '-0' + m.charAt(1)
            })
        if (date1 == date2) {
            return true
        } else {
            return false
        }
    }
    getCurrentAccount = async () => {
        let period = this.metaAction.gf('data.other.period').split('-')
        let year = period[0],
            month = period[1]
        return { year, month }
    }

    setCurrentAccount = async () => {
        let period = await this.webapi.getDisplayPeriod(),
            currentOrg = this.metaAction.context.get("currentOrg")
        if (Math.floor(moment(currentOrg.enabledYear + '-' + currentOrg.enabledMonth).format('YYYYMM')) == Math.floor(moment(`${period.year}-${period.month}`).format('YYYYMM'))) {
            this.metaAction.sf('data.initialBalanceShow', true)
        } else {
            this.metaAction.sf('data.initialBalanceShow', false)
        }
        this.metaAction.sfs({
            'data.other.comparePeriod': `${period.year}-${period.month}`,
            'data.other.period': `${period.year}-${period.month}`,
            'data.other.checkBtn': true
        })
        await this.getData()
        this.metaAction.sf('data.isExpand', false)
        await this.setTabState()
    }
    collapseExpand = async (key) => {
        if (this.metaAction.gf('data.isBtnShow') == true) {
            this.metaAction.sfs({
                'data.activeKey': [],
                'data.activeBtn': false
            })
        } else {
            this.metaAction.sfs({
                'data.activeKey': key,
                'data.activeBtn': true
            })
        }
    }

    goBeginBalance = async () => {//跳转到期初余额
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent(
                '财务期初',
                'ttk-gl-app-finance-periodbegin',
            )
    }
    goBalanceAccount = async (code1, code2) => {//跳转到余额表
        let { year, month } = await this.getCurrentAccount(),
            date_end = `${year}-${month}`,
            date_start = `${year}-${month}`
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('余额表', 'app-balancesum-rpt', {
                accessType: 1,
                initSearchValue: {
                    date_end: this.metaAction.stringToMoment(date_end),
                    date_start: this.metaAction.stringToMoment(date_start),
                    beginAccountCode: code1,
                    endAccountCode: code2,
                    currencyId: "0"
                }
            })
    }

    goVoucherAudit = async () => {//跳转到凭证管理
        let { year, month } = await this.getCurrentAccount(),
            date_end = `${year}-${month}`,
            date_start = `${year}-01`
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent(
                '凭证',
                'app-proof-of-list',
                {
                    accessType: 1,
                    initSearchValue: {
                        date_end: utils.date.transformMomentDate(date_end),
                        date_start: utils.date.transformMomentDate(date_end)
                    }
                }
            )
    }

    goDetailAccount = async (accountCode) => {//跳转到明细账
        let { year, month } = await this.getCurrentAccount(),
            date_end = `${year}-${month}`,
            date_start = `${year}-${month}`
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('明细账', 'app-detailaccount-rpt', {
                accessType: 1,
                initSearchValue: {
                    accountCode: accountCode,
                    currencyId: "0",
                    date_end: utils.date.transformMomentDate(date_end),
                    date_start: utils.date.transformMomentDate(date_start),
                    noDataNoDisplay: ["1"]
                },
            })
    }
    goAssetCheck = async () => {//跳转到资产折旧摊销
        let { year, month } = await this.getCurrentAccount()

        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('折旧摊销', 'app-asset-depreciation', {
                accessType: 1,
                initSearchValue: {
                    date: `${year}-${month}`
                }
            }
            )
    }
    goProfitLoss = async () => {//跳转到填制凭证
        let { year, month } = await this.getCurrentAccount(),
            res = await this.webapi.createLossProfitDoc({ "year": year, "period": month, isReturnValue: true })
        if (res && res.error && res.error.message) {
            this.metaAction.toast('error', res.error.message)
            return
        }
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('填制凭证', 'app-proof-of-charge', {
                accessType: 1,
                initData: { id: res }
            })
    }
    goBalanceSheetPass = async () => {//跳转到资产负债表
        let { year, month } = await this.getCurrentAccount()

        let params = {
            period: {
                type: 'month',
                year: year,
                period: month,
                name: `${year}年${month}月`
            },
            resetArApAccount: true
        }
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent(
                '资产负债表',
                'app-balancesheet-rpt', {
                accessType: 1,
                initSearchValue: params
            }
            )
    }
    goBalanceAndProfitStatementPass = async () => {//跳转到利润表
        let { year, month } = await this.getCurrentAccount()

        let title = this.getProfitRptName()
        let params = {
            period: {
                type: 'month',
                year: year,
                period: month,
                name: `${year}年${month}月`
            }
        }
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent(
                `${title}`,
                'app-profitstatement-rpt', {
                accessType: 1,
                initSearchValue: params
            }
            )
    }
    goBalanceAndCashFlowPass = async () => {//跳转到现金流量表
        let { year, month } = await this.getCurrentAccount()

        let params = {
            period: {
                type: 'month',
                year: year,
                period: month,
                name: `${year}年${month}月`
            }
        }
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent(
                '现金流量表',
                'app-cashflowstatement-rpt', {
                accessType: 1,
                initSearchValue: params
            }
            )
    }
    getIconType = (accountCheck) => {
        if (accountCheck.grade == 1) {
            if (accountCheck.normal) {
                return 'chenggongtishi'
            } else {
                return 'jinggao'
            }
        }

    }
    getIconType1 = (accountCheck) => {

        if (accountCheck.total) {
            if (accountCheck.diffVal < 0) {
                return 'jinggao'
            } else {
                return 'chenggongtishi'
            }
        }
    }
    getSubContentDisplay = (data, accountCheck) => {
        let ret
        if (accountCheck.grade != 1) {
            if (accountCheck.accountBalance < 0) {
                ret = 'flex'
            } else {
                ret = 'none'
            }
        } else {
            ret = 'flex'
        }
        return ret
    }

    getSubContent3Display = (accountCheck) => {
        let ret
        if (accountCheck.accountCode1.length != 4) {
            if (accountCheck.diffVal < 0) {
                ret = "flex"
            } else {
                ret = "none"
            }
        } else {
            ret = "flex"
        }
        return ret
    }

    getSubContentChildren1 = (accountCheck) => {
        let ret
        let accountingStandards = this.metaAction.context.get("currentOrg").accountingStandards

        if (accountCheck.accountCode1.length == 4 && accountCheck.total) {
            if (accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization) {
                if (accountCheck.accountCode1.slice(0, 4) == "1501") {
                    ret = "固定资产"
                }
            } else {
                if (accountCheck.accountCode1.slice(0, 4) == "1601") {
                    ret = "固定资产"
                } else if (accountCheck.accountCode1.slice(0, 4) == "1701") {
                    ret = "无形资产"
                }
            }

        } else {
            ret = ""
        }
        return ret
    }
    getGradeName = (accountCheck) => {
        if (accountCheck.grade != 1) {
            return ''
        } else {
            return accountCheck.gradeName
        }
    }
    getIsNormal = (accountCheck) => {
        if (accountCheck.grade != 1) {
            return ''
        } else {
            if (accountCheck.normal) {
                return '正常'
            } else {
                return '异常'
            }
        }
    }
    getSubContentChildren2 = (accountCheck) => {
        let ret
        let accountingStandards = this.metaAction.context.get("currentOrg").accountingStandards

        if (accountCheck.accountCode1.length > 4) {
            if (accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization) {
                if (accountCheck.accountCode1.slice(0, 4) == "1501") {
                    ret = "折旧"
                }
            } else {
                if (accountCheck.accountCode1.slice(0, 4) == "1601") {
                    ret = "折旧"
                } else if (accountCheck.accountCode1.slice(0, 4) == "1701") {
                    ret = "摊销"
                }
            }

        } else {
            ret = ""
        }
        return ret
    }
    clickMenu = (type) => {
        switch (type) {
            case 'cerficate':
                this.metaAction.sf('data.other.currentMenu', 'cerficate')
                break;
            case 'account':
                this.metaAction.sf('data.other.currentMenu', 'account')
                break;
        }

    }
    mouseMenu = (type) => {
        switch (type) {
            case 'cerficate':
                this.metaAction.sf('data.other.currentMenuLine', 'cerficate')
                break;
            case 'account':
                this.metaAction.sf('data.other.currentMenuLine', 'account')
                break;
        }
    }
    mouseOutMenu = () => {
        this.metaAction.sf('data.other.currentMenuLine', this.metaAction.gf('data.other.currentMenu'))
    }
    setField = async (path, value) => {
        let currentOrg = this.metaAction.context.get("currentOrg")
        if (path == 'data.other.period') {
            let genarateMode = await this.webapi.getGenarateMode({ year: value.split('-')[0], month: value.split('-')[1] })
            this.metaAction.sfs({
                'data.other.period': value,
                'data.other.checkAll': false,
                'data.generateMode': genarateMode
            })
            let diff = await this.comparePeriod(value)
        }
        if (Math.floor(moment(currentOrg.enabledYear + '-' + currentOrg.enabledMonth).format('YYYYMM')) == Math.floor(moment(value).format('YYYYMM'))) {
            this.metaAction.sf('data.initialBalanceShow', true)
        } else {
            this.metaAction.sf('data.initialBalanceShow', false)
        }
        this.metaAction.sfs({
            'data.activeKey': [],
            'data.other.checkBtn': true,
            'data.immediatelyAccountBtn': false
        })

        if (path == 'data.generateMode') {
            let period = this.metaAction.gf('data.other.period').split('-')
            let hasCarryForwardDocByPeriod = await this.webapi.hasCarryForwardDocByPeriod({ year: period[0], month: period[1] })
            if (hasCarryForwardDocByPeriod) {//
                if (value == 0) {//自动切手工
                    const ret = await this.metaAction.modal('confirm', {
                        title: '删除',
                        content: `切换后将会删除${period[0]}年${period[1]}月及以后会计期间系统自动生成的凭证（包含已审核），请确认是否切换？`,
                    })
                    if (ret) {
                        this.metaAction.sf('data.generateMode', value)
                        let data = await this.webapi.updateGenarateMode({ generateMode: value, year: period[0], month: period[1] })
                        await this.getData()
                    }
                } else if (value == 1) {//手工切自动
                    const ret = await this.metaAction.modal('confirm', {
                        title: '删除',
                        content: '系统将会跟随损益科目及税金科目实时调整期末凭证，请确认是否切换？',
                    })
                    if (ret) {
                        this.metaAction.sfs({
                            'data.loading': true,
                            'data.generateMode': value
                        })
                        let data = await this.webapi.updateGenarateMode({ generateMode: value, year: period[0], month: period[1] })
                        let response
                        if (data != 0) {
                            let timer = setInterval(async () => {
                                response = await this.webapi.getCarryForwardStatus({ seq: data })
                                if (response) {
                                    this.metaAction.sf('data.loading', false)
                                    clearTimeout(timer)
                                    await this.getData()
                                }
                            }, 500)
                        } else {
                            this.metaAction.sf('data.loading', false)
                            await this.getData()
                        }

                    }
                }

            } else {
                this.metaAction.sfs({
                    'data.loading': true,
                    'data.generateMode': value
                })

                let data = await this.webapi.updateGenarateMode({ generateMode: value, year: period[0], month: period[1] })
                if (value == 1) {
                    let response
                    if (data != 0) {
                        let timer = setInterval(async () => {
                            response = await this.webapi.getCarryForwardStatus({ seq: data })
                            if (response) {
                                this.metaAction.sf('data.loading', false)
                                clearTimeout(timer)
                                await this.getData()
                            }
                        }, 500)
                    } else {
                        this.metaAction.sf('data.loading', false)
                        await this.getData()
                    }
                } else {
                    this.metaAction.sf('data.loading', false)
                    await this.getData()
                }
            }
            this.metaAction.sf('data.other.checkAll', false)
        } else {
            await this.getData()
        }
    }
    renderTip = (item) => {
        let hint = this.metaAction.gf('data.other.hint').toJS()
        if (item.hintCode != undefined) {
            let hintCode = item.hintCode
            return hint[hintCode]
        }
    }
    renderTipMore = (item) => {
        let hint = this.metaAction.gf('data.other.hintContent').toJS()
        if (item.hintCode != undefined) {
            let hintCode = item.hintCode
            return hint[hintCode]
        }
    }
    /**
     * 金额格式化
     */
    amountFormat = (amount, decimals, isFocus, clearZero = false) => {
        if (!amount) {
            return '0.00'
        } else if (amount) {
            if (typeof amount == "string") {
                amount = amount.replace(/,/g, '')
                amount = Number(amount)
            }
            return this.voucherAction.numberFormat(amount, decimals, isFocus, clearZero)
        }
    }
    /**
    * input金额框失去焦点时处理的事件
    */
    handleBlur = async (v, precision, businessType, hadSaveAmount) => {
        if (typeof v == "string") {
            v = v.replace(/,/g, '')
            v = Number(v)
        }
        if (!v) {
            this.metaAction.toast('warning', '比例不能为空')
            return
        }
        if (Number(v) > 100) {
            v = 100
        }
        if (Number(v) < 0) {
            v = 0
        }
        if (hadSaveAmount) {
            await this.metaAction.modal('info', {
                title: '提示',
                content: '请重新测算成本，以保证数据准确。',
                okText: '确定'
            })
        }

        let periodDate = this.metaAction.gf('data.other.period'),
            period = { year: periodDate.split('-')[0], month: periodDate.split('-')[1] }
        let res = await this.webapi.updateCarryForwardModeAndProportion({
            carryForwardMode: 5000090001,
            carryForwardSource: 5000100002,
            proportion: v,
            year: period.year,
            month: period.month,
            businessType
        })
        if (res) {
            await this.getData()
        }
    }
    isPopverShow = (item) => {
        if (!item) return false
        let isPopver = false
        if ((item.businessType == 5000040005
            || item.businessType == 5000040024
            || item.businessType == 5000040026)
            && (item.salesCostQueryDto
                && item.salesCostQueryDto.carryForwardMode == 5000090001)
        ) {
            isPopver = true
        }
        return isPopver
    }
    renderPopoverContent = (item) => {
        let curData = item.salesCostQueryDto,
            isAccountedMonth = this.metaAction.gf('data.other.isAccountedMonth')
        const precision = 6
        return !curData ? '' :
            (
                <div id='assistDiv'
                    style={{ fontSize: '12px', width: '245px', height: '150px', display: 'flex', flexDirection: 'column' }}>
                    {
                        item.businessType == 5000040005 ?
                            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '30px' }}>
                                <span>1、本期主营业务收入：{this.amountFormat(curData.incomeAmountDouble, 2, false)}</span>
                                <div style={{ display: 'flex', flexDirection: 'row' }}>
                                    <span>2、结转百分比：</span>
                                    <div className='cellinput'>
                                        <Input.Number
                                            regex='^([0-9]+)(?:\.[0-9]{1,2})?$'
                                            minValue={0}
                                            maxValue={100}
                                            precision={precision}
                                            value={curData.proportion}
                                            disabled={isAccountedMonth}
                                            onBlur={(value) => this.handleBlur(value, precision, item.businessType, curData.hadSaveAmount)}
                                        />
                                    </div>
                                    <span>%</span>
                                </div>
                                <span>3、预计本期销售成本：{this.amountFormat(curData.costAmountDouble, 2, false)}</span>
                                <span>4、库存商品余额：{this.amountFormat(curData.inventoryAmountDouble, 2, false)}</span>
                            </div>
                            : item.businessType == 5000040026 ?
                                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '30px' }}>
                                    <span>1、原材料余额：{this.amountFormat(curData.inventoryAmountDouble, 2, false)}</span>
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        <span>2、领料百分比：</span>
                                        <div className='cellinput'>
                                            <Input.Number
                                                regex='^([0-9]+)(?:\.[0-9]{1,2})?$'
                                                precision={precision}
                                                disabled={isAccountedMonth}
                                                minValue={0}
                                                maxValue={100}
                                                value={curData.proportion}
                                                onBlur={(value) => this.handleBlur(value, precision, item.businessType, curData.hadSaveAmount)}
                                            />
                                        </div>
                                        <span>%</span>
                                    </div>
                                    <span>3、预计本期领料：{this.amountFormat(curData.costAmountDouble, 2, false)}</span>
                                    <span>4、本期主营业务收入：{this.amountFormat(curData.incomeAmountDouble, 2, false)}</span>
                                    <span>5、本期领料/主营业务收入：{this.amountFormat(curData.productProportion, 2, false)}%</span>
                                </div>
                                :
                                <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '30px' }}>
                                    <span>1、本期主营业务收入：{this.amountFormat(curData.incomeAmountDouble, 2, false)}</span>
                                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                                        <span>2、结转百分比：</span>
                                        <div className='cellinput'>
                                            <Input.Number
                                                regex='^([0-9]+)(?:\.[0-9]{1,2})?$'
                                                precision={precision}
                                                value={curData.proportion}
                                                minValue={0}
                                                maxValue={100}
                                                disabled={isAccountedMonth}
                                                onBlur={(value) => this.handleBlur(value, precision, item.businessType, curData.hadSaveAmount)}
                                            />
                                        </div>
                                        <span>%</span>
                                    </div>
                                    <span>3、测算本期完工成本：{this.amountFormat(curData.finishAmountDouble, 2, false)}</span>
                                    <span>4、生产成本余额：{this.amountFormat(curData.costAmountDouble, 2, false)}</span>
                                    <span>5、库存商品余额：{this.amountFormat(curData.inventoryAmountDouble, 2, false)}</span>
                                </div>
                    }
                </div>
            )
    }
    renderSource = (item) => {
        if (item.carryForwardSource == 5000100001 && !item.docId) {
            //存货模块
            return '存货核算未生成凭证，请前往存货台账生成凭证'
        }
        if (item.businessType == 5000040006 &&
            this.metaAction.gf('data.isHasExchangeRate') == false &&
            this.metaAction.gf('data.generateMode') == 0) {
            return '请设置当期汇率'
        }
    }
    renderSourceBtn = (item) => {
        if (item.carryForwardSource == 5000100001) {
            return '存货台账'
        }
    }
    inventory = () => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent(
                '存货台账',
                'ttk-scm-app-inventory',
                {
                    accessType: 1,
                    initData: {
                        period: this.metaAction.gf('data.other.period')
                    }
                }
            )
    }
    checkboxItem = async (item, index) => {
        if (item.amount == 0) {
            return
        }
        let list = this.metaAction.gf('data.list')
        list = list.update(index, item => item.set('checked', !list.get(index).get('checked')))
        this.metaAction.sf('data.list', list)
    }
    checkItem = (item, index) => {//手工选择
        let isHasExchangeRate = this.metaAction.gf('data.isHasExchangeRate'),
            generateMode = this.metaAction.gf('data.generateMode'),
            list = this.metaAction.gf('data.list'),
            amount = item.amount || 0
        if ((item.businessType == 5000040005
            || item.businessType == 5000040026
            || item.businessType == 5000040024) && item.canCreate) {
            list = list.update(index, item => item.set('checked', !list.get(index).get('checked')))
        } else {
            if ((amount == 0 || item.docId || item.businessType == 5000040006)
                && isHasExchangeRate == false
                && generateMode == 0) {
                return
            }
            list = list.update(index, item => item.set('checked', !list.get(index).get('checked')))
        }
        this.metaAction.sf('data.list', list)
    }
    checkAll = () => {
        let list = this.metaAction.gf('data.list'),
            checkAll = this.metaAction.gf('data.other.checkAll'),
            isHasExchangeRate = this.metaAction.gf('data.isHasExchangeRate'),
            generateMode = this.metaAction.gf('data.generateMode')

        list = list.map(item => {
            let i, amount = item.get('amount') || 0
            if ((item.get('businessType') == 5000040005
                || item.get('businessType') == 5000040026
                || item.get('businessType') == 5000040024) && item.get('canCreate')) {
                i = item.update('checked', () => !checkAll)
            }
            else {
                if (amount != 0 && !item.get('docId')) {
                    if (item.get('businessType') == 5000040006 &&
                        isHasExchangeRate == false &&
                        generateMode == 0) {
                        i = item.update('checked', () => false)
                    } else {
                        i = item.update('checked', () => !checkAll)
                    }
                } else {
                    i = item.update('checked', () => false)
                }
            }
            return i
        })
        this.metaAction.sfs({
            'data.list': list,
            'data.other.checkAll': !checkAll
        })
    }
    batchGenerate = async () => {//一键生成
        let period = this.metaAction.gf('data.other.period').split('-'),
            list = this.metaAction.gf('data.list').toJS(),
            businessTypeDefinedList = [],//自定义模板列表
            businessTypePresetList = [],
            businessTypeList = []

        list.map(item => {
            if (item.checked) {
                if (item.templateId) {
                    businessTypeDefinedList.push(item.businessType)
                } else {
                    businessTypePresetList.push(item.businessType)
                }
            }
        })
        if (businessTypePresetList.length == 0) {
            this.metaAction.toast('warning', '请选择您要一键生成的数据')
            return
        }
        let res = await this.webapi.generateDoc({
            businessTypeList: [...businessTypeDefinedList, ...businessTypePresetList],
            year: period[0],
            month: period[1]
        })
        if (res) {
            this.metaAction.toast('success', '凭证生成成功')
            this.metaAction.sf('data.other.checkAll', false)
            await this.getData()
        }

    }
    generateProof = async (item, index) => {//生成凭证
        let period = this.metaAction.gf('data.other.period').split('-')
        if (item.businessType == 5000040006) {
            let isHasExchangeRate = this.metaAction.gf('data.isHasExchangeRate')
            if (isHasExchangeRate == false) {
                // const periodDate = this.metaAction.gf('data.other.period')
                // const disabledDate = this.metaAction.gf('data.other.disabledDate')
                // const isAccountedMonth = this.metaAction.gf('data.other.isAccountedMonth')
                // let comparePeriod = this.metaAction.gf('data.other.comparePeriod')
                // let year = Number(comparePeriod.split('-')[0]), month = Number(comparePeriod.split('-')[1])

                // if (month && month < 10) {
                //     month = `0${month}`
                // }
                // comparePeriod = `${year}-${month}`

                // this.metaAction.modal('show', {
                //     title: '输入期末汇率',
                //     width: 305,
                //     footer: null,
                //     iconType: null,
                //     okText: '调汇',
                //     className: 'exchangeGainOrLoss-modal-container',
                //     children: <ExchangeGainOrLoss
                //         period={periodDate}
                //         disabledDate={disabledDate}
                //         initQuery={this.handleInitQuery}
                //         isAccountedMonth={isAccountedMonth}
                //         comparePeriod={comparePeriod}
                //         confirm={this.exchangeConfirm} />
                // })
                // return
            }
        }
        let res = await this.webapi.generateDoc({
            businessTypeList: [item.businessType],
            year: period[0],
            month: period[1]
        })
        if (res == true) {
            this.metaAction.toast('success', '凭证生成成功')
            await this.getData()
        }
    }
    getData = async () => {
        let period = await this.getCurrentAccount()
        let cerficateData = await this.webapi.queryAllCertificate(period),
            res = await this.webapi.query(period)
        res.cerficateData = cerficateData.list
        res.isHasExchangeRate = cerficateData.isHasExchangeRate
        this.injections.reduce('load', res)
    }

    refresh = async () => {//刷新
        this.metaAction.sf('data.loading', true)

        let period = this.metaAction.gf('data.other.period').split('-'),
            org = this.metaAction.context.get('currentOrg'),
            periodDate = org.periodDate.split("-"),
            cerficateData = await this.webapi.queryAllCertificate({ year: period[0], month: period[1] }),
            defaultPeriod = await this.webapi.getDisplayPeriod()
        if (cerficateData) {
            this.metaAction.sfs({
                'data.list': fromJS(cerficateData.list),
                'data.isHasExchangeRate': cerficateData.isHasExchangeRate,
                'data.other.comparePeriod': `${defaultPeriod.year}-${defaultPeriod.period}`,
                'data.other.disabledDate': `${org.enabledYear}-${org.enabledMonth}`,
                'data.loading': false
            })
            if (this.metaAction.gf('data.isExpand')) {
                await this.accountCheck()
            }
        }

    }

    delTemplate = async (item) => {//删除模板
        const _this = this
        if (item.isAudited != undefined) {
            if (item.isAudited == false) {
                const ret = await this.metaAction.modal('confirm', {
                    title: '删除',
                    content: '此操作将删除模板对应已生成凭证，是否确认删除？',
                    onOk() {
                        _this.deleteItem(item)
                    },
                    onCancel() { }
                })
            } else {
                this.metaAction.toast('warning', '当期对应自定义凭证已经审核，请弃审后处理')
                return
            }
        } else {
            const ret = await this.metaAction.modal('confirm', {
                title: '删除',
                content: '确认删除?'
            });
            if (ret) {
                this.deleteItem(item)
            }

        }
    }
    deleteItem = async (item) => {
        let period = this.metaAction.gf('data.other.period').split('-')
        let res = await this.webapi.del({ templateId: item.templateId, year: period[0], month: period[1], businessType: item.businessType })
        if (res) {
            this.metaAction.toast('success', '删除成功')
            await this.getData()
        }
    }

    /**
        * 本月不在提示复选框
        */
    onChange = async (value) => {
        this.metaAction.sf('data.other.checkNotTips', value)
    }
    /**
     * 提示内容
     */
    getDisplayInfoMSg = (msgInfo) => {
        return <div style={{ display: 'inline-table' }}>
            {
                <div style={{ 'fontSize': '12px', color: '#484848' }}>{msgInfo}</div>
            }
            {
                <div>
                    <Checkbox style={{ 'fontSize': '12px', color: '#484848', marginTop: '13px' }}
                        onChange={(e) => this.onChange(e.target.checked)}
                    >
                        本月不在提示
                    </Checkbox>
                </div>
            }
        </div>
    }
    /**
     * 科目对应设置
     */
    accountRelationsClick = async (e, businessType) => {
        let period = this.metaAction.gf('data.other.period'),
            year = period.split('-')[0],
            month = period.split('-')[1],
            isSetClick = this.metaAction.gf('data.other.isSetClick'),
            tips = businessType == 5000040005 ? "销售成本模块" : businessType == 5000100002 ? "领料成本模块" : "生产入库模块"
        if (isSetClick) {
            this.injections.reduce('btnIsClickState', { path: 'data.other.isSetClick', value: false })

            const notTipsThisMonth = this.metaAction.gf('data.other.checkNotTips')
            const accountNoAddData = await this.webapi.queryUnSetData({ year, month, type: 0, businessType })
            if (accountNoAddData && accountNoAddData.length > 0) {
                let arrays = accountNoAddData.map(element => { return `${element.name}` })
                const msgData = arrays.join('、') + `未加入结转${tips}，如需自动结转请设置科目对应关系后，进行成本测算。是否需要加入${tips}？`
                let rpt = await this.metaAction.modal('confirm',
                    {
                        content: this.getDisplayInfoMSg(msgData),
                        okText: '确定',
                        cancelText: '取消',
                        width: 500,
                    })
                if (rpt) {
                    await this.webapi.accountSetSave({ year, month, type: 0, agreeAdd: true, notTipsThisMonth, businessType })
                } else if (notTipsThisMonth) {
                    await this.webapi.accountSetSave({ year, month, type: 0, agreeAdd: false, notTipsThisMonth, businessType })
                }
            }
            const inventoryNoAddData = await this.webapi.queryUnSetData({ year, month, type: 1, businessType })
            if (inventoryNoAddData && inventoryNoAddData.length > 0) {
                let arrays = inventoryNoAddData.map(element => { return `${element.name}` })
                const msgData = arrays.join('、') + `未加入结转${tips}，如需自动结转请设置科目对应关系后，进行成本测算!`
                let rpt = await this.metaAction.modal('confirm',
                    {
                        content: this.getDisplayInfoMSg(msgData),
                        okText: '确定',
                        cancelText: '取消',
                        width: 500,
                    })
                if (rpt) {
                    await this.webapi.accountSetSave({ year, month, type: 1, agreeAdd: true, notTipsThisMonth, businessType })
                } else if (notTipsThisMonth) {
                    await this.webapi.accountSetSave({ year, month, type: 1, agreeAdd: false, notTipsThisMonth, businessType })
                }
            }

            const res = await this.metaAction.modal('show', {
                title: '科目对应设置',
                width: 850,
                footer: null,
                bodyStyle: { padding: '0px' },
                children: this.metaAction.loadApp('ttk-gl-app-accountrelationsset', {
                    store: this.component.props.store,
                    initData: { year, month, businessType }
                })
            })

            setTimeout(() => {
                this.injections.reduce('btnIsClickState', { path: 'data.other.isSetClick', value: true })
            }, 100)

            if (res == 'save') {
                const popAmount = await this.webapi.getPopAmount({
                    year,
                    month,
                    businessType
                })
                let details = this.metaAction.gf('data.list'),
                    index = this.metaAction.gf('data.list').findIndex((element) => {
                        return element.get('businessType') == businessType
                    })
                let salesCost = details.get(index).get('salesCostQueryDto').toJS()
                //结转百分比、领料百分比
                salesCost["proportion"] = popAmount.proportion
                //主营业务收入
                salesCost["incomeAmountDouble"] = popAmount.incomeAmountDouble
                //预计本期销售成本、预计本期领料、生产成本余额  
                salesCost["costAmountDouble"] = popAmount.costAmountDouble
                //预测本期完工成本
                salesCost["finishAmountDouble"] = popAmount.finishAmountDouble
                //库存商品余额、原材料
                salesCost["inventoryAmountDouble"] = popAmount.inventoryAmountDouble
                //本期领料与本期收入比例
                salesCost["productProportion"] = popAmount.productProportion
                details = details.update(index, item =>
                    item.set('salesCostQueryDto', fromJS(salesCost))
                )
                this.injections.reduce('update', { path: 'data.list', value: details })
                let getAmountAndProportion = await this.webapi.getAmountAndProportion({
                    year,
                    month,
                    carryForwardSource: undefined,
                    carryForwardMode: undefined,
                    businessType
                })
                return getAmountAndProportion
            }
            return false
        }
    }

    /**
       * 结转汇兑损益科目设置
       */
    accountSetClick = async (e) => {
        let isSetClick = this.metaAction.gf('data.other.isSetClick'),
            period = this.metaAction.gf('data.other.period'),
            year = period.split('-')[0],
            month = period.split('-')[1]
        if (isSetClick) {
            this.injections.reduce('btnIsClickState', { path: 'data.other.isSetClick', value: false })
            await this.metaAction.modal('show', {
                title: '结转汇兑损益',
                width: 850,
                footer: null,
                bodyStyle: { padding: '0px' },
                children: this.metaAction.loadApp('ttk-gl-app-profitlossaccountsset', {
                    store: this.component.props.store,
                    initData: { year: parseInt(year), month: parseInt(month) }
                })
            })
            setTimeout(() => {
                this.injections.reduce('btnIsClickState', { path: 'data.other.isSetClick', value: true })
            }, 100)
        }
    }


    isSetShow = (item) => {
        if (item.businessType == 5000040005
            || item.businessType == 5000040026
            || item.businessType == 5000040024) {
            return true
        }
        return false
    }
    renderIsDisabled = (item, isHasExchangeRate, generateMode) => {
        let amount = item.amount || 0,
            isAccountedMonth = this.metaAction.gf('data.other.isAccountedMonth')
        if (item && (item.businessType == 5000040005
            || item.businessType == 5000040026
            || item.businessType == 5000040024)) {
            return !item.canCreate || isAccountedMonth
        } else {
            return amount == 0
                || item.docId
                || (item.businessType == 5000040006
                    && isHasExchangeRate == false &&
                    generateMode == 0) ? true : false
        }
    }
    /**
      * 测算成本
      */
    calcCostClick = async (item) => {
        let periodDate = this.metaAction.gf('data.other.period'),
            period = { year: periodDate.split('-')[0], month: periodDate.split('-')[1] },
            isClick = this.metaAction.gf('data.other.isClick'),
            isAccountedMonth = this.metaAction.gf('data.other.isAccountedMonth'),
            _this = this,
            carryForwardModes = [],
            isEdit = (isAccountedMonth || (item.carryForwardSource == 5000100001 && item.businessType == 5000040005)) ? true : item.docId ? true : false

        if (item.businessType == 5000040026) {
            carryForwardModes = [
                { value: '5000090001', title: '测算领料成本-按比例结转' },
                { value: '5000090002', title: '测算领料成本-全月加权平均' },
                { value: '5000090003', title: '测算领料成本-全额结转' }
            ]
        } else if (item.businessType == 5000040005) {
            carryForwardModes = [
                { value: '5000090001', title: '测算销售成本-按比例结转' },
                { value: '5000090002', title: '测算销售成本-全月加权平均' },
                { value: '5000090003', title: '测算销售成本-全额结转' }
            ]
        } else {
            carryForwardModes = [
                { value: '5000090001', title: '测算生产入库-按比例结转' },
                { value: '5000090002', title: '测算生产入库-全月加权平均' },
                { value: '5000090003', title: '测算生产入库-全额结转' }
            ]
        }
        if (isClick) {
            this.injections.reduce('btnIsClickState', { path: 'data.other.isClick', value: false })
            let getAmountAndProportion = await this.webapi.getAmountAndProportion({
                ...period,
                carryForwardSource: undefined,
                carryForwardMode: undefined,
                businessType: item.businessType
            })
            if (getAmountAndProportion) {
                const { proportion, carryForwardMode } = getAmountAndProportion,
                    businessType = item.businessType

                const titleContent = carryForwardModes.filter(x => x.value == carryForwardMode)[0].title
                const result = await this.metaAction.modal('show', {
                    title: titleContent,
                    width: 1260,
                    footer: null,
                    bodyStyle: { padding: '0px' },
                    children: this.metaAction.loadApp('ttk-gl-app-calculationcost', {
                        store: this.component.props.store,
                        initData: { ...period, carryForwardMode, proportion, businessType, isEdit }
                    })
                })
                if (result) {
                    await this.getData()
                }
                setTimeout(() => {
                    _this.injections.reduce('btnIsClickState', { path: 'data.other.isClick', value: true })
                }, 10)
            }
        }
    }

    setting = async (e, item) => {//编辑模板
        e.stopPropagation()
        e.preventDefault()
        let periodDate = this.metaAction.gf('data.other.period'),
            period = { year: periodDate.split('-')[0], month: periodDate.split('-')[1] },
            isAccountedMonth = this.metaAction.gf('data.other.isAccountedMonth'),
            isClick = this.metaAction.gf('data.other.isClick'),
            _this = this
        if (item.businessType == 5000040005) {//结转销售成本设置弹框
            if (isClick) {
                this.injections.reduce('btnIsClickState', { path: 'data.other.isClick', value: false })
                let getAmountAndProportion = await this.webapi.getAmountAndProportion({
                    year: periodDate.split('-')[0],
                    month: periodDate.split('-')[1],
                    carryForwardSource: undefined,
                    carryForwardMode: undefined,
                    businessType: item.businessType
                }),
                    interfacePath = {}
                getAmountAndProportion.businessType = item.businessType
                const result = this.metaAction.modal('show', {
                    title: '结转销售成本设置',
                    width: 560,
                    footer: null,
                    iconType: null,
                    okText: '保存',
                    bodyStyle: { padding: '12px 0px' },
                    className: 'inventoryCosting-modal-container',
                    children: <InventoryCosting
                        period={period}
                        initData={getAmountAndProportion}
                        hasSaleCostCarryForwardDoc={isAccountedMonth}
                        isAccountedMonth={isAccountedMonth}
                        callBack={_this.saveOption}
                        accountRelationsClick={_this.accountRelationsClick}
                        interfacePath={interfacePath}
                    />
                })
                if (result) {
                    await this.getData()
                }
                setTimeout(() => {
                    _this.injections.reduce('btnIsClickState', { path: 'data.other.isClick', value: true })
                }, 10)
            }

        } else if (item.businessType == 5000040026) {//结转领料成本设置弹框
            if (isClick) {
                this.injections.reduce('btnIsClickState', { path: 'data.other.isClick', value: false })
                let getAmountAndProportion = await this.webapi.getAmountAndProportion({
                    year: periodDate.split('-')[0],
                    month: periodDate.split('-')[1],
                    carryForwardSource: undefined,
                    carryForwardMode: undefined,
                    businessType: item.businessType
                }),
                    interfacePath = {
                        // getAmountAndProportion: this.webapi.getAmountAndProportion,
                        // updateCarryForwardModeAndProportion: this.webapi.updateCarryForwardModeAndProportion
                    }
                getAmountAndProportion.businessType = item.businessType
                const result = this.metaAction.modal('show', {
                    title: '结转领料成本设置',
                    width: 560,
                    footer: null,
                    iconType: null,
                    okText: '保存',
                    bodyStyle: { padding: '12px 0px' },
                    className: 'inventoryCosting-modal-container',
                    children: <InventoryCosting
                        period={period}
                        initData={getAmountAndProportion}
                        hasSaleCostCarryForwardDoc={isAccountedMonth}
                        isAccountedMonth={isAccountedMonth}
                        callBack={_this.saveOption}
                        accountRelationsClick={_this.accountRelationsClick}
                        interfacePath={interfacePath}
                    />
                })
                if (result) {
                    await this.getData()
                }
                setTimeout(() => {
                    this.injections.reduce('btnIsClickState', { path: 'data.other.isClick', value: true })
                }, 10)
            }

        } else if (item.businessType == 5000040024) {//结转结转生产入库
            if (isClick) {
                this.injections.reduce('btnIsClickState', { path: 'data.other.isClick', value: false })
                let getAmountAndProportion = await this.webapi.getAmountAndProportion({
                    year: periodDate.split('-')[0],
                    month: periodDate.split('-')[1],
                    carryForwardSource: undefined,
                    carryForwardMode: undefined,
                    businessType: item.businessType
                }),
                    interfacePath = {}
                getAmountAndProportion.businessType = item.businessType
                const result = this.metaAction.modal('show', {
                    title: '结转生产入库设置',
                    width: 560,
                    footer: null,
                    iconType: null,
                    okText: '保存',
                    bodyStyle: { padding: '12px 0px' },
                    className: 'inventoryCosting-modal-container',
                    children: <InventoryCosting
                        period={period}
                        initData={getAmountAndProportion}
                        hasSaleCostCarryForwardDoc={isAccountedMonth}
                        isAccountedMonth={isAccountedMonth}
                        callBack={_this.saveOption}
                        accountRelationsClick={_this.accountRelationsClick}
                        interfacePath={interfacePath}
                    />
                })
                if (result) {
                    await this.getData()
                }
                setTimeout(() => {
                    this.injections.reduce('btnIsClickState', { path: 'data.other.isClick', value: true })
                }, 10)
            }
        } else if (item.businessType == 5000040018) {//计提附加税费
            const result = await this.metaAction.modal('show', {
                title: <div><div style={{ float: 'left' }}>计提附加税</div><a style={{ float: 'right' }} onClick={() => this.openTaxFormula()}>基数计税公式</a></div>,
                height: 500,
                width: 900,
                okText: '保存',
                bodyStyle: { paddingTop: '0px' },
                children: this.metaAction.loadApp('ttk-gl-app-withdrawing', {
                    store: this.component.props.store,
                    initData: {
                        period: period,
                        isAccountedMonth: isAccountedMonth
                    }
                })
            })
            await this.getData()

        } else if (item.businessType == 5000040006) {//结转汇兑损益
            const period = this.metaAction.gf('data.other.period')
            const disabledDate = this.metaAction.gf('data.other.disabledDate')
            const isAccountedMonth = this.metaAction.gf('data.other.isAccountedMonth')
            let comparePeriod = this.metaAction.gf('data.other.comparePeriod')
            let year = Number(comparePeriod.split('-')[0]), month = Number(comparePeriod.split('-')[1])
            if (month && month < 10) {
                month = `0${month}`
            }
            comparePeriod = `${year}-${month}`
            this.metaAction.modal('show', {
                title: '输入期末汇率',
                width: 400,
                height: 300,
                footer: null,
                iconType: null,
                okText: '调汇',
                className: 'exchangeGainOrLoss-modal-container',
                children: <ExchangeGainOrLoss
                    period={period}
                    disabledDate={disabledDate}
                    initQuery={this.handleInitQuery}
                    isAccountedMonth={isAccountedMonth}
                    comparePeriod={comparePeriod}
                    accountSetClick={_this.accountSetClick}
                    confirm={this.exchangeConfirm} />
            })

        } else if (item.businessType == 5000040014) {
            const result = await this.metaAction.modal('show', {
                title: '所得税设置',
                height: 500,
                width: 650,
                okText: '保存',
                bodyStyle: { paddingTop: '0px' },
                children: this.metaAction.loadApp('ttk-gl-app-corporateincometax', {
                    store: this.component.props.store,
                    initData: {
                        period: period,
                        isAccountedMonth: isAccountedMonth
                    }
                })
            })
            if (!result) {
                return false
            } else {
                await this.getData()
            }
        } else if (item.businessType == 5000040022) {//结转制造费用
            const period = this.metaAction.gf('data.other.period')
            item.year = period.split('-')[0]
            item.period = period.split('-')[1] 
            const result = await this.metaAction.modal('show', {
                title: '结转制造费用',
                // height: 500,
                width: 1000,
                okText: '保存',
                children: this.metaAction.loadApp(`ttk-gl-app-forward-manufacturing`, {
                    store: this.component.props.store,
                    initData: {
                        item: item,
                        isEdit: this.metaAction.gf('data.other.isEdit'),
                        period: period,                        
                        businessType: item.businessType
                    },
                    type: 'update',
                })
            })
            if (!result) {
                return false
            } else {
                await this.getData()
            }
        } else if (item.businessType == 5000040004) {//结转损益
            const period = this.metaAction.gf('data.other.period')
            const disabledDate = this.metaAction.gf('data.other.disabledDate')
            const isAccountedMonth = this.metaAction.gf('data.other.isAccountedMonth')
            let comparePeriod = this.metaAction.gf('data.other.comparePeriod')
            let queryEditInfo = await this.webapi.queryEditInfo({ year: period.split('-')[0], month: period.split('-')[1] })

            if (queryEditInfo) {
                queryEditInfo.profitAmount = utils.number.addThousPos(queryEditInfo.profitAmount)
                queryEditInfo.lossAmount = utils.number.addThousPos(queryEditInfo.lossAmount)
            }

            this.metaAction.modal('show', {
                title: '结转凭证规则',
                width: 400,
                footer: null,
                iconType: null,
                okText: '确定',
                className: 'ProfitAndLoss-modal-container',
                children: <ProfitAndLoss
                    period={period}
                    disabledDate={disabledDate}
                    initQuery={this.handleInitQuery}
                    isAccountedMonth={isAccountedMonth}
                    comparePeriod={comparePeriod}
                    editInfo={queryEditInfo}
                    callBack={this.profitAndLossConfirm}
                />
            })
        } else if (item.businessType == 5000040007) {//结转研发成本
            const period = this.metaAction.gf('data.other.period')
            item.year = period.split('-')[0]
            item.period = period.split('-')[1]           
            const result = await this.metaAction.modal('show', {
                title: '结转研发成本',              
                width: 1000,
                okText: '保存',
                children: this.metaAction.loadApp(`ttk-gl-app-forward-manufacturing`, {
                    store: this.component.props.store,
                    initData: {
                        item: item,
                        isEdit: this.metaAction.gf('data.other.isEdit'),
                        period: period,                       
                        businessType: item.businessType
                    },
                    type: 'update',
                })
            })
            if (!result) {
                return false
            } else {
                await this.getData()
            }
        } else {
            let isHasProfitAndLossDoc = await this.webapi.isHasProfitAndLossDoc(period)
            if (isHasProfitAndLossDoc) {
                this.metaAction.toast('warning', '当前期间结转损益凭证已经审核，不可编辑自定义模板')
                return
            }
            if (item.isAudited == true) {//凭证已经审核
                const ret = await this.metaAction.modal('confirm', {
                    title: '修改',
                    content: '当期对应自定义凭证将会跟随变动，是否确认修改自定义模板？',
                    onOk() {
                        _this.updateItem(item)
                    },
                    onCancel() { }
                })
            } else {
                this.updateItem(item)
            }
        }
    }
    openTaxFormula = async () => {
        const period = this.metaAction.gf('data.other.period')
        const result = await this.metaAction.modal('show', {
            title: '基数计税公式',
            // height: 500,
            width: 900,
            okText: '保存',
            className: 'app-tax-formula-modal',
            children: this.metaAction.loadApp('ttk-gl-app-tax-formula', {
                store: this.component.props.store,
                initData: {
                    period: period
                }
            })
        })
    }
    profitAndLossConfirm = async (params) => {
        const { docProduceModel, period } = params.state
        const response = await this.webapi.saveEditProduceModel({ year: period.split('-')[0], month: period.split('-')[1], docProduceModel, isReturnValue: true })
        if (response && response.error && response.error.message) {
            this.metaAction.toast('error', response.error.message)
        } else {
            this.metaAction.toast('success', '保存成功')
            await this.getData()
        }
    }
    checkAllState = () => {
        let list = this.metaAction.gf('data.list') && this.metaAction.gf('data.list').toJS()
        if (list) {

            let option = list.find(item => {
                if (item.amount > 0 && !item.docId) {
                    return item
                }
            })
            if (option) {
                return false
            } else {
                return true
            }
        } else {
            return false
        }

    }
    handleInitQuery = async () => {//结转汇兑损益
        let periodDate = this.metaAction.gf('data.other.period'),
            period = { year: Number(periodDate.split('-')[0]), period: Number(periodDate.split('-')[1]) }

        const resCurrency = await this.webapi.exchangeList({ dto: period })
        return resCurrency
    }
    exchangeConfirm = async (params) => { //结转汇兑损益设置 调汇
        let options = params.dtos.map(item => {
            item.exchangeRate = clearThousandsPosition(item.exchangeRate)
            return item
        })
        params.dtos = options
        const res = await this.webapi.exchangeUpdate(params)
        if (res == null) {
            this.metaAction.toast('success', '调汇成功')
            await this.getData()
            this.metaAction.sf('data.other.checkAll', false)
        }
    }

    saveOption = async (form) => {
        const { amount, period, proportion, carryForwardMode, carryForwardSource, businessType } = form.state
        if (proportion == '' && carryForwardMode == 5000090001) {
            this.metaAction.toast('warning', '比例不能为空')
            return
        }
        let res = await this.webapi.updateCarryForwardModeAndProportion({
            carryForwardMode, carryForwardSource, proportion, year: period.year, month: period.month, businessType
        })
        if (res) {
            await this.getData()
        }

    }
    updateItem = async (item) => {
        let period = this.metaAction.gf('data.other.period'),
            list = this.metaAction.gf('data.list').toJS()
        item.year = period.split('-')[0]
        item.period = period.split('-')[1]
        if (item.templateId) {
            let appName = item.templateType == 0 ? 'app-account-cerficate-add' : 'app-account-cerficate-high-add',
                title = item.templateType == 0 ? '自定义模板' : '高级自定义模板'
            const result = await this.metaAction.modal('show', {
                title: title,
                // height: 500,
                width: 1000,
                okText: '保存',
                children: this.metaAction.loadApp(`${appName}`, {
                    store: this.component.props.store,
                    initData: {
                        item: item,
                        isEdit: this.metaAction.gf('data.other.isEdit'),
                        period: period,
                        list: list
                    },
                    type: 'update',
                })
            })
            if (result) {
                await this.getData()
            }
        }

    }
    addModal = async () => {//新增模板
        let period = this.metaAction.gf('data.other.period'),
            isHasProfitAndLossDoc = await this.webapi.isHasProfitAndLossDoc({ year: period.split('-')[0], month: period.split('-')[1] })

        if (isHasProfitAndLossDoc) {
            this.metaAction.toast('warning', '当前期间结转损益凭证已经审核，不可新增自定义模板')
            return
        }

        const result = await this.metaAction.modal('show', {
            title: '自定义模板',
            // height: 500,
            width: 860,
            okText: '保存',
            children: this.metaAction.loadApp('app-account-cerficate-add', {
                store: this.component.props.store,
                initData: {
                    period: period
                },
                type: 'add'
            })
        })
        if (result) {
            await this.getData()
        }
    }
    addHighModal = async () => {
        let period = this.metaAction.gf('data.other.period'),
            isHasProfitAndLossDoc = await this.webapi.isHasProfitAndLossDoc({ year: period.split('-')[0], month: period.split('-')[1] })

        if (isHasProfitAndLossDoc) {
            this.metaAction.toast('warning', '当前期间结转损益凭证已经审核，不可新增自定义模板')
            return
        }

        const result = await this.metaAction.modal('show', {
            title: '高级自定义模板',
            // height: 500,
            width: 920,
            okText: '保存',
            children: this.metaAction.loadApp('app-account-cerficate-high-add', {
                store: this.component.props.store,
                initData: {
                    period: period
                },
                type: 'add'
            })
        })
        if (result) {
            await this.getData()
        }
    }
    linkProofList = async (docId) => {
        // let period = this.metaAction.gf('data.other.period')
        let reqObj = {
            year: this.year,
            month: this.month,
            businessTypeId: 5000040022
        }
        const resp = await this.webapi.queryBuBusinessType(reqObj)
        const ret = await this.metaAction.modal('show', {
            title: '查看凭证',
            style: { top: 5 },
            width: 1200,
            bodyStyle: { paddingBottom: '0px' },
            className: 'batchCopyDoc-modal',
            okText: '保存',
            children: this.metaAction.loadApp('app-proof-of-charge', {
                store: this.component.props.store,
                initData: {
                    type: 'isFromXdz',
                    id: resp.docId,
                }
            })
        })
    }
    examine = () => {

    }
    formatAmount = (item) => {
        if (item.businessType == 5000040006 &&
            this.metaAction.gf('data.isHasExchangeRate') == false &&
            this.metaAction.gf('data.generateMode') == 0) {
            return '--'
        } else {
            return utils.number.format(item.amount, 2)
        }

    }

    getCarryForwardCheckTitle = () => {
        let accountingStandards = this.metaAction.context.get("currentOrg").accountingStandards,
            checkTitle = ''

        if (accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization) {
            checkTitle = '净资产结转检查'
        } else {
            checkTitle = '损益结转检查'
        }

        return checkTitle
    }

    getCarryForwardTitle = () => {
        let accountingStandards = this.metaAction.context.get("currentOrg").accountingStandards,
            title = ''

        if (accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization) {
            title = '净资产结转'
        } else {
            title = '损益结转'
        }

        return title
    }

    isDisplayAssetCheck = () => {
        let accountingStandards = this.metaAction.context.get("currentOrg").accountingStandards

        return accountingStandards != consts.ACCOUNTINGSTANDARDS_nonProfitOrganization
    }

    getProfitRptName = () => {
        let accountingStandards = this.metaAction.context.get("currentOrg").accountingStandards, title

        if (accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization) {
            title = '业务活动表'
        } else {
            title = '利润表'
        }

        return title
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, voucherAction }),
        ret = { ...metaAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
class DateCellCustom extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        if (!this.props.maxClosingPeriod) {
            return (
                <div >
                    {Number(moment(this.props.nowTime).format('MM'))}月
				</div>
            )
        } else {
            if ((moment(this.props.nowTime) <= moment(this.props.maxClosingPeriod)) && (moment(this.props.nowTime) >= moment(this.props.enableTime))) {
                return (
                    <div style={{ position: 'relative' }}>
                        {Number(moment(this.props.nowTime).format('MM'))}月
						<Icon type="duigou"
                            fontFamily='edficon'
                            className='iconCustom'
                            style={{ fontSize: '17px', float: 'right', position: 'absolute', top: '-4px', right: '-12px' }} />
                    </div>
                )
            } else {
                return (
                    <div >
                        {Number(moment(this.props.nowTime).format('MM'))}月
					</div>
                )
            }
        }
    }
}
function clearThousandsPosition(num) {
    if (num && num.toString().indexOf(',') > -1) {
        let x = num.toString().split(',')
        return parseFloat(x.join(""))
    } else {
        return num
    }
}
