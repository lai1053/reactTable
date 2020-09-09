import React from "react"
import { action as MetaAction } from "edf-meta-engine"
import config from "./config"
import { fromJS } from "immutable"
import { Tooltip } from "edf-component"
import UnitConversion from "../components/unitConversion"
import HabitSetting from "../components/newHabitSetting"
import SubjectSetting from "../components/subjectSetting"
import BovmsPurchaseTable from "../components/DataGrid"
import BovmsPurchaseHeader from "../components/header"
import RowEdit from "../components/rowEdit"
import moment from "moment"
import { number } from "edf-utils"
import { Pagination } from "edf-component"
import { Spin } from "antd"
import BatchSubjectSetting from "../components/batchSubjectSetting"
import ChaPiao from "../components/chaPiao"
import ConversionRatio from "../components/conversionRatio"
import Checked from "../components/checked"

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
        // console.time('业务销项－页面初始化请求接口耗时')
        await this.getIsCollectInv()
        // console.timeEnd('业务销项－页面初始化请求接口耗时')
        // 再次进入 refresh
        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
            addEventListener("onTabFocus", () => {
                this.initPage()
                setTimeout(() => {
                    let ev = new Event("resize")
                    window.dispatchEvent(ev)
                }, 20)
            })
        }
    }

    async getTableSettingData() {
        const res = await this.webapi.bovms.queryColumnSetup({ module: 1 })
        let tableSettingData = []
        if (res && res.columnJson && res.columnJson.indexOf("{") > -1) {
            tableSettingData = JSON.parse(res.columnJson)
            //解决旧数据没有存货类型
            if (!tableSettingData.find(f => f.caption === "存货类型")) {
                tableSettingData.splice(15, 0, {
                    id: "propertyName",
                    caption: "存货类型",
                    isVisible: false,
                    isMustSelect: true,
                    width: 130,
                })
            }
        }
        this.metaAction.sfs({
            "data.tableData.tableSettingData": fromJS(tableSettingData),
        })
    }
    getIsCollectInv = async nsqj => {
        this.metaAction.sf("data.loading", true)
        const periodDate = (this.metaAction.context.get("currentOrg") || {}).periodDate
        nsqj =
            (moment.isMoment(nsqj) && nsqj.format("YYYY-MM")) ||
            nsqj ||
            periodDate ||
            moment().subtract(1, "month").format("YYYY-MM-DD").substr(0, 7)
        // nsqj = moment.isMoment(nsqj) ? nsqj.format('YYYY-MM') : nsqj || moment().subtract(1, "month").format('YYYY-MM-DD').substr(0, 7)
        const resStockFun = this.webapi.bovms.getStockActivationInfo({
                period: nsqj,
            }),
            resAccountFun = this.webapi.bovms.queryAccount({
                yearPeriod: String(nsqj).replace("-", ""),
                isFront: "Y",
            }),
            tbsdFun = this.getTableSettingData()
        const resStock = await resStockFun,
            resAccount = await resAccountFun,
            resTable = await this.webapi.bovms.querySalePageList({
                entity: {
                    yearPeriod: nsqj.replace("-", ""),
                },
                page: {
                    currentPage: 1,
                    pageSize: 50,
                },
                invenState: resStock && resStock.state,
                orders: [],
            })
        const accountInfo = {
            vatTaxpayer: resAccount && resAccount.vatTaxpayer, //2000010001：一般纳税人，2000010002：小规模纳税人
            yearPeriod: nsqj,
            orgId: resAccount.id,
            stock: resStock && resStock.state, //（1启用，0未启用，2关闭）
            enabledYearAndMonth: resAccount.enabledYear
                ? `${resAccount.enabledYear}-${("0" + resAccount.enabledMonth).slice(-2)}`
                : null,
            /** 是否辅导期 */
            isTutorialDate: resAccount.isTutorialDate,
            /** 有效期起 */
            tutorialBeginDate: resAccount.tutorialBeginDate,
            /** 有效期止 */
            tutorialEndDate: resAccount.tutorialEndDate,
            sobCheck: true,
        }
        // accountInfo.vatTaxpayer = this.getVatTaxpayerName(undefined, accountInfo);
        if (
            !(
                resAccount.accountingStandards &&
                resAccount.industry &&
                resAccount.name &&
                resAccount.vatTaxpayer
            )
        ) {
            accountInfo.sobCheck = false
            // this.metaAction.toast(
            //     "error",
            //     "账套信息不完整，不能进行科目的自动匹配，请前往【账套管理】模块补充完整"
            // );
        }
        let {
            filterData,
            tableData,
            pagination,
            defaultTableData,
            defaultFilterData,
            totalData,
        } = this.metaAction.gf("data").toJS()
        if (resTable) {
            filterData = {
                ...filterData,
                ...defaultFilterData,
                yearPeriod: nsqj,
            }
            tableData = {
                ...tableData,
                ...defaultTableData,
                isStock: resStock && resStock.state,
                tableSource: resTable.list || [],
            }
            const pageAndTotal = this.setPageAndTotal(resTable, pagination, totalData)
            pagination = pageAndTotal.pagination
            totalData = pageAndTotal.totalData
            this.metaAction.sfs({
                "data.filterData": fromJS(filterData),
                "data.tableData": fromJS(tableData),
                "data.pagination": fromJS(pagination),
                "data.accountInfo": fromJS(accountInfo),
                "data.totalData": fromJS(totalData),
            })
        }
        this.metaAction.sf("data.loading", false)
    }
    setPageAndTotal(resTable, pagination, totalData) {
        pagination = {
            ...pagination,
            ...(resTable.page || {}),
        }
        totalData = {
            totalFpInDB: resTable.totalFpInDB, //数据库发票总数
            totalFpNum: resTable.totalFpNum, // 总的发票张数
            positiveAmount: resTable.positiveAmount, // 正价税合计总数
            positiveTaxAmount: resTable.positiveTaxAmount, // 正税额总数
            negativeAmount: resTable.negativeAmount, // 负价税合计总数
            negativeTaxAmount: resTable.negativeTaxAmount, // 负税额总数
            nonVchState2FpNum: resTable.nonVchState2FpNum, // 未记账（未生成凭证或者生成凭证失败）发票数
            positiveExTaxAmount: resTable.positiveExTaxAmount, // 金额
            negativeExTaxAmount: resTable.negativeExTaxAmount, // 金额
        }
        return {
            pagination,
            totalData,
        }
    }

    initPage = async (current, pageSize) => {
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
        const webRes = await this.webapi.bovms.querySalePageList({
            entity: {
                yearPeriod: filterData.yearPeriod.replace("-", ""),
                custName: filterData.custName,
                invKindCode: filterData.invKindCode,
                rzzt: filterData.rzzt,
                invNo: filterData.goodsName,
            },
            goodsName: filterData.goodsName,
            minAmount: filterData.minAmount,
            maxAmount: filterData.maxAmount,
            minBillDate: filterData.minBillDate,
            maxBillDate: filterData.maxBillDate,
            vchStateCode: filterData.vchStateCode,
            accountMatchState: filterData.accountMatchState,
            invenState: tableData.isStock,
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
            })
        }
        this.metaAction.sfs({
            "data.loading": false,
            "data.initPage": false,
        })
        this.cancelTableEdit()
        //this.getWebData({ url: '/v1/bovms/queryList', pagination })
    }
    filterHandleMenuClick = type => {
        this.cancelTableEdit()
        switch (type) {
            case "collectInvoice": //取票
                this.collectInvoice()
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
            case "pathSetSubject": //批设科目
                this.batchSetSubject()
                break
            case "delInvoice": //删除发票
                this.delInvoice()
                break
            case "delVoucher": //删除凭证
                this.delVoucher()
                break
            case "chaPiao": //删除凭证
                this.caPiao()
                break
            case "conversionRadio": //换算比率
                this.conversionRadio()
                break
        }
        switch (type) {
            case "searchPage": //页面搜索
                return this.initPage
            case "initPage": //页面初始化
                return this.getIsCollectInv
        }
    }
    conversionRadio = async () => {
        this.metaAction.modal("show", {
            title: "转换比率",
            style: { top: 25 },
            width: 1000,
            wrapClassName: "",
            footer: null,
            children: <ConversionRatio webapi={this.webapi} metaAction={this.metaAction} />,
        })
    }
    // 查票
    caPiao = async () => {
        const accountInfo = this.metaAction.gf("data.accountInfo").toJS()
        const id = this.metaAction.context.get("currentOrg").id
        const yearPeriod = accountInfo.yearPeriod // 纳税期间
        if (!accountInfo.sobCheck) {
            this.metaAction.modal("confirm", {
                className: "bovms-app-zt-confirm",
                width: 450,
                content: "账套信息不完整，不能进行查票。请补充完整！",
                iconType: "exclamation-circle",
                onOk: () => {
                    this.showZt(id, yearPeriod)
                },
                okText: "现在补充",
            })
            return
        }
        let vatTaxpayer = accountInfo.vatTaxpayer
        if (vatTaxpayer == 2000010003) {
            vatTaxpayer = 2000010001
        }
        this.metaAction.modal("show", {
            title: "查票",
            style: { top: 25 },
            width: 1100,
            wrapClassName: "",
            footer: null,
            children: (
                <ChaPiao
                    store={this.component.props.store}
                    webapi={this.webapi}
                    metaAction={this.metaAction}
                    type={"销项"}
                    nsqj={accountInfo.yearPeriod}
                    nsrxz={vatTaxpayer}
                    enabledYearAndMonth={accountInfo.enabledYearAndMonth}
                    stock={this.metaAction.gf("data.tableData.isStock")}
                    caPiaoOnOk={this.caPiaoOnOk}
                />
            ),
        })
    }
    // 查票关闭的回调
    caPiaoOnOk = async (arr, yearPeriod) => {
        this.metaAction.sf("data.loading", true)
        let type = this.metaAction.gf("data.type")
        let res
        let formatDate = `${(yearPeriod + "").substr(0, 4)}-${(yearPeriod + "").substr(4)}`
        this.metaAction.sf("data.loading", false)
        if (arr.length) {
            let modalWidth = document.body.clientWidth - 50
            let modalHeight = document.body.clientHeight - 10
            if (modalWidth > 1920) modalWidth = 1920
            this.metaAction.modal("show", {
                title: "批设科目",
                style: { top: 25 },
                width: modalWidth,
                height: modalHeight,
                bodyStyle: {
                    maxHeight: modalHeight - 47,
                    overflow: "auto",
                },
                okText: "保存",
                footer: false,
                wrapClassName: "bovms-batch-subject-setting collect-invoice",
                children: (
                    <BatchSubjectSetting
                        ids={arr}
                        yearPeriod={yearPeriod}
                        store={this.component.props.store}
                        webapi={this.webapi}
                        metaAction={this.metaAction}
                        nsqjChange={() => {
                            this.getIsCollectInv(formatDate)
                        }}
                        module="xs"
                        isStock={this.metaAction.gf("data.tableData.isStock") == 1 ? true : false}
                    />
                ),
            })
        } else {
            this.getIsCollectInv(formatDate)
        }
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
        const { stock } = this.metaAction.gf("data.accountInfo").toJS()
        let infoVoucher = []
        if (tableSource.length > 0) {
            ids.forEach(id => {
                tableSource.forEach(item => {
                    if (item.id === id) {
                        if (item.infoRequiredForVoucher) {
                            infoVoucher.push(item.infoRequiredForVoucher)
                        }
                    }
                })
            })
        }

        if (infoVoucher.length > 0) {
            if (stock == 1) {
                this.metaAction.toast("error", "生成凭证失败：所选择单据的存货档案、会计科目未设置")
                return
            } else {
                this.metaAction.toast("error", "生成凭证失败：所选择单据的会计科目未设置")
                return
            }
        }
        if (this.menuClick["createVoucher"]) return
        this.menuClick["createVoucher"] = true
        this.metaAction.sfs({
            "data.loading": true,
            "data.initPage": true,
        })
        const yearPeriod = parseInt(
            this.metaAction.gf("data.accountInfo.yearPeriod").replace("-", "")
        ) //后端要求日期必须传Int类型
        const res = await this.webapi.bovms.createVoucher({
            yearPeriod,
            ids,
        })
        this.menuClick["createVoucher"] = false
        this.metaAction.sfs({
            "data.loading": false,
            "data.initPage": false,
        })
        if (res && res.accountSetupRequired == 1) {
            this.metaAction.modal("confirm", {
                content: (
                    <div>
                        税额科目需要重新设置，原因可能是：
                        <p />
                        <div>1) 税额科目为空</div>
                        <div>2) 所设置的科目不是末级科目</div>
                        <div>3) 所设置的科目被禁用、删除、或带有辅助核算</div>
                    </div>
                ),
                iconType: "exclamation-circle",
                width: 400,
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
            this.initPage()
            return
        }
        if (res && res.state == 1 && res.errMessage) {
            this.metaAction.toast("error", res.errMessage)
            this.initPage()
            return
        }
        this.initPage()
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
            let vchIdsDisdinct = Array.from(new Set(vchIds))
            const res = await this.webapi.bovms.deleteSaleVoucher({
                vchIds: vchIdsDisdinct,
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
                this.initPage()
            }
            return
        }
    }
    // 删除发票
    delInvoice = async () => {
        const { selectedRowKeys, tableSource } = this.metaAction.gf("data.tableData").toJS()
        if (!selectedRowKeys || !selectedRowKeys[0]) {
            this.metaAction.toast("error", "请选择需要操作的数据")
            return
        }
        const tableAllList = this.metaAction.gf("data.tableAllList").toJS()

        if (
            (Array.isArray(tableAllList) && tableAllList.length > 0
                ? tableAllList
                : tableSource
            ).some(s => selectedRowKeys.findIndex(f => f == s.id) > -1 && s.vchState == 2)
        ) {
            this.metaAction.toast("error", "发票已经生成了凭证，请先删除凭证")
            return
        }
        const confirm = await this.metaAction.modal("confirm", {
            content: `确定要删除发票吗？`,
            width: 340,
        })
        if (confirm) {
            this.metaAction.sfs({
                "data.loading": true,
                "data.initPage": true,
            })
            const yearPeriod = this.metaAction.gf("data.accountInfo.yearPeriod")
            const res = await this.webapi.bovms.deleteBillSale({
                billId: selectedRowKeys,
                yearPeriod: yearPeriod.replace("-", ""),
                isReturnValue: true,
            })
            this.metaAction.sfs({
                "data.loading": false,
                "data.initPage": false,
            })
            if (res && !res.result && res.error && res.error.message) {
                this.metaAction.toast("error", res.error.message)
            } else {
                this.metaAction.toast("success", "发票删除成功")
                this.initPage()
            }
            return
        }
    }
    // 取票
    collectInvoice = async () => {
        const accountInfo = this.metaAction.gf("data.accountInfo").toJS()
        const id = this.metaAction.context.get("currentOrg").id
        const yearPeriod = accountInfo.yearPeriod // 纳税期间
        if (!accountInfo.sobCheck) {
            this.metaAction.modal("confirm", {
                className: "bovms-app-zt-confirm",
                width: 450,
                content: "账套信息不完整，不能进行取票。请补充完整！",
                iconType: "exclamation-circle",
                onOk: () => {
                    this.showZt(id, yearPeriod)
                },
                okText: "现在补充",
            })
            return
        }
        let nsqj = moment(accountInfo.yearPeriod).subtract(0, "month").format("YYYYMM")
        let modalWidth = document.body.clientWidth - 50
        let modalHeight = document.body.clientHeight - 10
        if (modalWidth > 1920) modalWidth = 1920
        this.metaAction.modal("show", {
            title: "取票",
            style: { top: 25 },
            width: modalWidth,
            height: modalHeight,
            bodyStyle: {
                maxHeight: modalHeight - 47,
                overflow: "auto",
            },
            footer: null,
            wrapClassName: "bovms-app-guidePage-chapiao-molde collect-invoice",
            children: (
                <Checked
                    store={this.component.props.store}
                    webapi={this.webapi}
                    module="xs"
                    metaAction={this.metaAction}
                    nsqj={accountInfo.yearPeriod}
                    vatTaxpayer={accountInfo.vatTaxpayer}
                    stock={this.metaAction.gf("data.tableData.isStock")}
                    nsqjChange={() => {
                        this.getIsCollectInv(accountInfo.yearPeriod)
                    }}
                />
            ),
        })
        // const accountInfo = this.metaAction.gf("data.accountInfo").toJS();
        // if(!accountInfo.sobCheck) {
        //     this.metaAction.toast('error', '账套信息不完整，不能进行科目的自动匹配，请前往【账套管理】模块补充完整')
        //     return;
        // }
        // this.metaAction.sf("data.loading", true);
        // let nsqj = moment(accountInfo.yearPeriod)
        //     .subtract(0, "month")
        //     .format("YYYYMM");
        // let data = {
        //     yearPeriod: nsqj
        // };
        // let res = await this.webapi.bovms.saleTake(data);
        // this.metaAction.sf("data.loading", false);

        // if (res) {
        //     this.metaAction.toast("success", res.message);
        //     if (res.bool === true) {
        //         this.metaAction.modal("show", {
        //             title: "批设科目",
        //             width: 1000,
        //             style: { top: 25 },
        //             okText: "保存",
        //             footer: false,
        //             wrapClassName: "bovms-batch-subject-setting",
        //             children: (
        //                 <BatchSubjectSetting
        //                     data={res}
        //                     store={this.component.props.store}
        //                     webapi={this.webapi}
        //                     yearPeriod={nsqj}
        //                     metaAction={this.metaAction}
        //                     nsqjChange={() => {
        //                         this.getIsCollectInv(accountInfo.yearPeriod);
        //                     }}
        //                     module="xs"
        //                     isStock={accountInfo.stock === 1 ? true : false}
        //                 />
        //             )
        //         });
        //     } else {
        //         this.getIsCollectInv(accountInfo.yearPeriod);
        //     }
        // }
    }
    //补充账套信息
    showZt = async (id, yearPeriod) => {
        const ret = await this.metaAction.modal("show", {
            title: "账套信息",
            width: 450,
            footer: null,
            children: this.metaAction.loadApp("ttk-es-app-ztmanage-add", {
                store: this.component.props.store,
                id: id,
                sourceType: "1", //0创建账套 1账套信息
            }),
        })
        if (ret) {
            this.getIsCollectInv(yearPeriod)
        }
    }
    // 取消表格编辑状态
    cancelTableEdit = () => {
        const data = this.metaAction.gf("data.tableData.tableSource").toJS() || []
        const newData =
            this.metaAction.gf("data.editingCachaData") &&
            this.metaAction.gf("data.editingCachaData").toJS()
                ? this.metaAction.gf("data.editingCachaData").toJS()
                : data
        newData.forEach(item => {
            item.editable = false
        })
        this.metaAction.sfs({
            "data.tableData.tableSource": fromJS(newData),
            "data.tableData.editingKey": "",
            "data.tableData.isCheckDisabled": false,
            "data.editingCachaData": undefined,
        })
    }
    // 多行编辑弹窗
    multipleRowEdit = async (id, isReadOnly) => {
        const option = {
            title: isReadOnly ? "查看单据" : "弹窗编辑",
            width: 1200,
            okText: "保存",
            style: { top: 25 },
            children: (
                <RowEdit
                    webapi={this.webapi}
                    metaAction={this.metaAction}
                    store={this.component.props.store}
                    id={id}
                    isReadOnly={isReadOnly}
                    module="xs"
                    isStock={this.metaAction.gf("data.tableData.isStock")}></RowEdit>
            ),
        }
        if (isReadOnly) {
            option.footer = null
            option.closeBack = back => {
                this.closeTip = back
            }
        }
        const ret = await this.metaAction.modal("show", option)
        if (ret && ret.needReload) {
            this.initPage()
        }
    }
    //批设科目弹窗
    batchSetSubject = async () => {
        let selected = this.metaAction.gf("data.tableData.selectedRowKeys").toJS(),
            tableSource = this.metaAction.gf("data.tableData.tableSource").toJS(),
            tableAllList = this.metaAction.gf("data.tableAllList").toJS()
        if (
            selected.length &&
            selected.every(
                id =>
                    (Array.isArray(tableAllList) && tableAllList.length > 0
                        ? tableAllList
                        : tableSource
                    ).findIndex(f => f.id == id && f.vchState == 2) > -1
            )
        ) {
            this.metaAction.toast("error", "请选择未生成凭证的发票进行设置")
            return
        }

        //判断是否选择发票
        if (selected.length) {
            let modalWidth = document.body.clientWidth - 50
            let modalHeight = document.body.clientHeight - 10
            if (modalWidth > 1920) modalWidth = 1920

            let idList = []
            //过滤已生成凭证的数据
            selected.forEach(id => {
                let dItem = (Array.isArray(tableAllList) && tableAllList.length > 0
                    ? tableAllList
                    : tableSource
                ).find(f => f.id == id && f.vchState != 2)
                if (dItem) {
                    idList.push(id)
                }
            })
            const yearPeriod = this.metaAction.gf("data.accountInfo.yearPeriod").replace("-", "")
            let res = await this.metaAction.modal("show", {
                title: "批设科目",
                style: { top: 25 },
                width: modalWidth,
                height: modalHeight,
                bodyStyle: {
                    maxHeight: modalHeight - 47,
                    overflow: "auto",
                },
                footer: false,
                wrapClassName: "bovms-batch-subject-setting collect-invoice",
                children: (
                    <BatchSubjectSetting
                        ids={idList}
                        yearPeriod={yearPeriod}
                        metaAction={this.metaAction}
                        store={this.component.props.store}
                        webapi={this.webapi}
                        module="xs" //销项xs
                        isStock={this.metaAction.gf("data.tableData.isStock") == 1 ? true : false}
                    />
                ),
            })
            if (res == "save") {
                this.initPage()
            }
        } else {
            this.metaAction.toast("error", "请选择未生成凭证的发票进行设置")
        }
    }
    //单位换算弹窗
    unitConversion = async option => {
        const ret = await this.metaAction.modal("show", {
            title: "单位换算",
            cancelText: "跳过",
            style: { top: 25 },
            width: 1000,
            footer: false,
            children: (
                <UnitConversion
                    {...(option || {})}
                    metaAction={this.metaAction}
                    store={this.component.props.store}
                    webapi={this.webapi}
                    module="xs"
                />
            ),
        })
        if (ret) {
            this.initPage()
        }
    }
    //凭证习惯弹窗
    setHabit = () => {
        this.metaAction.modal("show", {
            title: "凭证习惯",
            style: { top: 25 },
            okText: "保存",
            width: 1060,
            wrapClassName: "bovms-app-purchase-list-habit-setting",
            children: (
                <HabitSetting
                    metaAction={this.metaAction}
                    store={this.component.props.store}
                    webapi={this.webapi}
                    module="xs"
                />
            ),
        })
    }
    pageChanged = (current, pageSize) => {
        this.initPage(current, pageSize)
    }
    renderChildren = () => {
        const totalFpInDB = this.metaAction.gf("data.totalData.totalFpInDB")
        const loading = this.metaAction.gf("data.loading")
        const isSearchTable = this.metaAction.gf("data.initPage")
        return (
            <Spin tip="加载中..." delay={500} spinning={loading}>
                {(isSearchTable || !loading) && totalFpInDB > 0 ? this.renderFilter() : null}
                {(isSearchTable || !loading) && totalFpInDB > 0 ? this.renderTable() : null}
                {(isSearchTable || !loading) && totalFpInDB > 0 ? this.renderFooter() : null}
                {!loading && totalFpInDB <= 0 ? this.renderGuidePage() : null}
            </Spin>
        )
    }
    renderGuidePage = () => {
        const accountInfo = this.metaAction.gf("data.accountInfo").toJS()
        return this.metaAction.loadApp("bovms-app-guidePage", {
            vatTaxpayer: accountInfo.vatTaxpayer,
            nsqj: (accountInfo.yearPeriod && moment(accountInfo.yearPeriod)) || undefined,
            stock: accountInfo.stock,
            orgId: accountInfo.orgId,
            type: "销项",
            enabledYearAndMonth: accountInfo.enabledYearAndMonth,
            isTutorialDate: accountInfo.isTutorialDate,
            tutorialBeginDate: accountInfo.tutorialBeginDate,
            tutorialEndDate: accountInfo.tutorialEndDate,
            sobCheck: accountInfo.sobCheck,
            webapi: this.webapi,
            metaAction: this.metaAction,
            store: this.component.props.store,
            nsqjChange: this.getIsCollectInv,
            setPortalContent: this.component.props.setPortalContent,
        })
    }
    renderFilter = () => {
        const filterData = this.metaAction.gf("data.filterData").toJS()
        const accountInfo = this.metaAction.gf("data.accountInfo").toJS()
        return (
            <BovmsPurchaseHeader
                className="bovms-app-purchase-list-filter"
                filterData={filterData}
                accountInfo={accountInfo}
                handleMenuClick={this.filterHandleMenuClick}
                webapi={this.webapi}
                metaAction={this.metaAction}
                store={this.component.props.store}
                getStockName={this.getStockName}
                module="xs"
                getVatTaxpayerName={this.getVatTaxpayerName}></BovmsPurchaseHeader>
        )
    }
    renderTable = () => {
        const tableData = this.metaAction.gf("data.tableData").toJS()
        return (
            <BovmsPurchaseTable
                className="bovms-app-sale-list-table"
                multipleRowEdit={this.multipleRowEdit}
                reLoad={this.initPage}
                data={tableData}
                module="xs"
                webapi={this.webapi}
                metaAction={this.metaAction}
                store={this.component.props.store}
                createVoucher={this.createVoucher}
                cancelTableEdit={this.cancelTableEdit}></BovmsPurchaseTable>
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
            totalFpNum, // 总的发票张数
            positiveAmount, // 正价税合计总数
            positiveTaxAmount, // 正税额总数
            negativeAmount, // 负价税合计总数
            negativeTaxAmount, // 负税额总数
            nonVchState2FpNum, // 未记账（未生成凭证或者生成凭证失败）发票数
            positiveExTaxAmount = 0, // 金额
            negativeExTaxAmount = 0, // 金额
        } = this.metaAction.gf("data.totalData").toJS()
        const { tableSource, selectedRowKeys } = this.metaAction.gf("data.tableData").toJS()
        const tableAllList = this.metaAction.gf("data.tableAllList").toJS()
        if (selectedRowKeys && selectedRowKeys.length > 0) {
            totalFpNum = selectedRowKeys.length
            const isCheckAll = (Array.isArray(tableAllList) && tableAllList.length > 0) || false
            if (!isCheckAll) {
                positiveAmount = 0
                positiveTaxAmount = 0
                negativeAmount = 0
                negativeTaxAmount = 0
                nonVchState2FpNum = 0
            }
            tableSource.forEach(item => {
                if (isCheckAll) {
                    // 有了选择多页全部，计算用减法
                    if (selectedRowKeys.findIndex(f => item.id == f) === -1) {
                        if (item.vchState != 2) {
                            nonVchState2FpNum--
                        }
                        if (item.amount > 0) {
                            //价税合计
                            positiveAmount -= item.amount
                        } else {
                            negativeAmount -= item.amount
                        }
                        if (item.taxAmount > 0) {
                            //税额
                            positiveTaxAmount -= item.taxAmount
                        } else {
                            negativeTaxAmount -= item.taxAmount
                        }
                    }
                } else {
                    if (selectedRowKeys.findIndex(f => item.id == f) > -1) {
                        if (item.vchState != 2) {
                            nonVchState2FpNum++
                        }
                        if (item.amount > 0) {
                            positiveAmount += item.amount
                        } else {
                            negativeAmount += item.amount
                        }
                        if (item.taxAmount > 0) {
                            positiveTaxAmount += item.taxAmount
                        } else {
                            negativeTaxAmount += item.taxAmount
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
                    发票：<strong>{totalFpNum}</strong> (张)
                </span>
                <span>
                    价税合计：
                    <strong>{this.quantityFormat(positiveAmount, 2, false, false)}</strong> (元)
                    {negativeAmount < 0 ? (
                        <strong>{this.quantityFormat(negativeAmount, 2, false, false)}</strong>
                    ) : null}
                    {negativeAmount < 0 ? "(元)" : null}
                </span>
                <span>
                    金额：
                    <strong>{this.quantityFormat(positiveExTaxAmount, 2, false, false)}</strong>
                    (元)
                    {negativeExTaxAmount < 0 ? (
                        <strong>{this.quantityFormat(negativeExTaxAmount, 2, false, false)}</strong>
                    ) : null}
                    {negativeExTaxAmount < 0 ? "(元)" : null}
                </span>
                <span>
                    税额：
                    <strong>{this.quantityFormat(positiveTaxAmount, 2, false, false)}</strong>
                    (元)
                    {negativeTaxAmount < 0 ? (
                        <strong>{this.quantityFormat(negativeTaxAmount, 2, false, false)}</strong>
                    ) : null}
                    {negativeTaxAmount < 0 ? "(元)" : null}
                </span>
                <span>
                    未生成凭证：<strong>{nonVchState2FpNum}</strong>(张)
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
    //科目设置弹窗
    setSubject = () => {
        const yearPeriod = parseInt(
            this.metaAction.gf("data.accountInfo.yearPeriod").replace("-", "")
        )
        this.metaAction.modal("show", {
            title: "科目设置",
            width: 800,
            style: { top: 25 },
            okText: "保存",
            wrapClassName: "bovms-app-purchase-list-subject-setting",
            children: (
                <SubjectSetting
                    metaAction={this.metaAction}
                    store={this.component.props.store}
                    webapi={this.webapi}
                    module="xs"
                    yearPeriod={yearPeriod}
                />
            ),
        })
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
    getVatTaxpayerName(vt, accountInfo) {
        // const { vatTaxpayer, yearPeriod, isTutorialDate, tutorialBeginDate, tutorialEndDate } = (accountInfo || this.metaAction.gf('data.accountInfo').toJS());
        // let str = ''
        // if (vt === undefined) {
        //     vt = vatTaxpayer
        // }
        // if (vt === 2000010001) {
        //     str = '一般纳税人'
        //     const yearPeriodDateVal = moment(yearPeriod).valueOf(),
        //         tutorialBeginDateVal = moment(tutorialBeginDate).valueOf(),
        //         tutorialEndDateVal = moment(tutorialEndDate).valueOf();
        //     // 会计月度<辅导期（区间）：小规模纳税人
        //     if (tutorialBeginDate && yearPeriodDateVal < tutorialBeginDateVal)
        //         str = '小规模纳税人'
        //     // 会计月度属于辅导期（区间）：一般纳税人辅导期
        //     if (tutorialBeginDate && tutorialEndDate && yearPeriodDateVal >= tutorialBeginDateVal && yearPeriodDateVal <= tutorialEndDateVal)
        //         str = '一般纳税人辅导期'
        //     // 会计月度>辅导期（区间）：一般纳税人
        //     if (tutorialEndDate && yearPeriodDateVal > tutorialEndDateVal)
        //         str = '一般纳税人'
        // }
        // if (vt === 2000010002)
        //     str = '小规模纳税人'
        // if (accountInfo)
        //     return str === '小规模纳税人' ? 2000010002 : 2000010001;
        // return str;
        const { vatTaxpayer } = accountInfo || this.metaAction.gf("data.accountInfo").toJS()
        let str = ""
        if (vt === undefined) {
            vt = vatTaxpayer
        }
        switch (vt) {
            case 2000010001:
                str = "一般纳税人"
                break
            case 2000010002:
                str = "小规模纳税人"
                break
            default:
                str = "一般纳税人辅导期"
                break
        }
        if (accountInfo) return str === "小规模纳税人" ? 2000010002 : 2000010001
        return str
    }
    getStockName(stock) {
        if (stock === undefined) {
            stock = this.metaAction.gf("data.accountInfo.stock")
        }
        let str = ""
        if (stock === 1) {
            str = "启用"
        } else {
            str = "未启用"
        }
        return str
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
        o = new action({ ...option, metaAction }),
        ret = { ...metaAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
