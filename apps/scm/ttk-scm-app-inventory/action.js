import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import renderColumns from './utils/renderColumns'
import config from './config'
import extend from './extend'
import { fromJS } from 'immutable'
import moment from 'moment'
import utils from 'edf-utils'
import img from '../../../vendor/img/scm/noContent.png'

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
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }

        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener('onTabFocus', :: this.onTabFocus)
            addEventListener('enlargeClick', () => this.onResize({}))
        }
        injections.reduce('init')

        let tabEdit = this.component.props.tabEdit
        this.load(tabEdit)
    }

    load = async (tabEdit) => {
        let query = await this.webapi.inventory.query()
        if (query == '0') {   // 未启用,获取开账时间
            const currentOrg = this.metaAction.context.get("currentOrg")
            const enabledPeriod = currentOrg.enabledYear + '-' + `${currentOrg.enabledMonth}`.padStart(2, '0') //'2018-01'
            const appNames = 'inventory'
            const ret = await this.metaAction.modal('show', {
                title: '存货核算',
                wrapClassName: 'inventory-card',
                width: 490,
                okText: '确定',
                bodyStyle: { padding: '10px 35px' },
                children: this.metaAction.loadApp('ttk-scm-app-inventory-card', {
                    store: this.component.props.store,
                    enabledPeriod,
                    tabEdit,
                    appNames
                }),
            })
            if (ret) {
                this.injections.reduce('upDateStart', 'data.other.enableTime', ret.beginDate)
                this.queryTime = ret.beginDate
                this.initLoad()

                this.component.props.onPortalReload && this.component.props.onPortalReload('noReloadTplus')
            }
        } else {
            this.injections.reduce('upDateStart', 'data.other.enableTime', query)
            this.queryTime = query
            this.initLoad()  // 启用存货核算
        }
    }
    initLoad = async (inventoryPropertyId, searchDate) => {
        this.metaAction.sf('data.other.loading', true)
        const { enabledMonth, enabledYear, periodDate } = this.metaAction.context.get('currentOrg') //获取全局的启用日期
        let date, searchTime, errText
        if (this.component.props.accessType && this.component.props.errText) {
            errText = this.component.props.errText
            this.metaAction.toast('error', errText, 6)
        }

        if (periodDate) {
            let a = this.queryTime.replace('-', ''), b = periodDate.replace('-', '')
            if (a < b) {
                searchTime = periodDate
            } else {
                searchTime = this.queryTime
            }
            date = utils.date.transformMomentDate(searchTime)
            this.injections.reduce('upDateStart', 'data.searchValue.startDate', date)
            this.injections.reduce('upDateStart', 'data.form.startDate', date)
        }
        let startDate
        if (searchDate) {
            // 刷新，时间不动
            startDate = this.metaAction.momentToString(searchDate, 'YYYY-MM')
            this.metaAction.sfs({
                'data.searchValue.startDate': moment(searchDate),
                'data.form.startDate': moment(searchDate)
            })
        } else {
            startDate = searchTime
        }

        let accountRadioValue = this.metaAction.gf('data.other.accountRadioValue')
        let initSummaryRpt
        if (accountRadioValue === 'tab1') {
            let filter = {
                beginAccountingYear: startDate && startDate.slice(0, 4),
                beginAccountingPeriod: startDate && startDate.substring(5),
                endAccountingYear: startDate && startDate.slice(0, 4),
                endAccountingPeriod: startDate && startDate.substring(5),
                inventoryPropertyId,
                page: {
                    currentPage: 1,
                    pageSize: 50
                }
            }
            initSummaryRpt = await this.webapi.inventory.initSummaryRpt(filter) //初始化
        } else {
            let beginDate = moment(startDate).startOf('month').format('YYYY-MM-DD')
            let endDate = moment(startDate).endOf('month').format('YYYY-MM-DD')
            let filter = {
                entity: {
                    initData: true,
                    beginDate,
                    endDate,
                    propertyId: inventoryPropertyId,
                    page: {
                        currentPage: 1,
                        pageSize: 50
                    }
                }
            }
            initSummaryRpt = await this.webapi.inventory.queryLedgerPEList(filter) //初始化
        }

        this.metaAction.sf('data.other.loading', false)
        this.injections.reduce('load', initSummaryRpt, accountRadioValue)
        setTimeout(() => {
            this.onResize()
        }, 50)
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
        setTimeout(() => {
            if (keyRandomTab == this.keyRandomTab) {
                this.getTableScroll()
            }
        }, 200)
    }

    getTableScroll = (e) => {
        try {
            let tableOption = this.metaAction.gf('data.tableOption').toJS()
            let appDom = document.getElementsByClassName('ttk-scm-app-inventory')[0];//以app为检索范围
            let tableWrapperDom = appDom.getElementsByClassName('ant-table-wrapper')[0];//table wrapper包含整个table,table的高度基于这个dom

            if (!tableWrapperDom) {
                if (e) {
                    return
                }
                setTimeout(() => {
                    this.getTableScroll()
                }, 100)
                return
            }
            //ant-table有滚动时存在2个table分别包含theadDom和tbodyDom,无滚动时有1个table包含theadDom和tbodyDom
            let theadDom = tableWrapperDom.getElementsByClassName('ant-table-thead')[0];
            let tbodyDom = tableWrapperDom.getElementsByClassName('ant-table-tbody')[0];

            if (tbodyDom && tableWrapperDom && theadDom) {
                let num = tableWrapperDom.offsetHeight - tbodyDom.offsetHeight - theadDom.offsetHeight;
                const width = tableWrapperDom.offsetWidth;
                const height = tableWrapperDom.offsetHeight;
                if (num < 0) {
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                        y: height - theadDom.offsetHeight,
                    })
                } else {
                    delete tableOption.y
                    this.injections.reduce('setTableOption', {
                        ...tableOption,
                    })
                }
            }
        } catch (err) {
        }
    }

    componentDidUpdate = () => {
        // console.log(this.metaAction.gf('data.tableOption').toJS())
    }

    componentWillUnmount = () => {
        if (this.props && this.props.isFix === true) return
        const win = window
        if (win.removeEventListener) {
            win.removeEventListener('resize', this.onResize, false)
        } else if (win.detachEvent) {
            win.detachEvent('onresize', this.onResize)
        } else {
            win.onresize = undefined
        }
    }

    renderEmpty = () => {
        return (
            <div className='emptyList'>
                <img class="mk-nodata-img" src={img} />
                <span class="mk-nodata-message">暂无数据</span>
            </div>)
    }
    onTabFocus = async (props) => {

        let query = await this.webapi.inventory.query(), errText
        if (query == '0') {
            let tabEdit = this.component.props.tabEdit
            this.load(tabEdit)
            return false
        }
        // 单据成本计算跳转
        if (props.accessType && props.errText) {
            errText = props.errText
            this.metaAction.toast('error', errText, 6)
        }
        this.queryTime = query
        this.refresh()
    }

    filterOptionSummary = (input, option) => {
        if (option && option.props && option.props.children) {
            return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
        return true
    }
    //获取时间选项
    getNormalDateValue = () => {
        const data = this.metaAction.gf('data.searchValue').toJS()
        return data.startDate
    }

    handleDisabledDate = (current) => {
        if (current) {
            let enableTime = this.metaAction.gf('data.other.enableTime'), currentDate = current.format('YYYY-MM')
            if (enableTime) {
                enableTime = enableTime.size ? enableTime.toJS() : enableTime
                enableTime = enableTime.replace(/-/g, '')
            }
            if (currentDate) currentDate = currentDate.replace(/-/g, '')
            return currentDate && currentDate < enableTime
        }
    }

    // 普通查询时间改变
    changeDate = (value) => {
        let date = utils.moment.stringToMoment(value).endOf('month')
        this.metaAction.sf('data.searchValue.startDate', date)
        this.metaAction.sf('data.form.startDate', date)

        let type = this.metaAction.gf('data.form.typeId')
        let filter
        if (type) {
            filter = {
                beginAccountingYear: value.slice(0, 4),
                beginAccountingPeriod: value.substring(5),
                endAccountingYear: value.slice(0, 4),
                endAccountingPeriod: value.substring(5),
                inventoryPropertyId: type,
            }
        } else {
            filter = {
                beginAccountingYear: value.slice(0, 4),
                beginAccountingPeriod: value.substring(5),
                endAccountingYear: value.slice(0, 4),
                endAccountingPeriod: value.substring(5),
            }
        }
        this.getSearchList(filter)
    }

    getSearchCard = (childrenRef) => {
        this.searchCard = childrenRef
    }

    // 高级查询
    searchValueChange = (value) => {
        this.injections.reduce('searchUpdate', value)
        this.getSearchList()
    }

    // 存货属性修改
    selectType = (v) => {
        let value
        if (v) value = v.value
        this.injections.reduce('upDate', value)
        this.getSearchList()
    }

    refresh = () => {
        let type = this.metaAction.gf('data.form.typeId')
        let date = this.metaAction.gf('data.form.startDate')
        this.initLoad(type, date)
    }
    // 查询方法
    getSearchList = async () => {
        let accountRadioValue = this.metaAction.gf('data.other.accountRadioValue')
        let searchValue = this.metaAction.gf('data.searchValue').toJS(),
            startDate = this.metaAction.momentToString(searchValue.startDate, 'YYYY-MM'),
            page = this.metaAction.gf('data.page').toJS()
        let inventoryPropertyId = searchValue.type
        this.metaAction.sf('data.other.loading', true)

        if (accountRadioValue === 'tab1') {
            let filter = {
                beginAccountingYear: startDate.slice(0, 4),
                beginAccountingPeriod: startDate.substring(5),
                endAccountingYear: startDate.slice(0, 4),
                endAccountingPeriod: startDate.substring(5),
                inventoryPropertyId,
                page: {
                    currentPage: page['tab1'].currentPage,
                    pageSize: page['tab1'].pageSize
                }
            }
            let res = await this.webapi.inventory.getInventory(filter)
            if (res) this.injections.reduce('load', { getList: res.details, page: res.page }, accountRadioValue)
        } else {
            let beginDate = moment(startDate).startOf('month').format('YYYY-MM-DD')
            let endDate = moment(startDate).endOf('month').format('YYYY-MM-DD')
            let filter = {
                entity: {
                    initData: false,
                    beginDate,
                    endDate,
                    propertyId: inventoryPropertyId,
                    page: {
                        currentPage: page['tab2'].currentPage,
                        pageSize: page['tab2'].pageSize
                    }
                }
            }
            let res = await this.webapi.inventory.queryLedgerPEList(filter)
            if (res) this.injections.reduce('load', { estimateList: res.estimateList, page: res.page }, accountRadioValue)
        }
        this.metaAction.sf('data.other.loading', false)
        setTimeout(() => {
            this.onResize()
        }, 100)
    }

    noCell = (text, row, index) => {
        if (!text) {
            if (row && !row.inventoryName) {
                return obj = {
                    props: {
                        colSpan: 1,
                        className: 'lastTd'
                    }
                }
            }
            return
        }

        text = utils.number.format(text, 2)
        let obj
        obj = {
            children: <span title={text}>{text}</span>,
            props: {
                colSpan: 1,
                className: row && !row.inventoryName ? 'lastTd' : ''
            }
        }
        return obj
    }
    noCell2 = (text, row, index) => {
        if (!text) {
            if (row && !row.inventoryName) {
                return obj = {
                    props: {
                        colSpan: 1,
                        className: 'lastTd'
                    }
                }
            }
            return
        }
        text = utils.number.format(text, 6)
        let obj
        obj = {
            children: <span title={text}>{text}</span>,
            props: {
                colSpan: 1,
                className: row && !row.inventoryName ? 'lastTd' : ''
            }
        }
        return obj
    }
    cellSum = (text, row, index) => {
        let obj
        if (row && !row.inventoryName) {
            obj = {
                props: {
                    colSpan: 0,
                },
            }
        } else {
            obj = {
                children: <span title={text}>{text}</span>,
                props: {
                    colSpan: 1,
                }
            }
        }
        return obj
    }
    handleRowClassName = (record, index) => {
        if (!record.inventoryName) {
            return 'tr_heji'
        } else {
            return 'tr_normal'
        }
    }
    cellName = (text, row, index) => {  //存货名称
        let accountRadioValue = this.metaAction.gf('data.other.accountRadioValue')
        let obj
        if (row && !row.inventoryName) {
            obj = {
                children: <span title='合计' style={{ textAlign: 'center !important' }}>合计</span>,
                props: {
                    colSpan: accountRadioValue === 'tab1' ? 4 : 5,
                    className: 'lastTd'
                },
            }
        } else {
            obj = {
                children: <a onClick={() => this.toDetail(row.inventoryId, row.inventoryName, row.propertyId)} title={text}>
                    {text}</a>,
                props: {
                    colSpan: 1
                }
            }
        }
        return obj
    }
    // 跳转到明细表
    toDetail = (id, inventoryName, propertyId) => {
        let searchValue = this.metaAction.gf('data.searchValue').toJS()
        let startDate = this.metaAction.momentToString(searchValue.startDate, 'YYYY-MM')
        this.detailTable('detail', id, inventoryName, propertyId, startDate)
    }

    tableColumns = (accountRadioValue) => {
        let cellArr = [this.noCell, this.cellName, this.cellSum, this.noCell2];

        return renderColumns(accountRadioValue, ...cellArr)
    }

    // 生成凭证
    getVoucher = async () => {
        let isAuditBatch = this.metaAction.gf('data.other.isAuditBatch')
        let accountRadioValue = this.metaAction.gf('data.other.accountRadioValue')
        if (!isAuditBatch) return false
        this.metaAction.sf('data.other.isAuditBatch', false)

        let searchValue = this.metaAction.gf('data.searchValue').toJS(),
            startDate = this.metaAction.momentToString(searchValue.startDate, 'YYYY-MM'),
            list = this.metaAction.gf(`data.other.tableList.${accountRadioValue}`)
        list = list.size ? list.toJS() : list
        if (!list.length) {
            this.metaAction.toast('error', '当前没有可生成凭证的数据')
            this.metaAction.sf('data.other.isAuditBatch', true)
            return false
        }
        let filter = {
            beginAccountingYear: startDate.slice(0, 4),
            beginAccountingPeriod: startDate.substring(5)
        }
        let res = await this.webapi.inventory.auditBatch(filter)

        if (res && res.message == 'deleteAndGenerateDoc') {
            const resConirm = await this.metaAction.modal('confirm', {
                content: `本月已存在库存单据生成凭证，生成凭证将删除之前的凭证，库存单据将重新合并生成一张单据，是否继续`,
                okText: '确定',
                className: 'ttk-scm-app-inventory-confirm',
                bodyStyle: { padding: 24, fontSize: 12 },
            })
            if (resConirm) {
                const resBatch = await this.webapi.inventory.unauditAndauditBatch(filter)
                if (resBatch && resBatch.fail && resBatch.fail.length) {
                    this.showError('生成凭证结果', resBatch.success, resBatch.fail)
                } else if (resBatch) {
                    this.metaAction.toast('success', '生成凭证成功')
                }
            }
        } else if (res && res.fail && res.fail.length) {
            this.showError('生成凭证结果', res.success, res.fail)
        } else if (res) {
            this.metaAction.toast('success', '生成凭证成功')
        }
        this.metaAction.sf('data.other.isAuditBatch', true)
        // this.refresh()
    }
    showError = (title, successArr, oldFailArr) => {
        let failArr = []
        if (oldFailArr && oldFailArr.length) {
            oldFailArr.map(item => {
                failArr.push({
                    message: item.errorMsg
                })
            })
        }
        const ret = this.metaAction.modal('show', {
            title,
            width: 585,
            bodyStyle: { padding: '2px 0 10px 11px' },
            children: this.metaAction.loadApp('ttk-scm-app-error-list', {
                store: this.component.props.store,
                successArr,
                failArr
            }),
        })
    }

    moreMenuClick = (e) => {
        this[e.key] && this[e.key]()
    }

    subjectSetting = () => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('科目设置', 'edfx-business-subject-manage?from=inventory', { accessType: 'inventory' })
    }

    delBatch = async () => {

        let accountRadioValue = this.metaAction.gf('data.other.accountRadioValue')
        let searchValue = this.metaAction.gf('data.searchValue').toJS(),
            startDate = this.metaAction.momentToString(searchValue.startDate, 'YYYY-MM'),
            list = this.metaAction.gf(`data.other.tableList.${accountRadioValue}`)
        list = list.size ? list.toJS() : list
        if (!list.length) {
            this.metaAction.toast('error', '当前没有可删除的凭证')
            return false
        }
        let filter = {
            beginAccountingYear: startDate.slice(0, 4),
            beginAccountingPeriod: startDate.substring(5)
        }
        let res = await this.webapi.inventory.unauditBatch(filter)
        if (res && res.fail && res.fail.length) {
            this.showError('删除凭证结果', res.success, res.fail)
        } else if (res) {
            this.metaAction.toast('success', '删除凭证成功')
        }
        // this.refresh()
    }

    //按比例自动计算销售成本
    salesAutomaticCalculation = async () => {
        let date = this.queryTime
        let lastDayOfUnEndingClosingCalendar = this.metaAction.gf('data.other.lastDayOfUnEndingClosingCalendar'),
            methodId = this.metaAction.gf('data.form.methodId')

        const ret = await this.metaAction.modal('show', {
            title: '按比例自动计算销售成本',
            wrapClassName: 'inventory-automaticcalculation',
            width: 900,
            okText: '确定',
            bodyStyle: { padding: '0' },
            closeModal: this.close,
            closeBack: (back) => { this.closeTip = back },
            children: this.metaAction.loadApp('ttk-scm-app-inventory-automaticcalculation', {
                store: this.component.props.store,
                initData: {
                    date,
                    lastDayOfUnEndingClosingCalendar: lastDayOfUnEndingClosingCalendar,
                    type: methodId == '4' ? 'costSaleRatio' : undefined
                }
            }),
        })
        if (ret) {
            this.refresh()
        }
    }

    close = (ret) => {
        this.closeTip()
    }

    // 成本计算
    // 1、如果存在生成凭证的单据的月份，不能进行成本计算
    // 2、已经月结的月份，不能进行计算成本
    // 3、点击计算成本，如果上月未结账，提示“上月未结账，不能计算成本！”
    calculateCost = async () => {
        let isCalculateCost = this.metaAction.gf('data.other.isCalculateCost')
        if (!isCalculateCost) return false
        this.metaAction.sf('data.other.isCalculateCost', false)

        let searchValue = this.metaAction.gf('data.searchValue').toJS(),
            startDate = this.metaAction.momentToString(searchValue.startDate, 'YYYY-MM')

        let filter = {
            year: startDate.slice(0, 4),
            month: startDate.substring(5),
        }
        this.metaAction.sf('data.other.loading', true)
        let res = await this.webapi.inventory.reCalcCost(filter)

        this.metaAction.sfs({
            'data.other.loading': false,
            'data.other.isCalculateCost': true
        })
        if (res && res.length == 0) {
            this.metaAction.toast('success', '计算成功')
        } else if (res && res.length) {
            res.map((item, index) => {
                res[index] = `存货编码${item}`
            })
            const resConirm = await this.metaAction.modal('warning', {
                content: `${res.join('、')}的出库成本为0或负数，请进行暂估入库或产品入库`,
                okText: '确定',
                className: 'ttk-scm-app-inventory-confirm',
                bodyStyle: { padding: 24, fontSize: 12 },
            })
            // if (resConirm) this.metaAction.toast('success', '计算成功')
        }
        this.refresh()
    }

    // 设置
    setting = async () => {
        let enableTime = this.metaAction.gf('data.other.enableTime'),
            periodBeginDate = this.metaAction.gf('data.other.periodBeginDate')

        enableTime = enableTime.size ? enableTime.toJS() : enableTime
        const ret = await this.metaAction.modal('show', {
            title: '设置',
            wrapClassName: 'inventory-card',
            width: 490,
            okText: '确定',
            bodyStyle: { padding: '0 25px 5px 15px' },
            children: this.metaAction.loadApp('ttk-scm-app-inventory-setting', {
                store: this.component.props.store,
                resetPortal: this.component.props.resetPortal,
                onPortalReload: this.component.props.onPortalReload,
                initData: {
                    paramValue: enableTime,
                    periodBeginDate: periodBeginDate,
                    tabEdit: this.component.props.tabEdit
                }
            }),
        })
        if (ret) {
            this.queryTime = ret.paramValue
            if (ret.option) {
                this.injections.reduce('upDateStart', 'data.other.productAccountMode', ret.option.productionAccounting + "")
                this.injections.reduce('upDateStart', 'data.other.mode', ret.option.mode + "")
                this.injections.reduce('upDateStart', 'data.form.methodId', ret.option.mode + "")
                this.injections.reduce('upDateStart', 'data.other.recoilMode', ret.option.recoilMode + "")
            }
            this.injections.reduce('upDateStart', 'data.other.enableTime', ret.paramValue)
            this.metaAction.toast('success', '设置成功')
        }
    }
    // 导出
    export = async () => {
        let accountRadioValue = this.metaAction.gf('data.other.accountRadioValue')
        let list = this.metaAction.gf(`data.other.tableList.${accountRadioValue}`)
        list = list.size ? list.toJS() : list
        if (list.length) {
            let searchValue = this.metaAction.gf('data.searchValue').toJS(),
                startDate = this.metaAction.momentToString(searchValue.startDate, 'YYYY-MM')
            let inventoryPropertyId = searchValue.type
            let filter = {
                beginAccountingYear: startDate.slice(0, 4),
                beginAccountingPeriod: startDate.substring(5),
                endAccountingYear: startDate.slice(0, 4),
                endAccountingPeriod: startDate.substring(5),
                inventoryPropertyId
            }
            let res
            if (accountRadioValue === 'tab1') {
                res = await this.webapi.inventory.export(filter)
            } else {
                let beginDate = moment(startDate).startOf('month').format('YYYY-MM-DD')
                let endDate = moment(startDate).endOf('month').format('YYYY-MM-DD')
                let filter = {
                    initData: false,
                    beginDate,
                    endDate,
                    propertyId: inventoryPropertyId
                }
                res = await this.webapi.inventory.exportLedgerPEList(filter)
            }

            if (res) this.metaAction.toast('success', '导出成功')
        } else {
            this.metaAction.toast('warning', '当前没有可导出数据')
            return false
        }
    }
    //打印
    print = async () => {
        let accountRadioValue = this.metaAction.gf('data.other.accountRadioValue')
        let list = this.metaAction.gf(`data.other.tableList.${accountRadioValue}`)
        list = list.size ? list.toJS() : list
        if (list.length) {
            let searchValue = this.metaAction.gf('data.searchValue').toJS(),
                startDate = this.metaAction.momentToString(searchValue.startDate, 'YYYY-MM')
            let inventoryPropertyId = searchValue.type
            let filter = {
                beginAccountingYear: startDate.slice(0, 4),
                beginAccountingPeriod: startDate.substring(5),
                endAccountingYear: startDate.slice(0, 4),
                endAccountingPeriod: startDate.substring(5),
                inventoryPropertyId
            }
            let res
            if (accountRadioValue === 'tab1') {
                res = await this.webapi.inventory.print(filter)
            } else {
                let beginDate = moment(startDate).startOf('month').format('YYYY-MM-DD')
                let endDate = moment(startDate).endOf('month').format('YYYY-MM-DD')
                let filter = {
                    initData: false,
                    beginDate,
                    endDate,
                    propertyId: inventoryPropertyId
                }
                res = await this.webapi.inventory.printLedgerPEList(filter)
            }

            if (res) this.metaAction.toast('success', '打印成功')
        } else {
            this.metaAction.toast('warning', '当前没有可打印数据')
            return false
        }

    }
    detailTable = async (name, id, inventoryName, propertyId, startDate) => {   // 出入库明细表
        let enableTime = this.metaAction.gf('data.other.enableTime')
        enableTime = enableTime.size ? enableTime.toJS() : enableTime
        let productAccountMode = this.metaAction.gf('data.other.productAccountMode')
        let mode = this.metaAction.gf('data.form.methodId')
        if (id) {
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent('出入库明细表', 'ttk-scm-app-warehouse-detail',
                    {
                        accessType: 1,
                        startDate,
                        enableTime,
                        detailId: id,
                        inventoryName,
                        propertyId,
                        proMethod: productAccountMode,
                        type: mode
                    })
        } else {
            this.component.props.setPortalContent &&
                this.component.props.setPortalContent('出入库明细表', 'ttk-scm-app-warehouse-detail',
                    { accessType: 1, startDate, enableTime, proMethod: productAccountMode, type: mode })
        }
    }
    addInventory = async (e) => { // 库存单据
        let productAccountMode = this.metaAction.gf('data.other.productAccountMode')
        let mode = this.metaAction.gf('data.form.methodId')
        let recoilMode = this.metaAction.gf('data.other.recoilMode')
        if (e.key) {
            let appName = e.key == 'addInventoryIn' ? 'ttk-scm-app-inventory-documents?key=in' : 'ttk-scm-app-inventory-documents?key=out'
            let name = e.key == 'addInventoryIn' ? '入库单' : '出库单'
            let lastDayOfUnEndingClosingCalendar = this.metaAction.gf('data.other.lastDayOfUnEndingClosingCalendar')

            this.component.props.setPortalContent &&
                this.component.props.setPortalContent(name,
                    appName, {
                        accessType: 1, inventoryId: 'NewInventory',
                        inventoryType: e.key, proMethod: productAccountMode,
                        type: mode,
                        lastDayOfUnEndingClosingCalendar: lastDayOfUnEndingClosingCalendar,
                        recoilMode: recoilMode
                    })
        }
    }

    addAAAAA = async () => { // 存货期初
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('存货期初', 'ttk-scm-app-warehouse-beginning')
    }

    linkToEstimateList = () => {
        let date = this.metaAction.gf('data.searchValue').toJS().startDate
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent('暂估存货', 'ttk-scm-app-estimate-list', { accessType: 1, date })
    }

    getButtonName = (mode, productAccountMode) => {
        if (productAccountMode == '3') {
            return '按比例自动计算销售成本'
        } else if (mode == '4') {
            return '以销定产确定销售成本'
        } else {
            return '成本计算'
        }
    }
    handleAccountRadioValueChange = (e) => {
        this.metaAction.sf('data.other.accountRadioValue', e.target.value);
        let tabEdit = this.component.props.tabEdit
        this.load(tabEdit)
    }

    pageChanged = async (currentPage, pageSize) => {
        // console.log(currentPage, pageSize)
        const accountRadioValue = this.metaAction.gf('data.other.accountRadioValue')
        const page = this.metaAction.gf('data.page').toJS()

        if (currentPage) {
            this.metaAction.sf(`data.page.${accountRadioValue}.currentPage`, currentPage)
        }

        if (pageSize) {
            this.metaAction.sf(`data.page.${accountRadioValue}.pageSize`, pageSize)
        }

        this.getSearchList()
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

// const EditableCell = ({ value, onBlur, onEnter}) => {
//     return (
//         <div style={{textAlign: 'right'}}>
//             <Input.Number
//                 // key={Math.random()}
//                 style={{ margin: '-5px 0' }} 
//                 // customAttribute={customAttribute}
//                 // className='app-account-beginbalance-tableClass' 
//                 // onPressEnter={(e) => onEnter(e)}
//                 value={value}
//                 // onBlur={(value) => onBlur(value)} 
//                 regex='^(-?[0-9]+)(?:\.[0-9]{1,2})?$'/>
//             }
//         </div>
//     )
// }