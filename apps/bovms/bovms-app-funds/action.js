import React from "react"
import { action as MetaAction } from "edf-meta-engine"
import config from "./config"
import { fromJS } from "immutable"
import { Tooltip, Pagination } from "edf-component"
import { Spin } from "antd"
import moment from "moment"
import { number } from "edf-utils"
import FundsImportStatement from "../components/funds/importStatement"
import FundsHeader from "../components/funds/header"
import FundsTable from "../components/funds/table"
import FundBatchSubjectSetting from "../components/funds/batchSubjectSetting"
import ProdectSeting from "../components/prodectSeting"
import ImportPopup from "../components/funds/importStatement/importPopup"
import SubjectSetting from "../components/subjectSetting"

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.webapi = this.config.webapi
        this.menuClick = {
            createVoucher: false,
        }
    }

    onInit = async ({ component, injections }) => {
        this.component = component
        this.injections = injections
        injections.reduce("init")
        await this.initPage()
    }

    initPage = async (nsqj, bankAcctId) => {
        this.metaAction.sf("data.loading", true)
        //获取上下文会计时间
        const periodDate = (this.metaAction.context.get("currentOrg") || {}).periodDate
        nsqj =
            (moment.isMoment(nsqj) && nsqj.format("YYYY-MM")) ||
            nsqj ||
            periodDate ||
            moment().subtract(0, "month").format("YYYY-MM-DD").substr(0, 7)
        let tbsdFun = this.getTableSettingData()
        let resBankList
        // 切换银行账号 即非初始化界面 不需要调用银行账号接口 直接取传入值
        if (!bankAcctId) {
            resBankList = await this.webapi.funds.getFlowfundBankAccountList({
                yearPeriod: nsqj.replace("-", ""),
            })
            if (resBankList && resBankList.length) {
                bankAcctId = resBankList[0].id
            } else {
                bankAcctId = undefined
            }
        }
        let resAccount = await this.webapi.funds.queryAccount()
        let resTable = await this.webapi.funds.queryFlowfundPageList({
            isInit: true,
            isSelectedAll: "N",
            entity: {
                yearPeriod: nsqj.replace("-", ""),
                bankAcctId: bankAcctId,
            },
            page: {
                currentPage: 1,
                pageSize: 50,
            },
            orders: [],
        })

        const accountInfo = {
            vatTaxpayer: resAccount && resAccount.vatTaxpayer, //2000010001：一般纳税人，2000010002：小规模纳税人
            yearPeriod: nsqj,
            enabledYearAndMonth: resAccount.enabledYear
                ? `${resAccount.enabledYear}-${("0" + resAccount.enabledMonth).slice(-2)}`
                : null,
            /** 是否辅导期 */
            isTutorialDate: resAccount.isTutorialDate,
            /** 有效期起 */
            tutorialBeginDate: resAccount.tutorialBeginDate,
            /** 有效期止 */
            tutorialEndDate: resAccount.tutorialEndDate,
        }

        let {
            filterData,
            tableData,
            pagination,
            defaultTableData,
            defaultFilterData,
            totalData,
            bankList,
        } = this.metaAction.gf("data").toJS()
        if (resTable) {
            filterData = {
                ...filterData,
                ...defaultFilterData,
                yearPeriod: nsqj,
                bankAcctId,
            }
            tableData = {
                ...tableData,
                ...defaultTableData,
                tableSource: resTable.list || [],
            }

            const pageAndTotal = this.setPageAndTotal(resTable, pagination, totalData)
            pagination = pageAndTotal.pagination
            totalData = pageAndTotal.totalData
            this.metaAction.sfs({
                "data.filterData": fromJS(filterData),
                "data.tableData": fromJS(tableData),
                "data.pagination": fromJS(pagination),
                "data.totalData": fromJS(totalData),
                "data.accountInfo": fromJS(accountInfo),
                "data.totalRecordInDB": resTable.totalRecordInDB,
                "data.bankList": resBankList && resBankList.length ? resBankList : bankList, //如果resBankList有值 说明是初始化页面或切换月份
            })
        }
        this.metaAction.sf("data.loading", false)
    }

    reLoad = async (current, pageSize) => {
        this.metaAction.sfs({
            "data.loading": true,
            "data.initPage": true,
        })
        let { filterData, tableData, pagination, totalData } = this.metaAction.gf("data").toJS()
        let orders = []
        Object.keys(tableData.sortOptin).some(key => {
            if (tableData.sortOptin[key]) {
                orders.push({
                    name: key,
                    asc: tableData.sortOptin[key] === "desc" ? false : true,
                })
            }
        })
        const webRes = await this.webapi.funds.queryFlowfundPageList({
            isInit: false,
            isSelectedAll: "N",
            entity: {
                yearPeriod: filterData.yearPeriod.replace("-", ""),
                bankAcctId: filterData.bankAcctId,
            },
            partyAcctOrSummaryName: filterData.partyAcctOrSummaryName,
            vchStateCode: filterData.vchStateCode,
            accountMatchState: filterData.accountMatchState,
            flowfundType: filterData.flowfundType,
            startAmount: filterData.startAmount,
            endAmount: filterData.endAmount,
            page: {
                ...pagination,
                currentPage: current || pagination.currentPage || 1,
                pageSize: pageSize || pagination.pageSize,
            },
            orders: orders,
        })
        if (webRes) {
            tableData = {
                ...tableData,
                tableSource: webRes.list || [],
                selectedRowKeys: [],
            }
            const pageAndTotal = this.setPageAndTotal(webRes, pagination, totalData)
            pagination = pageAndTotal.pagination
            totalData = pageAndTotal.totalData
            this.metaAction.sfs({
                "data.tableData": fromJS(tableData),
                "data.pagination": fromJS(pagination),
                "data.totalData": fromJS(totalData),
                "data.tableAllList": fromJS([]),
                "data.totalRecordInDB": webRes.totalRecordInDB,
            })
        }
        this.metaAction.sfs({
            "data.loading": false,
            "data.initPage": false,
        })
        this.cancelTableEdit()
        //this.getWebData({ url: '/v1/bovms/queryList', pagination })
    }
    setPageAndTotal(resTable, pagination, totalData) {
        pagination = {
            ...pagination,
            ...(resTable.page || {}),
        }
        totalData = {
            flowTotalQty: resTable.flowTotalQty, //交易流水总数量
            totalPaymentAmount: resTable.totalPaymentAmount, // 付款总金额
            totalCollectionAmount: resTable.totalCollectionAmount, // 收款总金额
            nonVchState2FlowQty: resTable.nonVchState2FlowQty, // 未记账（未生成凭证或者生成凭证失败）流水数量
        }
        return {
            pagination,
            totalData,
        }
    }
    setHabit = async () => {
        this.metaAction.modal("show", {
            title: "凭证习惯",
            style: { top: 25 },
            width: 900,
            okText: "保存",
            wrapClassName: "bovms-app-purchase-list-habit-setting",
            children: (
                <ProdectSeting
                    metaAction={this.metaAction}
                    store={this.component.props.store}
                    webapi={this.webapi}
                />
            ),
        })
    }
    renderChildren = () => {
        const totalRecordInDB = this.metaAction.gf("data.totalRecordInDB")
        const loading = this.metaAction.gf("data.loading")
        const isSearchTable = this.metaAction.gf("data.initPage")
        return (
            <Spin tip="加载中..." delay={500} spinning={loading}>
                {(isSearchTable || !loading) && totalRecordInDB > 0 ? this.renderFilter() : null}
                {(isSearchTable || !loading) && totalRecordInDB > 0 ? this.renderTable() : null}
                {(isSearchTable || !loading) && totalRecordInDB > 0 ? this.renderFooter() : null}
                {!loading && totalRecordInDB <= 0 ? this.renderGuidePage() : null}
            </Spin>
        )
    }
    renderGuidePage() {
        const filterData = this.metaAction.gf("data.filterData").toJS()
        return (
            <FundsImportStatement
                yearPeriod={(filterData.yearPeriod && moment(filterData.yearPeriod)) || undefined}
                initPage={this.initPage}
                webapi={this.webapi}
                metaAction={this.metaAction}
                store={this.component.props.store}></FundsImportStatement>
        )
    }

    renderFilter = () => {
        const filterData = this.metaAction.gf("data.filterData").toJS()
        const bankList = this.metaAction.gf("data.bankList")
        return (
            <FundsHeader
                className="bovms-app-purchase-list-filter bovms-app-funds-filter"
                filterData={filterData}
                bankList={bankList}
                handleMenuClick={this.filterHandleMenuClick}
                webapi={this.webapi}
                metaAction={this.metaAction}
                store={this.component.props.store}></FundsHeader>
        )
    }
    renderTable = () => {
        const tableData = this.metaAction.gf("data.tableData").toJS()
        return (
            <FundsTable
                className="bovms-app-purchase-list-table"
                multipleRowEdit={this.multipleRowEdit}
                reLoad={this.reLoad}
                data={tableData}
                webapi={this.webapi}
                metaAction={this.metaAction}
                store={this.component.props.store}
                createVoucher={this.createVoucher}
                cancelTableEdit={this.cancelTableEdit}></FundsTable>
        )
    }
    renderFooter = () => {
        const { pageSize, currentPage, totalCount } = this.metaAction.gf("data.pagination").toJS()
        return (
            <div className="bovms-app-purchase-list-footer">
                {this.renderFooterTotal()}
                <Pagination
                    pageSizeOptions={["50", "100", "200", "300", "500"]}
                    pageSize={pageSize}
                    current={currentPage}
                    total={totalCount}
                    onChange={this.pageChanged}
                    onShowSizeChange={this.pageChanged}
                    showTotal={total => this.renderFooterPagination(total)}></Pagination>
            </div>
        )
    }

    renderFooterTotal = () => {
        let {
            flowTotalQty, //交易流水总数量
            totalPaymentAmount, // 付款总金额
            totalCollectionAmount, // 收款总金额
            nonVchState2FlowQty, // 未记账（未生成凭证或者生成凭证失败）流水数量
        } = this.metaAction.gf("data.totalData").toJS()
        const { tableSource, selectedRowKeys } = this.metaAction.gf("data.tableData").toJS()
        const tableAllList = this.metaAction.gf("data.tableAllList").toJS()
        if (selectedRowKeys && selectedRowKeys.length > 0) {
            const isCheckAll = (Array.isArray(tableAllList) && tableAllList.length > 0) || false
            if (!isCheckAll) {
                flowTotalQty = 0
                totalPaymentAmount = 0
                totalCollectionAmount = 0
                nonVchState2FlowQty = 0
            }
            flowTotalQty = selectedRowKeys.length
            tableSource.forEach(item => {
                if (isCheckAll) {
                    // 有了选择多页全部，计算用减法
                    if (selectedRowKeys.findIndex(f => item.id == f) === -1) {
                        if (item.vchState != 2) {
                            nonVchState2FlowQty--
                        }
                        if (item.flowfundType == 1) {
                            totalCollectionAmount -= item.amount
                        } else {
                            totalPaymentAmount -= item.amount
                        }
                    }
                } else {
                    if (selectedRowKeys.findIndex(f => item.id == f) > -1) {
                        if (item.vchState != 2) {
                            nonVchState2FlowQty++
                        }
                        if (item.flowfundType == 1) {
                            totalCollectionAmount += item.amount
                        } else {
                            totalPaymentAmount += item.amount
                        }
                    }
                }
            })
        }
        let content = (
            <div className="footer-total-content">
                <span>
                    {selectedRowKeys && selectedRowKeys.length > 0 ? "已选" : ""}
                    合计
                </span>
                <span>
                    交易流水：
                    <strong>{flowTotalQty}</strong>(条)
                </span>
                <span>
                    付款：
                    <strong>{this.quantityFormat(totalPaymentAmount, 2, false, false)}</strong>
                    (元)
                </span>
                <span>
                    收款：
                    <strong>
                        {this.quantityFormat(totalCollectionAmount, 2, false, false)}
                    </strong>{" "}
                    (元)
                </span>
                <span>
                    未生成凭证：<strong>{nonVchState2FlowQty}</strong>(条)
                </span>
            </div>
        )
        return (
            <Tooltip placement="topLeft" title={content} overlayClassName="bovms-app-footer-tool">
                <div className="footer-total">{content}</div>
            </Tooltip>
        )
    }

    renderFooterPagination = total => {
        return (
            <span>
                共<strong>{total}</strong>条记录
            </span>
        )
    }
    pageChanged = (current, pageSize) => {
        this.reLoad(current, pageSize)
    }
    //数量格式化
    numberFormat = (v, decimals, isFocus, clearZero) => {
        if (isFocus === true) return v
        let val = number.format(v, decimals)
        //去除小数点后面的0
        if (!isFocus && clearZero === true && typeof val === "string") {
            let [a, b] = val.split(".")
            return b && Number(b) ? `${a}.${Number(`0.${b}`).toString().slice(2)}` : a
        }
        return val
    }
    quantityFormat = (quantity, decimals, isFocus, clearZero) => {
        if (quantity !== undefined) {
            return this.numberFormat(quantity, decimals, isFocus, clearZero)
        }
    }

    //科目设置弹窗
    setSubject = async () => {
        this.metaAction.modal("show", {
            title: "科目设置",
            style: { top: 25 },
            width: 800,
            okText: "保存",
            wrapClassName: "bovms-app-purchase-list-subject-setting",
            children: (
                <SubjectSetting
                    store={this.component.props.store}
                    metaAction={this.metaAction}
                    webapi={this.webapi}
                    module="fund"
                />
            ),
        })
    }
    // 生成凭证
    createVoucher = async id => {
        const { selectedRowKeys, tableSource } = this.metaAction.gf("data.tableData").toJS()
        let ids = (id && [id]) || []
        // ids要根据列表顺序传递
        if (ids && ids.length === 0) {
            // const { tableSource, selectedRowKeys } = this.metaAction.gf('data.tableData').toJS()
            const tableAllList = this.metaAction.gf("data.tableAllList").toJS()
            ;(Array.isArray(tableAllList) && tableAllList.length > 0
                ? tableAllList
                : tableSource
            ).forEach(item => {
                if (selectedRowKeys.findIndex(f => f == item.id) > -1) {
                    ids.push(item.id)
                }
            })
        }
        if (ids.length < 1) {
            this.metaAction.toast("error", "请选择需要操作的数据")
            return
        }
        if (this.menuClick["createVoucher"]) return
        this.menuClick["createVoucher"] = true
        this.metaAction.sfs({
            "data.loading": true,
            "data.initPage": true,
        })
        const yearPeriod = parseInt(
            this.metaAction.gf("data.filterData.yearPeriod").replace("-", "")
        ) //后端要求日期必须传Int类型
        const bankAcctId = this.metaAction.gf("data.filterData.bankAcctId")
        const res = await this.webapi.funds.createVoucher({
            yearPeriod,
            bankAcctId,
            ids,
        })
        this.menuClick["createVoucher"] = false
        this.metaAction.sfs({
            "data.loading": false,
            "data.initPage": false,
        })
        if (res && res.accountSetupRequired == 1) {
            this.metaAction.modal("confirm", {
                content: "税额科目未设置，请选进行设置，再生成凭证。",
                iconType: "exclamation-circle",
                onOk: () => {
                    this.setSubject()
                },
                okText: "现在设置",
            })
            return
        }
        if (res && res.unitChangeList) {
            this.unitConversion({
                yearPeriod,
                ids,
                unitChangeList: res.unitChangeList,
            })
            return
        }
        if (res && res.state == 0) {
            this.metaAction.toast("success", "生成凭证成功")
            this.reLoad()
            return
        }
        if (res && res.state == 1 && res.errMessage) {
            this.metaAction.toast("error", res.errMessage)
            this.reLoad()
            return
        }
        this.reLoad()
    }
    // 按钮事件
    filterHandleMenuClick = type => {
        this.cancelTableEdit()
        switch (type) {
            case "batchSetSubject": //批设科目
                this.batchSetSubject()
                break
            case "createVoucher": //生成凭证
                this.createVoucher()
                break
            case "setVoucher": //凭证习惯
                this.setHabit()
                break
            case "setSubject": //科目设置
                this.setSubject()
                break

            case "delStatement": //删除对账单
                this.delStatement()
                break
            case "delVoucher": //删除对账单
                this.delVoucher()
                break
            case "importStatement": //导入对账单
                this.importStatement()
                break
            case "bankAcct":
                this.toBankAcct()
                break
        }
        switch (type) {
            case "searchPage": //页面搜索
                return this.reLoad
            case "initPage": //页面初始化
            case "changeBankAcct":
                return this.initPage
        }
    }
    async toBankAcct() {
        await this.component.props.setPortalContent("账户", "app-list-account")
    }
    async importStatement() {
        const yearPeriod = parseInt(
            this.metaAction.gf("data.filterData.yearPeriod").replace("-", "")
        )
        let res = await this.metaAction.modal("show", {
            title: "导入银行对账单",
            width: 1000,
            footer: false,
            style: { top: 25 },
            wrapClassName: "bovms-batch-subject-setting",
            children: (
                <ImportPopup
                    yearPeriod={yearPeriod}
                    webapi={this.webapi}
                    metaAction={this.metaAction}
                    store={this.component.props.store}
                    initPage={this.initPage}
                />
            ),
        })
    }
    // 删除凭证
    delVoucher = async () => {
        const { selectedRowKeys, tableSource } = this.metaAction.gf("data.tableData").toJS()
        if (!selectedRowKeys || !selectedRowKeys[0]) {
            this.metaAction.toast("error", "请选择需要操作的数据")
            return
        }
        let vchIds = []
        const tableAllList = this.metaAction.gf("data.tableAllList").toJS()
        ;(Array.isArray(tableAllList) && tableAllList.length > 0
            ? tableAllList
            : tableSource
        ).forEach(item => {
            if (selectedRowKeys.findIndex(f => f == item.id) > -1 && item.vchId > -1) {
                vchIds.push(item.vchId)
            }
        })
        if (vchIds.length === 0) {
            this.metaAction.toast("error", "没有可删除的凭证")
            return
        }

        const confirm = await this.metaAction.modal("confirm", {
            content: `确定要删除凭证吗？`,
            width: 340,
        })
        if (confirm) {
            this.metaAction.sfs({
                "data.loading": true,
                "data.initPage": true,
            })
            const bankAcctId = this.metaAction.gf("data.filterData.bankAcctId")
            const yearPeriod = parseInt(
                this.metaAction.gf("data.filterData.yearPeriod").replace("-", "")
            )
            let fundVchIds = Array.from(new Set(vchIds))
            const res = await this.webapi.funds.deleteFlowfundVoucher({
                bankAcctId,
                yearPeriod,
                fundVchIds,
                isReturnValue: true,
            })
            this.metaAction.sfs({
                "data.loading": false,
                "data.initPage": false,
            })
            // 如果失败，返回结果格式为：{"result":false,"error":{"message":"凭证已审核，不可删除"}}
            // 如果成功，返回结果格式为：{"result":true,"value":null}
            if (res && !res.result && res.error && res.error.message) {
                this.metaAction.toast("error", res.error.message)
            } else {
                this.metaAction.toast("success", "凭证删除成功")
                this.reLoad()
            }
            return
        }
    }
    // 删除对账单
    delStatement = async () => {
        // const { selectedRowKeys, tableSource } = this.metaAction.gf('data.tableData').toJS()
        // if (!selectedRowKeys || !selectedRowKeys[0]) {
        //     this.metaAction.toast('error', '请选择需要操作的数据')
        //     return
        // }
        // const tableAllList = this.metaAction.gf('data.tableAllList').toJS();

        // if ((Array.isArray(tableAllList) && tableAllList.length > 0 ? tableAllList : tableSource).some(s => selectedRowKeys.findIndex(f => f == s.id) > -1 && s.vchState == 2)) {
        //     this.metaAction.toast('error', '对账单已经生成了凭证，请先删除凭证')
        //     return
        // }
        const confirm = await this.metaAction.modal("confirm", {
            content: `确定要删除对账单吗？`,
            width: 340,
        })
        if (confirm) {
            this.metaAction.sfs({
                "data.loading": true,
                "data.initPage": true,
            })
            const bankAcctId = this.metaAction.gf("data.filterData.bankAcctId")
            const yearPeriod = parseInt(
                this.metaAction.gf("data.filterData.yearPeriod").replace("-", "")
            )
            const res = await this.webapi.funds.deleteBankStatement({
                yearPeriod,
                bankAcctId,
                isReturnValue: true,
            })
            this.metaAction.sfs({
                "data.loading": false,
                "data.initPage": false,
            })
            if (res && !res.result && res.error && res.error.message) {
                this.metaAction.toast("error", res.error.message)
            } else {
                this.metaAction.toast("success", "对账单删除成功")
                this.initPage(this.metaAction.gf("data.filterData.yearPeriod"))
            }
            return
        }
    }
    //批设科目弹窗
    batchSetSubject = async () => {
        let selected = this.metaAction.gf("data.tableData.selectedRowKeys").toJS(),
            tableSource = this.metaAction.gf("data.tableData.tableSource").toJS(),
            tableAllList = this.metaAction.gf("data.tableAllList").toJS()
        //判断是否选择未生成凭证对账单
        if (
            selected.length &&
            selected.every(
                item =>
                    (Array.isArray(tableAllList) && tableAllList.length > 0
                        ? tableAllList
                        : tableSource
                    ).findIndex(f => f.id == item && f.vchState == 2) > -1
            )
        ) {
            this.metaAction.toast("error", "请选择未生成凭证的流水进行设置")
            return
        }

        //判断是否选择发票
        if (selected.length) {
            let modalWidth = document.body.clientWidth - 50
            let modalHeight = document.body.clientHeight - 10
            if (modalWidth > 1920) modalWidth = 1920
            let res = await this.metaAction.modal("show", {
                title: "批设科目",
                width: modalWidth,
                height: modalHeight,
                bodyStyle: {
                    maxHeight: modalHeight - 47,
                    overflow: "auto",
                },
                style: { top: 25 },
                footer: false,
                wrapClassName: "bovms-batch-subject-setting collect-invoice",
                children: (
                    <FundBatchSubjectSetting
                        metaAction={this.metaAction}
                        store={this.component.props.store}
                        webapi={this.webapi}
                        isSelectedAll={"N"}
                    />
                ),
            })

            if (res == "needReload") {
                this.reLoad()
            }
        } else {
            this.metaAction.toast("error", "请选择未生成凭证的流水进行设置")
        }
    }
    async getTableSettingData() {
        const res = await this.webapi.funds.queryColumnSetup({ module: 4 })
        let tableSettingData = []
        if (res && res.columnJson && res.columnJson.indexOf("{") > -1) {
            tableSettingData = JSON.parse(res.columnJson)
        }
        this.metaAction.sfs({
            "data.tableData.tableSettingData": fromJS(tableSettingData),
        })
    }
    // 取消表格编辑状态
    cancelTableEdit = () => {
        const data = this.metaAction.gf("data.tableData.tableSource").toJS() || []
        //如果有缓存数据则取缓存数据
        const newData =
            this.metaAction.gf("data.editingCachaData") &&
            this.metaAction.gf("data.editingCachaData").toJS()
                ? this.metaAction.gf("data.editingCachaData").toJS()
                : data
        newData.forEach(item => {
            item.editable = false
        })
        this.metaAction.sfs({
            // 'data.tableData.tableSource': fromJS(data),
            "data.tableData.tableSource": fromJS(newData),
            "data.tableData.editingKey": "",
            "data.tableData.isCheckDisabled": false,
            "data.editingCachaData": undefined,
        })
    }

    btnClick = () => {
        this.injections.reduce("modifyContent")
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
