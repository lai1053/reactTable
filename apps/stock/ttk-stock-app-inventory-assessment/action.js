import React from "react"
import ReactDOM from "react-dom"
import { action as MetaAction } from "edf-meta-engine"
import { FormDecorator, DataGrid, Checkbox, Icon, Tooltip, Button } from "edf-component"
import config from "./config"
import utils from "edf-utils"
import extend from "./extend"
import { fromJS, toJS } from "immutable"
import moment from "moment"
import { formatNumbe } from "./../common"
import {
    formatSixDecimal,
    stockLoading,
    getClientSize,
    canClickTarget,
    formatNumber,
} from "../commonAssets/js/common"
import importModal, { onFileError } from "../components/common/ImportModal"
import MergeVoucher from "../components/GenerateVoucher/MergeVoucher"
import SubjectSetting from "./apps/subject-setting"
import { zgrkFields, zgchFields } from "./staticField"
let { modalHeight, modalWidth, modalBodyStyle = {} } = getClientSize()

const colKeys = [
    "billBodyNum",
    "billBodyPrice",
    "billBodyYbBalance",
    "cdate",
    "code",
    "inventoryName",
    "supplierName",
]

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.voucherAction = option.voucherAction
        this.extendAction = option.extendAction
        this.config = config.current
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        this.id = this.component.props.company
        injections.reduce("init", this.id)
        this.load()
    }

    componentWillUnmount = () => {}

    stockLoading = () => stockLoading()

    reload = async falg => {
        this.metaAction.sf("data.loading", true)
        let {
            serviceTypeCode = "",
            supplierName = "",
            startPeriod = "",
            endPeriod = "",
            code = "",
            voucherIdsArr = [],
        } = {}
        const data = (this.metaAction.gf("data") && this.metaAction.gf("data").toJS()) || {}
        const {
            other = {},
            pagination = {},
            paginationList = {},
            form = {},
            inputVal = "",
            input = "",
        } = data
        const {
            constom,
            strDate,
            endDate,
            voucherIds = null,
            supplier,
            startTime,
            endTime,
            voucherIds2 = null,
        } = form
        const { activeTabKey } = other
        const currentOrg = this.metaAction.context.get("currentOrg")
        const { name, id, xdzOrgIsStop } = currentOrg
        this.name = name
        const stockPeriod = sessionStorage["stockPeriod" + this.name]
        this.period = stockPeriod
        let page = {}
        if (falg) {
            page = { currentPage: falg.currentPage, pageSize: falg.pageSize }
        } else {
            const pageObj = activeTabKey == 1 ? pagination : paginationList
            page = { currentPage: pageObj.current, pageSize: pageObj.pageSize }
        }

        if (this.id == 1) {  // tab为“暂估入库”
            serviceTypeCode = "ZGRK"
            supplierName = constom == "全部" ? "" : constom
            startPeriod = strDate
            endPeriod = endDate
            code = inputVal
            voucherIdsArr = voucherIds
            if (inputVal) {
                page.currentPage = 1
            }
        } else {   // tab为“暂估冲回”
            serviceTypeCode = "ZGHC"
            supplierName = supplier == "全部" ? "" : supplier
            startPeriod = startTime
            endPeriod = endTime
            code = input
            voucherIdsArr = voucherIds2
            if (input) {
                page.currentPage = 1
            }
        }

        let reqList = {
            serviceTypeCode: serviceTypeCode,  // 页面模块代码
            period: stockPeriod,  // 当前会计期间
            code: code,   // 单据编号或存货编号（主页面搜索框）
            supplierName: supplierName,  // 往来单位（高级查询框）
            startPeriod: startPeriod,    // 入库日期-起始日期
            endPeriod: endPeriod,        // 入库日期-结束日期（高级查询框） 
            voucherIds: voucherIdsArr,  // 
            page,  // 分页页码信息
        }
        const listReq = this.webapi.operation.findBillTitleList(reqList),
            invSetReq = this.webapi.operation.getInvSetByPeroid({ period: stockPeriod })
        const resp = await listReq  // 主列表数据
        const invSet = await invSetReq   // 公共接口信息
        this.injections.reduce("reload", resp, invSet, [], xdzOrgIsStop)
        this.metaAction.sf("data.loading", false)
    }

    load = async falg => {
        this.metaAction.sf("data.loading", true)
        const currentOrg = this.metaAction.context.get("currentOrg") || {}
        const { name, xdzOrgIsStop, id } = currentOrg
        const data = (this.metaAction.gf("data") && this.metaAction.gf("data").toJS()) || {}
        const { other = {}, pagination = {}, paginationList = {}, form = {}, inputVal = "" } = data

        let pageObj = other.activeTabKey == 1 ? pagination : paginationList
        let page = { currentPage: pageObj.current, pageSize: pageObj.pageSize }
        let {
            serviceTypeCode = "",
            supplierName = "",
            startPeriod = "",
            endPeriod = "",
            voucherIds,
        } = {}
        const { constom, strDate, endDate, supplier, startTime, endTime, voucherIds2 } = form

        if (this.id == 1) {   // tab 为 “暂估入库”
            serviceTypeCode = "ZGRK"
            supplierName = constom
            startPeriod = strDate
            endPeriod = endDate
            voucherIds = form.voucherIds

        } else {   // tab 为 “暂估冲回”
            serviceTypeCode = "ZGHC"
            supplierName = supplier
            startPeriod = startTime
            endPeriod = endTime
            voucherIds = voucherIds2
        }

        this.name = name
        const stockPeriod = sessionStorage["stockPeriod" + name]
        this.period = stockPeriod
        const initReq = this.webapi.operation.init({ period: stockPeriod, opr: 0 })
        const supplierReq = this.webapi.operation.findSupplierList({}) //供应商
        const invSetReq = this.webapi.operation.getInvSetByPeroid({ period: stockPeriod }) // 公共接口参数

        if (inputVal) {
            page.currentPage = 1
        }

        // 列表数据
        let reqList = {
            serviceTypeCode: serviceTypeCode, // 页面模块代码
            period: stockPeriod,   // 当前会计期间
            code: inputVal,  // 单据编号或存货编号（主页面搜索框）
            supplierName: supplierName,   // 往来单位（高级查询框）
            startPeriod: startPeriod,     // 入库日期-起始日期
            endPeriod: endPeriod,         // 入库日期-结束日期（高级查询框） 
            voucherIds: voucherIds,
            page,    // 分页页码信息
        }

        const listReq = this.webapi.operation.findBillTitleList(reqList)

        const respList = await listReq   //页面主列表数据
        const invSetInfo = await invSetReq   //公共接口信息

        this.injections.reduce("load", respList, invSetInfo, [], xdzOrgIsStop)
        let supplierList = await supplierReq    // 请求往来单位
        let reqData = await initReq    // 初始化的接口
        this.selectList = supplierList
        this.startPeriod = reqData.startPeriod 

        let listdada = [{ supplierName: "全部" }].concat(supplierList)
        this.renderSelectOption(listdada)
        this.metaAction.sf("data.loading", false)
    }

    renderAdjustZanguBtn = () => {
        const disabled = this.metaAction.gf("data.limit.stateNow")
        const activeTabKey = this.metaAction.gf("data.other.activeTabKey")
        const xdzOrgIsStop = this.metaAction.gf("data.xdzOrgIsStop")
        const loading = this.metaAction.gf("data.other.adjustZanguLoading")
        if (activeTabKey == 2 && !xdzOrgIsStop) {
            return (
                <Tooltip placement="top" title="用于调整暂估汇总表期末数量＝0，期末金额≠0的存货">
                    <Button
                        loading={loading}
                        type="primary"
                        className="zangu-adjust"
                        onClick={this.adjustZangu}
                        disabled={disabled}>
                        暂估调整
                    </Button>
                </Tooltip>
            )
        }
        return <span></span>
    }

    adjustZangu = async () => {
        const currentOrg = this.metaAction.context.get("currentOrg") || {}
        const { name, xdzOrgIsStop, id } = currentOrg
        this.metaAction.sf("data.other.adjustZanguLoading", true)
        // 暂估汇总表的数据
        const zgSummaryList = await this.webapi.operation.zgSummary({
            orgId: id, //--企业id，必填
            orgName: name, //--企业名称
            period: this.period,
            endPeriod: this.period,
            defaultPeriod: this.period,
            inventoryIndex: 0,
        })
        let arrlist = []
        if (zgSummaryList) {
            const { repZgSummarySubDtoList = [] } = zgSummaryList
            for (let item of repZgSummarySubDtoList) {
                const {
                    inventoryCode,
                    inventoryName,
                    inventoryGuiGe,
                    inventoryUnit,
                    inventoryId,
                    qmNum,
                    qmPrice,
                    qmBalance,
                } = item
                if (qmNum == 0 && qmBalance != 0) {
                    arrlist.push({
                        inventoryCode,
                        inventoryName,
                        inventoryGuiGe,
                        inventoryUnit,
                        id: inventoryId,
                        inventoryId,
                        num: qmNum,
                        price: qmPrice,
                        ybbalance: qmBalance,
                    })
                }
            }
        }
        this.metaAction.sf("data.other.adjustZanguLoading", false)
        if (arrlist.length < 1) {
            return this.metaAction.toast("error", "没有需要暂估调整的存货档案")
        }
        const ret = await this.metaAction.modal("show", {
            title: "新增",
            okText: "保存",
            width: modalWidth,
            height: modalHeight,
            footer: null,
            wrapClassName: "ttk-stock-app-assessment-chonghui adjust-wrap-top modal-padding-20-30",
            bodyStyle: { ...modalBodyStyle },
            children: this.metaAction.loadApp("ttk-stock-app-assessment-chonghui", {
                wrapClassName: "ttk-stock-app-assessment-chonghui",
                store: this.component.props.store,
                arr: arrlist,
                id: "",
                code: "",
            }),
        })
        if (ret) {   //'修改createBillTitle'
            this.reload()
        }
    }

    componentDidUpdate = () => {
        // 解决入库和冲回切换不同步
        let stockAssessmentType = this.metaAction.context.get("stockAssessmentType")
        if (stockAssessmentType != this.id) {
            this.handleTabChange(stockAssessmentType)
        }
    }

    handleTabChange = async activeKey => {
        this.metaAction.sf("data.other.activeTabKey", activeKey)
        this.id = activeKey
        this.metaAction.context.set("stockAssessmentType", activeKey)
        this.reload()
    }

    disabledDate = current => {
        let startperiod = this.startPeriod
        return current < moment(startperiod)
    }

    selectRow = rowIndex => e => {
        this.injections.reduce("selectRow", rowIndex, e.target.checked)
    }

    changeVoucherSelect = value => {
        let select = this.voucherIdsSelectOption.find(item => item.voucherName === value)
        this.metaAction.sf("data.form.voucherIds", select.voucherIds)
        this.metaAction.sf("data.form.voucherName", select.voucherName)
    }

    renderVoucherIdsSelectOption = () => {
        let arr = [
            {
                voucherIds: null,
                voucherName: "全部",
            },
            {
                voucherIds: 0,
                voucherName: "未生成",
            },
            {
                voucherIds: 1,
                voucherName: "已生成",
            },
        ]
        this.voucherIdsSelectOption = arr.slice()
        arr = arr.map(item => {
            return (
                <Option key={item.voucherIds} value={item.voucherName} title={item.voucherName}>
                    {item.voucherName}
                </Option>
            )
        })
        return arr
    }

    changeVoucherSelect2 = value => {
        let select = this.voucherIdsSelectOption2.find(item => item.voucherName === value)
        this.metaAction.sfs({
            "data.form.voucherIds2": select.voucherIds,
            "data.form.voucherName2": select.voucherName,
        })
    }

    renderVoucherIdsSelectOption2 = () => {
        let arr = [
            {
                voucherIds: null,
                voucherName: "全部",
            },
            {
                voucherIds: 0,
                voucherName: "未生成",
            },
            {
                voucherIds: 1,
                voucherName: "已生成",
            },
        ]
        this.voucherIdsSelectOption2 = arr.slice()
        arr = arr.map(item => {
            return (
                <Option key={item.voucherIds} value={item.voucherName} title={item.voucherName}>
                    {item.voucherName}
                </Option>
            )
        })
        return arr
    }
    /* 智能暂估 */
    intelligence = async () => {
        let ret = await this.metaAction.modal("show", {
            title: "智能暂估",
            width: modalWidth,
            height: modalHeight,
            bodyStyle: {
                maxHeight: modalHeight - 20 + "px",
                overflow: "auto",
            },
            wrapClassName: "adjust-wrap-top assessmen-zangu-wrapper modal-padding-20-30",
            footer: null,
            children: this.metaAction.loadApp("assessmen-zangu", {
                store: this.component.props.store,
                parentId: 1,
            }),
        })
        if (ret) {
            this.reload()
        }
    }

    subjectSetting = async () => {
        let ret = await this.metaAction.modal("show", {
            title: "科目设置",
            width: 900,
            height: 400,
            wrapClassName: "modal-padding-20-30",
            children: (
                <SubjectSetting
                    metaAction={this.metaAction}
                    webapi={this.webapi}
                    store={this.component.props.store}
                />
            ),
        })
        if (ret) {
            this.reload()
        }
    }

    lock = (id, voucherIds, billBodyChNum) => e => {
        let personId = id ? id : null
        this.lookZGRK(personId, voucherIds, billBodyChNum)
    }

    lockDetile = (id, voucherIds) => e => {
        let personId = id ? id : null
        this.lookZGCH(personId, voucherIds)
    }

    // 查看暂估冲回单
    lookZGCH = async (id, voucherIds) => {
        const data = (this.metaAction.gf("data") && this.metaAction.gf("data").toJS()) || {}
        const { limit = {}, xdzOrgIsStop } = data
        let flag = limit.stateNow ? true : false
        let ret = ""
        if (flag || xdzOrgIsStop) {
            ret = await this.metaAction.modal("show", {
                title: "查看",
                width: modalWidth,
                height: modalHeight,
                bodyStyle: modalBodyStyle,
                wrapClassName: "adjust-wrap-top",
                footer: null,
                children: this.metaAction.loadApp("ttk-stock-app-inventory-look", {
                    store: this.component.props.store,
                    id: id,
                    flag: flag,
                    serviceTypeCode: "ZGHC",
                    titleName: "暂估冲回单",
                }),
            })
        } else {
            const titleText = voucherIds ? "查看" : "编辑"
            ret = await this.metaAction.modal("show", {
                title: titleText,
                width: modalWidth,
                height: modalHeight,
                bodyStyle: modalBodyStyle,
                wrapClassName: "adjust-wrap-top modal-padding-20-30",
                footer: null,
                children: this.metaAction.loadApp("ttk-stock-app-assessment-chonghui", {
                    store: this.component.props.store,
                    code: "ZGHC",
                    id: id,
                    arr: "",
                    form: "",
                    unEditable: flag, // 为check的时候代表查看状态
                    voucherIds: voucherIds,
                }),
            })
        }
        if (ret) {   // 修改createBillTitle
            this.reload()
        }
    }

    // 查看暂估入库单
    lookZGRK = async (id, voucherIds, billBodyChNum) => {
        const data = (this.metaAction.gf("data") && this.metaAction.gf("data").toJS()) || {}
        const { limit = {}, xdzOrgIsStop } = data
        let flag = limit.stateNow ? true : false
        let ret = ""
        if (flag || xdzOrgIsStop) {
            ret = await this.metaAction.modal("show", {
                title: "查看",
                width: modalWidth,
                height: modalHeight,
                bodyStyle: modalBodyStyle,
                wrapClassName: "adjust-wrap-top modal-padding-20-30",
                footer: null,
                children: this.metaAction.loadApp("ttk-stock-app-inventory-look", {
                    store: this.component.props.store,
                    id: id,
                    flag: flag,
                    serviceTypeCode: "ZGRK",
                    titleName: "暂估入库单",
                }),
            })
        } else {
            const chNum = billBodyChNum && billBodyChNum != 0 //出库数量是否等于0
            const titleText = voucherIds || chNum ? "查看" : "编辑"
            ret = await this.metaAction.modal("show", {
                title: titleText,
                width: modalWidth,
                height: modalHeight,
                bodyStyle: modalBodyStyle,
                wrapClassName: "adjust-wrap-top modal-padding-20-30",
                footer: null,
                children: this.metaAction.loadApp("ttk-stock-app-inventory-assessment-add", {
                    store: this.component.props.store,
                    id: id,
                    unEditable: flag, // 为check的时候代表查看状态
                    voucherIds: voucherIds,
                    chNum: chNum, // 新增的时候不传，查看或者编辑的时候传
                }),
            })
        }
        if (ret) {
            this.reload()
        }
    }

    // 科目匹配
    matchSubject = async list => {
        const inventorys = []
        list.forEach(item => {
            if (item && item.billBodys) {
                JSON.parse(item.billBodys).forEach(data => {
                    inventorys.push({ inventoryId: data.inventoryId })
                })
            }
        })
        const resp = await this.webapi.operation.getInventoryGoods({ inventorys }) // 获取科目匹配的存货列表
        let matchSubjectResult = false
        if (resp) {
            // 如果全部已经匹配并且选择不显示弹框，则直接生成结转凭证
            let hasUnMatched = resp.some(v => !v.inventoryRelatedAccountId)
            const ret = !hasUnMatched ? true : false
            if (!!hasUnMatched) {
                this.metaAction.toast("warning", "存货科目未设置，请先进入【存货档案】设置科目!")
            }
            return ret
        }
        return matchSubjectResult
    }

    // 凭证合并
    mergeVouchers = async () => {
        const data = (this.metaAction.gf("data") && this.metaAction.gf("data").toJS()) || {}
        const { other = {} } = data
        const { activeTabKey = 1 } = other
        const modulueName = activeTabKey == 1 ? "zanguRK" : "zanguCH"
        const getVoucherRuleReq = this.webapi.operation.getVoucherRule({ 'module': modulueName })
        const radioChoices = [{
            value: "1",
            text: "选中单据合并一张凭证",
        },{
            value: "0",
            text: "一张单据一张凭证",
        }]
        const getVoucherRule = await getVoucherRuleReq
        let defaultVal =
            getVoucherRule && getVoucherRule.stockRule && getVoucherRule.stockRule.merge
                ? getVoucherRule.stockRule.merge
                : 0
        const ret = await this.metaAction.modal("show", {
            title: "凭证合并",
            okText: "保存",
            cancelText: "取消",
            wrapClassName: "modal-padding-20-30",
            bodyStyle: { padding: "20px 20px 15px" },
            width: 400,
            height: 300,
            children: (
                <MergeVoucher
                    metaAction={this.metaAction}
                    store={this.component.props.store}
                    radioChoices={radioChoices}
                    defaultVal={defaultVal}
                />
            ),
        })

        if (ret && ret !== true) {
            this.metaAction.sf("data.loading", true)
            const result = await this.webapi.operation.updateVoucherRuleByModule({
                module: modulueName,
                stockRule: {
                    merge: ret,
                },
            })
            if (result === null) {
                this.metaAction.toast("success", "保存成功")
            }
            this.metaAction.sf("data.loading", false)
        }
    }

    // 生成凭证
    generateVoucher = async event => {
        const list = this.extendAction.gridAction.getSelectedInfo("dataGrid") // 这个结转列表的数据
        if (!list || list.length == 0) {
            this.metaAction.toast("error", "请选择需生成凭证单据")
            return false
        }
        const hasClick = canClickTarget.getCanClickTarget("assessmentGenVoucher")
        if (!hasClick) {
            canClickTarget.setCanClickTarget("assessmentGenVoucher", true)
            this.metaAction.sf("data.loading", true)
            const matchSubjectResult = await this.matchSubject(list)
            this.metaAction.sf("data.loading", false)
            if (matchSubjectResult) {
                const { flag, subjectConfig } = await this.hasStockSubject() //检测存货科目
                if (flag) {
                    await this.createBillTitlePZ()
                } else {
                    canClickTarget.setCanClickTarget("assessmentGenVoucher", null)
                    this.metaAction.sf("data.loading", false)
                    const ret = await await this.metaAction.modal("show", {
                        title: "科目设置",
                        width: 900,
                        height: 400,
                        wrapClassName: "modal-padding-20-30",
                        children: (
                            <SubjectSetting
                                metaAction={this.metaAction}
                                webapi={this.webapi}
                                genVoucher={true}
                                store={this.component.props.store}
                            />
                        ),
                    })
                    if (ret) {
                        await this.createBillTitlePZ()
                    }
                }
            }
            canClickTarget.setCanClickTarget("assessmentGenVoucher", null)
        }
    }

    //调用凭证接口
    createBillTitlePZ = async () => {
        const list = this.extendAction.gridAction.getSelectedInfo("dataGrid") // 这个结转列表的数据
        const inventorys = list.map(v => v.id)
        let name = this.metaAction.context.get("currentOrg").name
        let code = this.metaAction.gf("data.other.activeTabKey") == 1 ? "ZGRK" : "ZGHC"
        let reqlist = {
            period: sessionStorage["stockPeriod" + name],
            serviceTypeCode: code,
            ids: inventorys,
        }
        const ret = await this.webapi.operation.createBillTitlePZ(reqlist)
        if (ret) {
            this.metaAction.toast("success", "生成凭证成功")
            await this.reload()
        }
    }

    // 校验是否有存货科目
    hasStockSubject = async () => {
        this.metaAction.sf("data.loading", true)
        const getStockAcctCodeReq = this.webapi.operation.getStockAcctCode({ module: "zangu" }) // 根据条件查询存货模块科目设置范围下的末级科目
        let subjectConfig = await this.webapi.operation.queryAcctCodeByModule({
            module: 1,
            type: "zangu",
        })
        let stockAcctCode = await getStockAcctCodeReq
        this.metaAction.sf("data.loading", false)
        let flag = false
        if (subjectConfig && Array.isArray(subjectConfig)) {
            const mark = subjectConfig.some(v => {
                const index = stockAcctCode.findIndex(o => o.id == v.destAcctId)
                return index < 0
            })
            flag = !mark
        }
        return { flag, subjectConfig }
    }

    checkoutVoucher = id => async(e) => {
        if (id) {
            // this.lookVoucher(id)
            const voucherId = id
            const ret = await this.metaAction.modal("show", {
                title: "查看凭证",
                width: modalWidth,
                height: modalHeight,
                bodyStyle: modalBodyStyle,
                wrapClassName: "adjust-wrap-top",
                className: "ttk-stock-pz-modal",
                okText: "保存",
                children: this.metaAction.loadApp("app-proof-of-charge", {
                    store: this.component.props.store,
                    initData: {
                        type: "isFromXdz",
                        id: voucherId,
                    },
                }),
            })
        }
    }

    // lookVoucher = async id => {
    //     const voucherId = id
    //     const ret = await this.metaAction.modal("show", {
    //         title: "查看凭证",
    //         width: modalWidth,
    //         height: modalHeight,
    //         bodyStyle: modalBodyStyle,
    //         wrapClassName: "adjust-wrap-top",
    //         className: "ttk-stock-pz-modal",
    //         okText: "保存",
    //         children: this.metaAction.loadApp("app-proof-of-charge", {
    //             store: this.component.props.store,
    //             initData: {
    //                 type: "isFromXdz",
    //                 id: voucherId,
    //             },
    //         }),
    //     })
    // }

    // 新增入库单
    addType = async () => {
        let ret = ""
        if (this.metaAction.gf("data.other.activeTabKey") == 1) {
            ret = await this.metaAction.modal("show", {
                title: "新增",
                width: modalWidth,
                height: modalHeight,
                bodyStyle: modalBodyStyle,
                wrapClassName: "adjust-wrap-top modal-padding-20-30",
                footer: null,
                children: this.metaAction.loadApp("ttk-stock-app-inventory-assessment-add", {
                    store: this.component.props.store,
                }),
            })
        }
        if (ret) {
            this.reload()
        }
    }

    renderSelectOption = data => {
        const arr = data.map(item => {
            const { supplierId, supplierName } = item
            return (
                <Option key={supplierId} value={supplierName} title={supplierName}>
                    {" "}
                    {supplierName}{" "}
                </Option>
            )
        })
        this.selectOption = arr
        this.metaAction.sf("data.other.key", Math.floor(Math.random() * 10000))
    }

    //过滤行业
    filterIndustry = (input, option) => option.props.children.indexOf(input) >= 0

    getSelectOption = () => this.selectOption

    // “更多”按钮点击事件
    moreActionClick = e => {
        if (e.key == "insertProofConfirmList") {
            //按暂估明细单冲回
            const id = 1
            this.insertProofConfirm(id)
        } else {
            this[e.key] && this[e.key]()
        }
    }

    /* 
        有id: 按先进先出冲回; 
        无id: 按暂估明细冲回
    */
    insertProofConfirm = async id => {
        let selectedArrInfo =
            (this.metaAction.gf("data.list") && this.metaAction.gf("data.list").toJS()) || []
        let arr = []
        selectedArrInfo.forEach(item => {
            arr.push(item.id)
        })

        const blockTit = id ? "按暂估明细冲回" : "按先进先出冲回"
        const ret = await this.metaAction.modal("show", {
            title: blockTit,
            width: modalWidth,
            height: modalHeight,
            bodyStyle: {
                maxHeight: modalHeight - 20 + "px",
                overflow: "auto",
            },
            wrapClassName: "helloworld-addType-chonghui-wraper adjust-wrap-top modal-padding-20-30",
            okText: "生成暂估冲回单",
            footer: null,
            children: this.metaAction.loadApp("helloworld-addType-chonghui", {
                store: this.component.props.store,
                data: arr,
                id: id,
            }),
        })
        if (ret) {
            this.reload()
        }
    }
    /* 批量删除单据 */ // settlement
    deleteBill = async () => {
        let stateNow = this.metaAction.gf("data.limit.stateNow")
        let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo("dataGrid") //选中
        if (selectedArrInfo.length == 0) {
            this.metaAction.toast("error", "请先选择数据")
            return false
        }
        const activeKey = this.metaAction.gf("data.other.activeTabKey")
        if (activeKey == 1) {
            let errTips = ""
            for (let o of selectedArrInfo) {
                if (o.voucherIds) {
                    errTips = "已生成凭证，不允许删除单据！"
                } else if (o.billBodyChNum > 0) {
                    errTips = "已冲回，不允许删除单据！"
                }
                if (errTips) {
                    this.metaAction.toast("error", errTips)
                    return false
                }
            }
        }
        if (stateNow) {
            return false
        }
        let arr = []
        selectedArrInfo.forEach(item => {
            arr.push(item.id)
        })
        let serviceTypeCode = activeKey == 1 ? "ZGRK" : "ZGHC"
        let params = {}
        if (activeKey == 1) {
            params = {
                serviceTypeCode,
                ids: JSON.stringify(arr),
            }
        } else {
            params = {
                serviceTypeCode,
                ids: JSON.stringify(arr),
                deleteWithRela: 0, //暂估冲回时必填，0检测，1不检测}
            }
        }
        this.metaAction.sf("data.loading", true)
        const response = await this.webapi.operation.deleteBatchBillTitle(params)
        this.metaAction.sf("data.loading", false)

        if (response) {
            if (activeKey == 1) {
                this.metaAction.toast("success", response)
            } else {
                const backInfo = response.split(":")
                const [stateCode = "", backTips = ""] = backInfo || []

                if (stateCode.trim() == 10002) {
                    let ret = await this.metaAction.modal("confirm", {
                        width: 400,
                        bodyStyle: { padding: 24 },
                        content: <div> 所选单据中，找不到暂估入库单关联关系的单据不删除！</div>,
                    })
                    if (ret === true) {
                        const resp = await this.webapi.operation.deleteBatchBillTitle({
                            serviceTypeCode,
                            ids: JSON.stringify(arr),
                            deleteWithRela: 1, //暂估冲回时必填，0检测，1不检测
                        })
                        if (resp) {
                            this.metaAction.toast("success", resp)
                        }
                    }
                } else {
                    this.metaAction.toast("success", response)
                }
            }
        }

        this.reload()
    }

    /* 批量删除凭证 */
    deletePz = async () => {
        let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo("dataGrid") //选中
        if (selectedArrInfo.length == 0) {
            this.metaAction.toast("error", "请先选择数据")
            return false
        }
        let arr = []
        selectedArrInfo.forEach(item => {
            arr.push(item.id)
        })
        const activeTabKey = this.metaAction.gf("data.other.activeTabKey")
        let serviceTypeCode = activeTabKey == 1 ? "ZGRK" : "ZGHC"
        this.metaAction.sf("data.loading", true)
        const response = await this.webapi.operation.deleteBillTitlePZ({
            serviceTypeCode: serviceTypeCode,
            ids: JSON.stringify(arr),
        })
        this.metaAction.sf("data.loading", false)
        if (response === null) {
            this.metaAction.toast("success", "删除成功")
            this.reload()
        }
    }

    // 删除  deleteOnly
    singleDeletePz = id => async( e )=> {
        if (id) {
            // this.deleteOnlyPz(id)
            let arr = []
            arr.push(id)
            let serviceTypeCode = "SCLL"
            this.metaAction.sf("data.loading", true)
            const response = await this.webapi.operation.deleteBillTitlePZ({
                serviceTypeCode: serviceTypeCode,
                ids: JSON.stringify(arr),
            })
            this.metaAction.sf("data.loading", false)
            if (response === null) {
                this.metaAction.toast("success", "删除成功")
                this.reload()
            }
        }
    }

    // deleteOnlyPz = async id => {
    //     let arr = []
    //     arr.push(id)
    //     let serviceTypeCode = "SCLL"
    //     this.metaAction.sf("data.loading", true)
    //     const response = await this.webapi.operation.deleteBillTitlePZ({
    //         serviceTypeCode: serviceTypeCode,
    //         ids: JSON.stringify(arr),
    //     })
    //     this.metaAction.sf("data.loading", false)
    //     if (response === null) {
    //         this.metaAction.toast("success", "删除成功")
    //         this.reload()
    //     }
    // }

    onSearch = (path, data) => {
        clearTimeout(this.searchTimer)
        this.searchTimer = setTimeout(() => {
            this.metaAction.sf(path, data)
            this.reload()
        }, 500)
    }

    filterList = () => {
        this.metaAction.sf("data.showPopoverCard", false)
        this.reload()
    }
    handlePopoverVisibleChange = visible => {
        if (visible) {
            const { form } = (this.metaAction.gf("data") && this.metaAction.gf("data").toJS()) || {}
            this.metaAction.sf("data.form", fromJS(form))
        }
        this.metaAction.sf("data.showPopoverCard", visible)
    }

    resetForm = () => {
        this.metaAction.sfs({
            "data.form.strDate": "",
            "data.form.endDate": "",
            "data.form.constom": "",
            "data.form.voucherIds": null,
            "data.form.voucherName": "",
        })
    }

    resetFormCH = () => {
        this.metaAction.sfs({
            "data.form.supplier": "",
            "data.form.endTime": "",
            "data.form.startTime": "",
            "data.form.voucherIds2": null,
            "data.form.voucherName2": "",
        })
    }

    save = async () => {
        var list = (this.metaAction.gf("data.list") && this.metaAction.gf("data.list").toJS()) || []
        await this.webapi.operation.save(list)
        this.metaAction.toast("success", "保存成功")
        this.reload()
    }

    addrow = ps => {
        this.injections.reduce("addEmptyRow", ps.rowIndex + 1)
    }

    /* 是否不能删除 */
    cannotDelete = row => {
        const stateNow = this.metaAction.gf("data.limit.stateNow")
        const xdzOrgIsStop = this.metaAction.gf("data.xdzOrgIsStop")
        const { billBodyChNum, voucherIds, isDelete } = row || {}
        const ret = xdzOrgIsStop || stateNow || voucherIds || Number(billBodyChNum) > 0
        return ret
    }

    // delClick = (id, isReBack) => e => {
    //     if (!this.cannotDelete()) {
    //         let personId = id ? id : null
    //         let serviceTypeCode = "ZGRK"
    //         this.delete(serviceTypeCode, personId)
    //     }
    // }

    // 整张删除
    deleteClick = id => e => {
        const activeTabKey = this.metaAction.gf("data.other.activeTabKey")
        const type = activeTabKey=='1' ? "ZGRK" : "ZGHC"
        if (!this.cannotDelete()) {
            let personId = id ? id : null
            let serviceTypeCode = type //"ZGHC"
            this.delete(serviceTypeCode, personId)
        }
    }

    delete = async (serviceTypeCode, id) => {
        let flag = this.metaAction.gf("data.limit.stateNow") ? true : false
        const xdzOrgIsStop = this.metaAction.gf("data.xdzOrgIsStop")
        if (!flag && !xdzOrgIsStop) {
            this.metaAction.sf("data.loading", true)
            const response = await this.webapi.operation.delete({
                'serviceTypeCode': serviceTypeCode,
                'id': id,
            })
            this.metaAction.sf("data.loading", false)
            if (response) {
                this.metaAction.toast("success", response)
            }
            this.reload()
        }
    }

    back = async () => {
        this.component.props.setPortalContent &&
            this.component.props.setPortalContent("存货核算", "ttk-stock-app-inventory")
        this.component.props.onlyCloseContent("ttk-stock-app-inventory-assessment")
    }

    // 整张冲回
    releaseBtn = (id, isReBack) => e => {
        let stateNow = this.metaAction.gf("data.limit.stateNow") ? true : false
        const xdzOrgIsStop = this.metaAction.gf("data.xdzOrgIsStop")
        if (!stateNow && isReBack && !xdzOrgIsStop) {
            let personId = id ? id : null
            this.releaseSave(personId)
        }
    }
    // 整张冲回接口调用
    releaseSave = async id => {
        const ret = await this.metaAction.modal("show", {
            title: "新增",
            width: modalWidth,
            height: modalHeight,
            bodyStyle: modalBodyStyle,
            wrapClassName: "adjust-wrap-top modal-padding-20-30",
            footer: null,
            children: this.metaAction.loadApp("ttk-stock-app-assessment-chonghui", {
                wrapClassName: "ttk-stock-app-assessment-chonghui",
                store: this.component.props.store,
                id: id,
                arr: "",
                code: "",
                form: "",
            }),
        })
        if (ret) {    // 修改createBillTitle
            this.reload()
        }
    }
    // btnClick = () => {
    //     this.injections.reduce("modifyContent")
    // }
    // delrow = ps => {
    //     const list = this.metaAction.gf("data.list")
    //     const id = list.getIn([ps.rowIndex, "id"])
    //     this.injections.reduce("delrow", id)
    // }

    // mousedown = e => {
    //     const path = utils.path.findPathByEvent(e)
    //     if (this.metaAction.isFocus(path)) return

    //     if (path.indexOf("cell.cell") != -1) {
    //         this.focusCell(this.getCellInfo(path))
    //     } else {
    //         if (!this.metaAction.focusByEvent(e)) return
    //         setTimeout(this.cellAutoFocus, 16)
    //     }
    // }

    // getCellInfo(path) {
    //     const parsedPath = utils.path.parsePath(path)
    //     const rowCount = this.metaAction.gf("data.list").size
    //     const colCount = 4
    //     var colKey = parsedPath.path
    //         .replace("root.children.table.columns.", "")
    //         .replace(".cell.cell", "")
    //         .replace(/\s/g, "")

    //     return {
    //         x: colKeys.findIndex(o => o == colKey),
    //         y: Number(parsedPath.vars[0]),
    //         colCount,
    //         rowCount,
    //     }
    // }

    // focusCell(position) {
    //     this.metaAction.sfs({
    //         "data.other.focusFieldPath": `root.children.table.columns.${
    //             colKeys[position.x]
    //         }.cell.cell,${position.y}`,
    //         "data.other.scrollToRow": position.y,
    //         "data.other.scrollToColumn": position.x,
    //     })

    //     setTimeout(this.cellAutoFocus, 16)
    // }

    // cellAutoFocus = () => {
    //     utils.dom.gridCellAutoFocus(this.component, ".editable-cell")
    // }

    // getCellClassName = path => {
    //     return this.metaAction.isFocus(path)
    //         ? "ttk-scm-app-inventory-assessment-cell editable-cell"
    //         : ""
    // }

    // isFocusCell = (ps, columnKey) => {
    //     const focusCellInfo = this.metaAction.gf("data.other.focusCellInfo")
    //     if (!focusCellInfo) return false
    //     return focusCellInfo.columnKey == columnKey && focusCellInfo.rowIndex == ps.rowIndex
    // }

    // gridBirthdayOpenChange = status => {
    //     if (status) return
    //     const editorDOM = ReactDOM.findDOMNode(this.component).querySelector(".editable-cell")
    //     if (!editorDOM) return

    //     if (editorDOM.className.indexOf("datepicker") != -1) {
    //         const input = editorDOM.querySelector("input")
    //         input.focus()
    //     }
    // }
    // quantityFormat = (quantity, decimals, isFocus) => {
    //     if (quantity) {
    //         return formatNumbe(quantity, decimals)
    //     }
    // }
    //分页修改
    pageChanged = (currentPage, pageSize) => {
        if (pageSize == null || pageSize == undefined) {
            ;(this.metaAction.gf("data.pagination") &&
                this.metaAction.gf("data.pagination").toJS().pageSize) ||
                0
        }
        let page = { currentPage, pageSize }
        this.reload(page)
    }
    pageListChanged = (currentPage, pageSize) => {
        if (pageSize == null || pageSize == undefined) {
            pageSize =
                (this.metaAction.gf("data.paginationList") &&
                    this.metaAction.gf("data.paginationList").toJS().pageSize) ||
                {}
        }
        let page = { currentPage, pageSize }
        this.reload(page)
    }

    // 分页总页数
    pageShowListTotal = () => {
        const total = this.metaAction.gf("data.paginationList")
            ? this.metaAction.gf("data.paginationList").toJS()["total"]
            : 0
        return `共有 ${total} 条记录`
    }

    // 分页总页数
    pageShowTotal = () => {
        const total = this.metaAction.gf("data.pagination")
            ? this.metaAction.gf("data.pagination").toJS()["total"]
            : 0
        return `共有 ${total} 条记录`
    }

    getData = path => {
        const ret =
            this.metaAction.gf(`data[${path}]`) && this.metaAction.gf(`data[${path}]`).toJS()
        return ret
    }

    // 导入
    dataImport = () => {
        const other = this.metaAction.gf("data.other").toJS()
        let title, tip
        if (other && other.activeTabKey == 1) {
            title = "暂估入库导入"
            tip = [
                "导出暂估入库单模板",
                "根据暂估入库数据进行补充",
                "导入补充后的暂估入库数据",
                "暂不支持在模板中新增系统外的存货数据",
            ]
        } else if (other && other.activeTabKey == 2) {
            title = "暂估冲回导入"
            tip = [
                "导出暂估冲回单模板",
                "根据暂估冲回数据进行补充",
                "导入补充后的暂估冲回数据",
                "暂不支持在模板中新增系统外的存货数据",
            ]
        }
        importModal({
            title,
            tip,
            export: this.dataExport,
            import: this.dataUpload,
        })
    }

    // 模板导出
    dataExport = async () => {
        const other = this.metaAction.gf("data.other").toJS()
        const params = {
            period: this.period, //会计期间
            orgName: this.name, //企业名称
        }
        if (other && other.activeTabKey == 1) {
            await this.webapi.operation.templateExport(params)
        } else if (other && other.activeTabKey == 2) {
            await this.webapi.operation.templateBackWashExport(params)
        }
    }

    // 导入到数据库
    dataUpload = async info => {
        const other = this.metaAction.gf("data.other").toJS()
        let res,
            params = {
                period: this.period,
                fileId: info.id,
                fileName: info.originalName,
                fileSuffix: info.suffix,
                fileSize: info.size,
                operator: sessionStorage["username"],
            }
        if (other && other.activeTabKey == 1) {
            res = await this.webapi.operation.uploadFile(params)
        } else if (other && other.activeTabKey == 2) {
            res = await this.webapi.operation.uploadBackWashFile(params)
        }

        if (res && !res.uploadSuccess) {
            if (res.fileUrlWithFailInfo) {
                return await onFileError({
                    confirm: data => {
                        window.open(data)
                    },
                    params: res.fileUrlWithFailInfo,
                })
            } else {
                Message.error("导入失败，无法生成暂估冲回单！")
                return true
            }
        }

        if (other && other.activeTabKey == 2) {
            const dataSource = res.uploadDataDtoList || []
            const flag = await this.backwashAfterImport(dataSource)
            if (!flag) {
                return true
            }
        }
        const pagination = this.metaAction.gf("data.pagination").toJS() || {}
        this.reload({ current: 1, pageSize: pagination.pageSize })
        return true
    }

    exportData = async () => {
        const form = this.metaAction.gf("data.form").toJS()
        const {
            constom,
            strDate,
            endDate,
            voucherIds,
            supplier,
            startTime,
            endTime,
            voucherIds2,
        } = form

        await this.webapi.operation.export({
            period: this.period, // 会计期间
            customerCode: this.name, // --企业名称
            startPeriod: this.id == 1 ? strDate : startTime, // --入库日期起
            endPeriod: this.id == 1 ? endDate : endTime, // --入库日期止
            code: this.metaAction.gf("data.inputVal"), // ---流水号
            supplierName: this.id == 1 ? constom : supplier, // --往来单位名称
            type: null, // --单据来源：发票生成0、手工新增1'
            voucherIds: this.id == 1 ? voucherIds : voucherIds2, // --凭证类型：未生成0、已生成1',
            path: this.id == 1 ? "exportZanguWarehouse" : "exportZanguRushback",
        })
    }

    dealData = () => {
        let activeTabKey = this.metaAction.gf("data.other.activeTabKey"),
            list = this.metaAction.gf("data.list").toJS(),
            res = []

        list.forEach((x, i) => {
            if (x.selected) {
                let temp = [],
                    data = JSON.parse(x.billBodys)
                data.forEach((y, j) => {
                    temp.push({
                        accountName: this.name,
                        amount: y.ybbalance,
                        billCode: x.code,
                        billNname: activeTabKey == 1 ? "暂估入库单" : "暂估冲回单",
                        creator: x.operater,
                        custName: x.supplierName,
                        indexNo: j + 1,
                        number: y.num,
                        remarks: "",
                        specification: y.inventoryGuiGe,
                        stockCode: y.inventoryCode,
                        stockName: y.inventoryName,
                        storageDate: x.cdate,
                        unit: y.inventoryUnit,
                        unitPrice: y.price,
                        voucherCode: x.voucherCodes,
                    })
                    if (j == data.length - 1) {
                        res.push(temp)
                    }
                })
            }
        })
        if (!res.length) {
            this.metaAction.toast("error", "请勾选单据")
            return
        }
        return res
    }

    backwashAfterImport = async importList => {
        const blockTit = "暂估冲回导入"
        const ret = await this.metaAction.modal("show", {
            title: blockTit,
            width: modalWidth,
            height: modalHeight,
            bodyStyle: modalBodyStyle,
            okText: "生成暂估冲回单",
            footer: null,
            wrapClassName: "helloworld-addType-chonghui-wraper adjust-wrap-top",
            children: this.metaAction.loadApp("helloworld-addType-chonghui", {
                store: this.component.props.store,
                data: [],
                afterImport: true,
                importList,
            }),
        })
        return ret
    }

    // 是否全选选中
    isSelectAll = () => {
        const list = this.metaAction.gf("data.list").toJS()
        const selectAllStatus = list.length > 0 && list.every(o => o.selected)
        return selectAllStatus
    }

    //全选事件
    selectAll = () => e => {
        const listData = this.metaAction.gf("data.list").toJS()
        let list = listData.slice(0).map(item => ({ ...item, selected: e.target.checked }))
        this.metaAction.sfs({
            "data.selectAllStatus": e.target.checked,
            "data.list": fromJS(list),
        })
    }

    renderSum = () => {
        const listAll =
            (this.metaAction.gf("data.listAll") && this.metaAction.gf("data.listAll").toJS()) || []
        const {
            billBodyNumMinus = 0,
            billBodyNumPlus = 0,
            billBodyYbBalanceMinus = 0,
            billBodyYbBalancePlus = 0,
        } = listAll
        const numMinus = billBodyNumMinus ? formatSixDecimal(billBodyNumMinus) : ""
        const moneyMinus =
            billBodyNumMinus && billBodyYbBalanceMinus
                ? utils.number.format(billBodyYbBalanceMinus, 2)
                : ""
        return (
            <div className="zangu-sum-total">
                <span className="zangu-sum-total-txt">合计</span>
                <span className="zangu-sum-total-num">
                    {"数量：" + formatSixDecimal(billBodyNumPlus) + numMinus}
                </span>
                <span className="zangu-sum-total-ybbalance">
                    {"金额：" + utils.number.format(billBodyYbBalancePlus, 2) + moneyMinus}
                </span>
            </div>
        )
    }

    // 暂估入库单
    zgrkGrid = () => {
        const data = (this.metaAction.gf("data") && this.metaAction.gf("data").toJS()) || {}
        let { list = [], xdzOrgIsStop } = data
        list = list.map(v => {
            v.billBodys = v.billBodys && JSON.parse(v.billBodys)
            v.detailLength = v.billBodys.length
            return v
        })
        const DETAILLENGTH = 5
        const { Column, Cell } = DataGrid
        const cols = zgrkFields.map(v => {
            const { title, dataIndex, align, width, type, precise, flexGrow = null } = v

            let headerCell = title,
                fixed = false,
                fixedRight = false
            if (dataIndex === "selected") {
                headerCell = (
                    <Checkbox
                        checked={this.isSelectAll()}
                        disabled={xdzOrgIsStop}
                        onChange={this.selectAll("dataGrid")}
                    />
                )
                fixed = "left"
            } else if (dataIndex === "code") {
                fixed = "left"
            } else if (dataIndex === "operation") {
                fixedRight = true
            }

            let ele = (
                <Column
                    name={dataIndex}
                    key={dataIndex}
                    columnKey={dataIndex}
                    flexGrow={flexGrow}
                    align="center"
                    width={width}
                    fixed={fixed}
                    fixedRight={fixedRight}
                    header={<Cell> {headerCell} </Cell>}
                    cell={({ rowIndex }) => {
                        const record = list[rowIndex]
                        const {
                            voucherCodes,
                            voucherIds,
                            id,
                            selected,
                            detailLength,
                            billBodyChNum,
                            isDelete,
                            isReBack,
                        } = record
                        let len = detailLength
                        len = len > DETAILLENGTH ? DETAILLENGTH + 2 : len + 1
                        let colHeight = { lineHeight: len * 37 + "px" }

                        let cellEle
                        if (dataIndex === "selected") {
                            cellEle = (
                                <Cell style={colHeight}>
                                    <Checkbox
                                        checked={selected}
                                        disabled={xdzOrgIsStop}
                                        onChange={this.selectRow(rowIndex)}></Checkbox>
                                </Cell>
                            )
                        } else if (dataIndex === "supplierName") {
                            cellEle = (
                                <Cell
                                    align={align}
                                    className="overFlowText cell-padding8"
                                    style={{ ...colHeight, WebkitLineClamp: len }}
                                    value={record[dataIndex]}
                                    tip={true}
                                />
                            )
                        } else if (dataIndex === "code") {
                            const tipFlag = true
                            cellEle = (
                                <Cell
                                    style={colHeight}
                                    tip={tipFlag}
                                    align={align}
                                    className="link-text cell-padding8"
                                    value={record[dataIndex]}
                                    onClick={this.lock(id, voucherIds, billBodyChNum)}
                                />
                            )
                        } else if (dataIndex === "voucherCodes") {
                            cellEle = (
                                <Cell
                                    style={colHeight}
                                    name={dataIndex}
                                    align={align}
                                    className="mk-datagrid-cellContent-left titledelect cell-padding8"
                                    value={record[dataIndex]}>
                                    <span
                                        className="link-text"
                                        onClick={
                                            !xdzOrgIsStop
                                                ? this.checkoutVoucher(voucherIds)
                                                : void 0
                                        }>
                                        {voucherCodes}
                                    </span>
                                    {voucherCodes && !xdzOrgIsStop && (
                                        <Icon
                                            name="helpIcon"
                                            fontFamily="del-icon"
                                            type="close-circle"
                                            className="del-icon"
                                            onClick={this.singleDeletePz(id)}
                                        />
                                    )}
                                </Cell>
                            )
                        } else if (dataIndex === "operation") {
                            cellEle = !xdzOrgIsStop ? (
                                <Cell
                                    style={colHeight}
                                    name={dataIndex}
                                    align="center"
                                    className="mk-datagrid-cellContent-center titledelect">
                                    <span
                                        className={
                                            (this.cannotDelete(record) && "btnBase spanNoselect") ||
                                            "btnBase spanselect"
                                        }
                                        onClick={this.deleteClick(id, isDelete)}>
                                        删除
                                    </span>
                                    <span
                                        className={
                                            data.limit.stateNow || !isReBack || xdzOrgIsStop
                                                ? "btnBase spanNoselect"
                                                : "btnBase spanselect"
                                        }
                                        onClick={this.releaseBtn(id, isReBack)}>
                                        冲回
                                    </span>
                                </Cell>
                            ) : (
                                <div></div>
                            )
                        } else {
                            if (type && type.indexOf("detail") > -1) {
                                const len = record.billBodys.length
                                const details = []
                                if (record.billBodys) {
                                    const cellAlign = ["price", "ybbalance"].includes(dataIndex)
                                        ? "alignRight"
                                        : "alignLeft"
                                    record.billBodys.forEach((v, i) => {
                                        if (i < DETAILLENGTH) {
                                            const con = precise
                                                ? formatNumber(v[dataIndex], precise)
                                                : v[dataIndex]
                                            details.push(
                                                <div
                                                    className={`detail-cell ${cellAlign}`}
                                                    title={con}>
                                                    {" "}
                                                    {con}{" "}
                                                </div>
                                            )
                                        }
                                    })
                                }

                                if (len > DETAILLENGTH) {
                                    const cell =
                                        dataIndex === "inventoryCode" ? (
                                            <div
                                                className="detail-cell link-text"
                                                onClick={this.lock(id, voucherIds, billBodyChNum)}>
                                                {" "}
                                                查看更多...
                                            </div>
                                        ) : (
                                            <div className="detail-cell" />
                                        )
                                    details.push(cell)
                                }

                                let alignStyle = "alignLeft",
                                    txt = ""
                                switch (dataIndex) {
                                    case "num":
                                        txt = formatNumber(record["billBodyNum"], precise)
                                        break
                                    case "ybbalance":
                                        alignStyle = "alignRight"
                                        txt = formatNumber(record["billBodyYbBalance"], precise)
                                        break
                                    case "inventoryCode":
                                        txt = "合计"
                                        break
                                }
                                let sumCell = (
                                    <div className={`sum-cell ${alignStyle}`} title={txt}>
                                        {" "}
                                        {txt}{" "}
                                    </div>
                                )
                                details.push(sumCell)

                                cellEle = (
                                    <Cell align={align} className="clearPadding">
                                        {details}
                                    </Cell>
                                )
                            } else {
                                cellEle = (
                                    <Cell
                                        style={colHeight}
                                        name={dataIndex}
                                        tip={true}
                                        align={align}
                                        className="cell-padding8"
                                        value={record[dataIndex]}
                                    />
                                )
                            }
                        }
                        return cellEle
                    }}
                />
            )

            return ele
        })

        return (
            <DataGrid
                name="dataGridRK"
                key="dataGridRK"
                className="datagridStyle"
                rowHeight={37}
                ellipsis={true}
                headerHeight={37}
                rowHeightGetter={::this.rowHeightGetter}
                rowClassNameGetter={::this.rowClassNameGetter}
                rowsCount={list.length}
                startSequence={1}
                readonly={false}
                allowResizeColumn
                columns={cols}></DataGrid>
        )
    }

    // 行高
    rowHeightGetter = idx => {
        const list =
            (this.metaAction.gf("data.list") && this.metaAction.gf("data.list").toJS()) || []
        let len = JSON.parse(list[idx].billBodys).length
        len = len > 5 ? 7 : len + 1
        return len * 37
    }

    rowClassNameGetter = idx => {
        return ""
    }

    // 暂估冲回单
    zgchGrid = () => {
        const data = (this.metaAction.gf("data") && this.metaAction.gf("data").toJS()) || {}
        let { list = [], xdzOrgIsStop } = data
        list = list.map(v => {
            v.billBodys = v.billBodys && JSON.parse(v.billBodys)
            v.detailLength = v.billBodys.length
            return v
        })
        const DETAILLENGTH = 5
        const { Column, Cell } = DataGrid
        const cols = zgchFields.map(v => {
            const { title, dataIndex, align, width, type, precise, flexGrow = null } = v

            let headerCell = title,
                fixed = false,
                fixedRight = false
            if (dataIndex === "selected") {
                headerCell = (
                    <Checkbox
                        checked={this.isSelectAll()}
                        disabled={xdzOrgIsStop}
                        onChange={this.selectAll("dataGrid")}
                    />
                )
                fixed = "left"
            } else if (dataIndex === "code") {
                fixed = "left"
            } else if (dataIndex === "operation") {
                fixedRight = true
            }

            let ele = (
                <Column
                    name={dataIndex}
                    key={dataIndex}
                    columnKey={dataIndex}
                    flexGrow={flexGrow}
                    align="center"
                    width={width}
                    fixed={fixed}
                    fixedRight={fixedRight}
                    header={<Cell> {headerCell} </Cell>}
                    cell={({ rowIndex }) => {
                        const record = list[rowIndex]
                        const { voucherCodes, voucherIds, id, selected, detailLength } = record
                        let len = detailLength
                        len = len > DETAILLENGTH ? DETAILLENGTH + 2 : len + 1
                        const colHeight = { lineHeight: len * 37 + "px" }

                        let cellEle
                        if (dataIndex === "selected") {
                            cellEle = (
                                <Cell style={colHeight}>
                                    <Checkbox
                                        checked={selected}
                                        disabled={xdzOrgIsStop}
                                        onChange={this.selectRow(rowIndex)}></Checkbox>
                                </Cell>
                            )
                        } else if (dataIndex === "code") {
                            const tipFlag = true
                            cellEle = (
                                <Cell
                                    style={colHeight}
                                    tip={tipFlag}
                                    align={align}
                                    className="link-text cell-padding8"
                                    value={record[dataIndex]}
                                    onClick={this.lockDetile(id, voucherIds)}
                                />
                            )
                        } else if (dataIndex === "voucherCodes") {
                            cellEle = (
                                <Cell
                                    style={colHeight}
                                    name={dataIndex}
                                    align={align}
                                    className="mk-datagrid-cellContent-left titledelect cell-padding8"
                                    value={record[dataIndex]}>
                                    <span
                                        className="link-text"
                                        onClick={
                                            !xdzOrgIsStop
                                                ? this.checkoutVoucher(voucherIds)
                                                : void 0
                                        }>
                                        {voucherCodes}
                                    </span>
                                    {voucherCodes && !xdzOrgIsStop && (
                                        <Icon
                                            name="helpIcon"
                                            fontFamily="del-icon"
                                            type="close-circle"
                                            className="del-icon"
                                            onClick={this.singleDeletePz(id)}
                                        />
                                    )}
                                </Cell>
                            )
                        } else if (dataIndex === "supplierName") {
                            cellEle = (
                                <Cell
                                    align={align}
                                    className="overFlowText cell-padding8"
                                    style={{ ...colHeight, WebkitLineClamp: len }}
                                    value={record[dataIndex]}
                                    tip={true}
                                />
                            )
                        } else if (dataIndex === "operation") {
                            cellEle = (
                                <Cell style={colHeight} align="center">
                                    {!xdzOrgIsStop ? (
                                        <span
                                            className={
                                                data.limit.stateNow && xdzOrgIsStop
                                                    ? "spanNoselect"
                                                    : "spanselect"
                                            }
                                            onClick={this.deleteClick(id)}>
                                            删除
                                        </span>
                                    ) : (
                                        <div></div>
                                    )}
                                </Cell>
                            )
                        } else {
                            if (type && type.indexOf("detail") > -1) {
                                const len = record.billBodys.length
                                const details = []
                                if (record.billBodys) {
                                    const cellAlign = ["price", "ybbalance"].includes(dataIndex)
                                        ? "alignRight"
                                        : "alignLeft"
                                    record.billBodys.forEach((v, i) => {
                                        if (i < DETAILLENGTH) {
                                            const con = precise
                                                ? formatNumber(v[dataIndex], precise)
                                                : v[dataIndex]
                                            details.push(
                                                <div
                                                    className={`detail-cell ${cellAlign}`}
                                                    title={con}>
                                                    {" "}
                                                    {con}{" "}
                                                </div>
                                            )
                                        }
                                    })
                                }

                                if (len > DETAILLENGTH) {
                                    const cell =
                                        dataIndex === "inventoryCode" ? (
                                            <div
                                                className="detail-cell link-text"
                                                onClick={this.lockDetile(id, voucherIds)}>
                                                {" "}
                                                查看更多...
                                            </div>
                                        ) : (
                                            <div className="detail-cell" />
                                        )
                                    details.push(cell)
                                }

                                let alignStyle = "alignLeft",
                                    txt = ""
                                switch (dataIndex) {
                                    case "num":
                                        txt = formatNumber(record["billBodyNum"], precise)
                                        break
                                    case "ybbalance":
                                        alignStyle = "alignRight"
                                        txt = formatNumber(record["billBodyYbBalance"], precise)
                                        break
                                    case "inventoryCode":
                                        txt = "合计"
                                        break
                                }
                                let sumCell = (
                                    <div className={`sum-cell ${alignStyle}`} title={txt}>
                                        {" "}
                                        {txt}{" "}
                                    </div>
                                )
                                details.push(sumCell)

                                cellEle = (
                                    <Cell align={align} className="clearPadding">
                                        {details}
                                    </Cell>
                                )
                            } else {
                                cellEle = (
                                    <Cell
                                        style={colHeight}
                                        name={dataIndex}
                                        tip={true}
                                        align={align}
                                        className="cell-padding8"
                                        value={record[dataIndex]}
                                    />
                                )
                            }
                        }
                        return cellEle
                    }}
                />
            )
            return ele
        })

        return (
            <DataGrid
                name="dataGridCH"
                key="dataGridCH"
                className="datagridStyle"
                rowHeight={37}
                ellipsis={true}
                headerHeight={37}
                rowHeightGetter={::this.rowHeightGetter}
                rowClassNameGetter={::this.rowClassNameGetter}
                rowsCount={list.length}
                startSequence={1}
                readonly={false}
                allowResizeColumn
                columns={cols}></DataGrid>
        )
    }
}
export default function creator(option) {
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction, voucherAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
