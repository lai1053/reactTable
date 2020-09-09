import React from "react"
import ReactDOM from "react-dom"
import { action as MetaAction, AppLoader } from "edf-meta-engine"
import config from "./config"
import {
    LoadingMask,
    Select,
    Checkbox,
    Form,
    DatePicker,
    Button,
    Input,
    Icon,
    ColumnsSetting,
    Popover,
    ShortKey,
} from "edf-component"
import moment from "moment"
import { Map, fromJS } from "immutable"
import { GridInputDecorator } from "../components/index"
import utils from "edf-utils"
import { moment as momentUtil } from "edf-utils"
import { formatNumbe, formatnum, formatprice } from "./../common"
const colKeys = [
    "addOrdelete",
    "code",
    "name1",
    "name",
    "guige",
    "unit",
    "num",
    "pices",
    "ybbalance",
    "taxRate",
    "taxAmount",
    "taxTotal",
    "rkaccount",
    "account",
]
import { blankDetail } from "./data"
import extend from "./extend"
import isEquall from "lodash.isequal"
import { stockLoading, transToNum } from "../commonAssets/js/common"
const interfaceObj = {
    0: "getRealTimeInventoryAndUnitCost", // 全月加权
    1: "getSaleMobileCostNum", // 移动加权
    2: "getRealTimeInventoryAndUnitCost", // 销售成本率的
    3: "queryPendingStockOutNum", // 先进先出
}
const Option = Select.Option
class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.extendAction = option.extendAction
        if (extend.getGridOption()) {
            this.option = extend.getGridOption()
        }
        this.voucherAction = option.voucherAction
        this.webapi = this.config.webapi
    }

    onInit = async ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        this.component.props.setOkListener(this.onOk)
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
        }
        this.financeAuditor =
            this.metaAction.context.get("currentOrg").financeAuditor || sessionStorage["username"]
        this.selectList = []
        this.editType = this.component.props.editType
        this.typeName = this.component.props.formName
        this.id = this.component.props.id
        this.voucherIds = this.component.props.voucherIds
        this.inventoryArr = []
        this.period = this.component.props.period
        this.isReadonly = this.component.props.isReadonly
        this.checkOutType = this.component.props.checkOutType
        this.hideButton = this.component.props.hideButton
        // this.salesRevenueIdList = this.component.props.salesRevenueIdList
        // console.log(this.isReadonly, "this.isReadonly")
        this.type = this.component.props.type // 原销售收入用来区分发票类型  销售出库用来区分类型 0 自动生成 1手动新增 2 修改后的单据
        injections.reduce(
            "init",
            this.typeName,
            this.type,
            this.id,
            this.inventoryArr,
            this.financeAuditor,
            this.voucherIds,
            this.isReadonly,
            this.checkOutType,
            this.hideButton
        )
        this.load(this.typeName)
        this.mustSelectSupplier = false
        this.subjectData = []
        this.tableSubjectData = []
    }

    getDisabledDate = current => {
        return (
            current.valueOf() < moment(this.period).startOf("day").valueOf() ||
            current.valueOf() > moment(this.period).endOf("month").valueOf()
        )
    }

    stockLoading = () => stockLoading()

    // 是否生成凭证
    isVoucher = () => this.voucherIds

    // 是否 已结转出库凭证或已结账
    isCarryOverOrGenVoucher = () => this.isReadonly

    /*@description: 一般表单是否可编辑
     *   可编辑: (已经结转出库成本或结账 || 已经生成凭证)
     *   不可编辑: (没有结转出库成本或结账 && 并且没有生成凭证)
     * @return {boolen} true——可编辑； false——不可编辑
     */
    commonEditable = () => {
        return !this.isCarryOverOrGenVoucher() && !this.isVoucher() // 是否是既没有结转出库成本 && 也没生成凭证
    }

    /*@description: 日期是否可编辑
     *   可编辑: (没有结转出库成本和结账)
     *   不可编辑: (已经结转出库成本或结账)
     * @return {boolen} true——可编辑； false——不可编辑
     */
    dateEditable = () => {
        return !this.isCarryOverOrGenVoucher() // 没有结转主营成本或结账
    }

    // 针对全月加权或移动加权的 '生成' 这个类型的单据
    forSpecialGenerate = () => {
        return (this.checkOutType == 0 || this.checkOutType == 1) && this.type == 0
    }

    // 针对全月加权和移动加权的 '手' 标志
    MonthlyOrMove = () => {
        return this.checkOutType == 0 || this.checkOutType == 1
    }
    // 序号排序
    sort = index => {
        return Number(index) + 1
    }
    // 出不出现增删行
    readonly = data => {
        return this.forSpecialGenerate() || !this.commonEditable()
    }

    isFifo = () => {
        return this.checkOutType == 3
    }

    showFifoIcon = data => {
        return this.checkOutType == 3 && data.bodyStockOutStatus == 1
    }
    // 发票号码编辑权限
    invNoEditRule = () => {
        // 新增
        // 编辑状态，来源是录入或导入，来源是生成且核算方法为销售成本率
        return (
            this.editType == "新增" ||
            (!this.isReadonly &&
                ((this.type == "0" && this.checkOutType == 2) ||
                    this.type == "1" ||
                    this.type == "3"))
        )
    }
    // 往来单位编辑权限
    customerNameEditRule = () => {
        // 新增
        // 编辑状态，来源是录入或导入或生成
        return (
            this.editType == "新增" ||
            (!this.isReadonly && (this.type == "0" || this.type == "1" || this.type == "3"))
        )
    }
    // 删行是否可用
    deleteRowRule = data => {
        // 新增
        // 编辑状态，来源生成且核算方式是销售成本率，来源是录入或导入
        if (
            this.editType == "新增" ||
            (!this.isReadonly &&
                ((this.type == "0" && this.checkOutType == 2) ||
                    this.type == "1" ||
                    this.type == "3"))
        ) {
            return true
        } else {
            return false
        }
    }

    // 增行控制
    addRowRule = data => {
        // 新增
        // 编辑状态，来源生成且核算方式是销售成本率，来源是录入或导入
        if (
            this.editType == "新增" ||
            (!this.isReadonly &&
                ((this.type == "0" && this.checkOutType == 2) ||
                    this.type == "1" ||
                    this.type == "3"))
        ) {
            return true
        } else {
            return false
        }
    }

    inventoryNameRender = data => {
        if (this.checkOutType == 3) {
            if (this.editType == "查看") {
                return false
            } else if (this.editType == "编辑") {
                return false
                // return (this.type == 0) ? false : (bodyStockOutStatus == 1) ? false : true
            } else {
                return true
            }
        } else {
            return this.commonEditable() && !this.forSpecialGenerate()
        }
    }

    numRender = data => {
        if (this.checkOutType == 3) {
            if (this.editType == "查看") {
                return false
            } else if (this.editType == "编辑") {
                return false
                // return (this.type == 0) ? false : (bodyStockOutStatus == 1) ? false : true
            } else {
                return true
            }
        } else {
            return this.commonEditable() && !this.forSpecialGenerate()
        }
    }

    priceRender = () => {
        return this.checkOutType == 3 ? false : this.commonEditable()
    }

    amountRender = () => {
        return this.checkOutType == 3 ? false : this.commonEditable()
    }

    handleCustomerSelect = value => {
        this.metaAction.sf("data.form.customerId", value)
    }
    numChange = (rowIndex, rowData) => async v => {
        // 金额＝单价×数量
        // let quantity = utils.number.round(v, 6),
        let quantity = formatNumbe(v) //解决删除时将小数点自动删除得问题
        if (quantity > rowData["stockNum"]) {
            this.metaAction.toast("error", "数量不能大于待出库数量")
            let _this = this
            let p = new Promise(function (resolve, reject) {
                _this.metaAction.sfs({
                    [`data.form.details.${rowIndex}.quantity`]: v,
                })
                resolve(rowData)
            })
            p.then(rowData => {
                if (rowData.quantity && _this.editType == "编辑") {
                    _this.metaAction.sfs({
                        [`data.form.details.${rowIndex}.quantity`]: rowData.quantity,
                    })
                } else {
                    _this.metaAction.sfs({
                        [`data.form.details.${rowIndex}.quantity`]: "",
                        [`data.form.details.${rowIndex}.amount`]: "",
                        [`data.form.details.${rowIndex}.price`]: "",
                    })
                }
            })
        } else {
            if ((rowData.inventoryId || rowData.id) && quantity != 0) {
                let res = await this.webapi.operation.calculatePendingStockOutPriceAndAmount({
                    period: this.period,
                    inventoryId: rowData.inventoryId ? rowData.inventoryId : rowData.id,
                    pendingStockOutNum: quantity,
                })
                this.metaAction.sfs({
                    [`data.form.details.${rowIndex}.quantity`]: quantity,
                    [`data.form.details.${rowIndex}.amount`]: res.pendingStockOutAmount,
                    [`data.form.details.${rowIndex}.price`]: res.pendingStockOutPrice,
                    [`data.form.details.${rowIndex}.outToInRelationList`]: res.outToInRelationList,
                })
            }
        }
    }

    load = async name => {
        // LoadingMask.show()
        this.metaAction.sf("data.loading", true)
        this.customerList = this.customerNameEditRule()
            ? await this.webapi.operation.findCustomerList({})
            : []
        if (this.id) {
            let serviceTypeCode = ""
            if (this.typeName == "采购入库单") {
                serviceTypeCode = "CGRK"
            } else {
                serviceTypeCode = "XSCB"
            }
            let selectname = []
            const response = await this.webapi.operation.queryone({
                serviceTypeCode: serviceTypeCode,
                id: this.id,
            })

            if (response) {
                if (response.billBodys && typeof response.billBodys == "string") {
                    const billBodys = JSON.parse(response.billBodys)
                    if (Object.prototype.toString.call(billBodys) == "[object Array]") {
                        billBodys.forEach(item => {
                            selectname.push(item.inventoryId)
                        })
                        sessionStorage["inventoryNameList"] = selectname
                    }
                }
                this.injections.reduce("load", response)
            }

            this.opstionList = await this.webapi.operation.findInventoryList({})

            this.renderSelectOptionInventory(this.opstionList, true)

            this.metaAction.sf("data.loading", false)
        } else {
            const getServerDate = await this.webapi.operation.getServerDate()
            let data = momentUtil.stringToMoment(getServerDate).format("YYYY-MM")
            let name = this.metaAction.context.get("currentOrg").name
            if (data == sessionStorage["stockPeriod" + name]) {
                this.enableDateChange(
                    "data.form.cdate",
                    momentUtil.stringToMoment(getServerDate).format("YYYY-MM-DD")
                )
            } else {
                let year = sessionStorage["stockPeriod" + name].split("-")
                let data = Number(year[1]) + 1
                if (data < 10) data = "0" + data
                let str = year[0] + "-" + data + "-" + "01"
                let lastData = moment(str).valueOf()
                if (data > 12) {
                    data = "01"
                    str = Number(year[0]) + 1 + "-" + data + "-" + "01"
                    lastData = moment(str).valueOf()
                }
                let reqData = moment(lastData - 24 * 60 * 60 * 1000).format("YYYY-MM-DD")
                this.enableDateChange("data.form.cdate", reqData)
            }
            sessionStorage["inventoryNameList"] = []

            this.opstionList = await this.webapi.operation.findInventoryList({})
            this.renderSelectOptionInventory(this.opstionList, false)
            // LoadingMask.hide()
            this.metaAction.sf("data.loading", false)
        }
    }
    confirmOperation = () => {
        return this.metaAction.context.get("currentOrg").accountingStandards === 2000020001
            ? "XSCK_CREDIT_KJZZ_2017"
            : "XSCK_CREDIT_XKJZZ_2013"
    }
    selectAccount = value => {
        let selectOption = this.subjectData.find(item => item.id === value)
        if (this.typeName === "采购入库单") {
            if (selectOption.isCalcSupplier) this.mustSelectSupplier = true
        } else if (this.typeName === "销售出库单") {
            if (selectOption.isCalcCustomer) this.mustSelectSupplier = true
        }
        // this.accountId = value
        // this.accountName = selectOption.codeAndName
        this.metaAction.sfs({
            "data.form.accountId": value,
            "data.form.accountName": selectOption.codeAndName,
        })
        this.checkRightNow("accountName")
        // console.log("path", this.metaAction.gf("data.form.accountId"))
        // console.log("data.form.accountName", this.metaAction.gf("data.form.accountName"))
    }
    selectTableAccount = (value, index) => {
        if (!value) {
            this.injections.reduce("updateSfs2", {
                [`data.form.details.${index}.accountId`]: null,
                [`data.form.details.${index}.accountName`]: null,
            })
        } else {
            let selectOption = this.tableSubjectData.find(item => item.id === value)
            this.injections.reduce("updateSfs2", {
                [`data.form.details.${index}.accountId`]: value,
                [`data.form.details.${index}.accountName`]: selectOption.codeAndName,
            })
        }
    }
    handleSearch = e => {
        // console.log('搜索~~~')
    }
    handleChange = e => {
        // console.log('change?????????')
    }
    renderCustomerOption = () =>
        (this.customerList || []).map(item => (
            <Option key={item.customerId} value={item.customerId} title={item.customerName}>
                {item.customerName}
            </Option>
        ))
    //过滤行业
    filterIndustry = (input, option) => {
        return option.props.children.indexOf(input) >= 0
    }

    getSelectOption = () => {
        return this.selectOption
    }

    addRow = rowIndex => () => {
        let details = this.metaAction.gf("data.form.details").toJS(),
            index = Number(rowIndex) + 1,
            item = blankDetail
        details.splice(index, 0, item)
        this.metaAction.sfs({ "data.form.details": fromJS(details) })
    }
    onOk = async type => {
        return await this.save(type)
    }
    onCancel = async () => {
        let cacheData =
            (this.metaAction.gf("data.form.cacheData") &&
                this.metaAction.gf("data.form.cacheData").toJS()) ||
            []
        let list =
            (this.metaAction.gf("data.form.details") &&
                this.metaAction.gf("data.form.details").toJS()) ||
            []

        if (this.id && !isEquall(cacheData, list)) {
            const res = await this.metaAction.modal("confirm", {
                className: "haveData",
                content: `当前界面有数据，请确认是否先进行保存`,
            })
            if (res) return false
        }
        this.component.props.closeModal && this.component.props.closeModal("null")
    }
    checkRightNow = async (key, flag) => {
        var form = (this.metaAction.gf("data.form") && this.metaAction.gf("data.form").toJS()) || {}
        let checkList
        if (flag) {
            checkList = []
            checkList.push({ path: `data.form.${key}`, value: form[key] })
        } else {
            checkList = [{ path: `data.form.${key}`, value: form[key] }]
            if (this.mustSelectSupplier && key === "accountName")
                checkList.push({
                    path: "data.form.supplierName",
                    value: form.supplierName,
                })
        }
        const ok = await this.check(checkList)
    }
    codeChange = async value => {
        this.metaAction.sf("data.form.code", value)
        this.checkRightNow("code")
    }
    checkDetails = list => {
        let arr = [],
            errorMsg = ""
        for (let i = 0; i < list.length; i++) {
            const item = { ...list[i] }
            if (item.code) {
                let obj = {}
                obj.inventoryId = item.id
                obj.ybbalance = formatNumbe(item.amount)
                obj.num = formatNumbe(item.quantity)
                obj.price = formatNumbe(item.price)
                if (!(obj.num && obj.price && obj.ybbalance)) {
                    errorMsg = "红框内填入正确值"
                    break
                }
                if (item.detailId) obj.detailId = item.detailId
                obj.salesRevenueId = item.salesRevenueId ? item.salesRevenueId : null
                if (this.id) {
                    if (
                        item.type == 0 &&
                        transToNum(item.amount) !== transToNum(item.ybbalance) &&
                        (this.checkOutType == 0 || this.checkOutType == 1)
                    ) {
                        obj.type = 2
                    } else {
                        obj.type = item.type
                    }
                } else {
                    obj.type = 1
                }
                if (item.salesCostRate) obj.salesCostRate = item.salesCostRate

                if (this.checkOutType === 3 && this.editType === "新增") {
                    obj.outToInRelationList = item.outToInRelationList
                }
                arr.push(obj)
            }
        }
        if (!errorMsg && arr.length == 0) {
            errorMsg = "存货明细不能为空"
        }

        errorMsg && this.metaAction.toast("error", errorMsg)
        this.metaAction.sfs({
            "data.loading": false,
            "data.other.error.detailsError": errorMsg ? true : false,
        })
        return errorMsg ? null : arr
    }
    save = async type => {
        this.metaAction.sf("data.loading", true)
        let reqList = {}
        var form = (this.metaAction.gf("data.form") && this.metaAction.gf("data.form").toJS()) || {}
        let checkList = [
            { path: "data.form.cdate", value: form.cdate },
            { path: "data.form.code", value: form.code },
        ]
        if (this.invNoEditRule()) {
            checkList.push({ path: "data.form.invNo", value: form.invNo })
        }
        const ok = await this.check(checkList)
        if (!ok) {
            this.metaAction.sf("data.loading", false)
            return false
        }
        let list =
            (this.metaAction.gf("data.form.details") &&
                this.metaAction.gf("data.form.details").toJS()) ||
            []

        let arr = this.checkDetails(list)
        if (!arr) return false

        reqList.code = form.code
        reqList.period = form.cdate
        reqList.operater = form.operater
        reqList.invNo = form.invNo
        reqList.invType = form.invType
        reqList.invCode = form.invCode
        reqList.customerId = form.customerId
        reqList.customerName = form.customerName
        reqList.type = this.type
        reqList.billBodyDtoList = arr
        this.id && (reqList.id = this.id)
        this.voucherIds && (reqList.voucherIds = this.voucherIds)
        let resp = await this.webapi.operation.saveSalesCostDetails(reqList)

        this.metaAction.sf("data.loading", false)
        if (resp) {
            if (type == "saveAndNew") {
                if (this.id) this.id = ""
                const option = this.metaAction.gf("data.formList.titleName")
                this.injections.reduce("init", option, undefined, undefined, this.inventoryArr)
                this.metaAction.toast("success", "保存并新增成功")
                this.load()
            } else {
                this.metaAction.toast("success", "保存成功")
                this.component.props.closeModal(resp)
            }
        } else {
            return false
        }
    }
    getRowError = (field, rowIndex, isFocus, isReadonly) => {
        const row = this.metaAction.gf("data.form.details").toJS()[rowIndex]
        const detailsError = this.metaAction.gf("data.other.error.detailsError")
        let isCanEdit = null,
            className = row && row.code && detailsError && !row[field] ? "-sales-error" : ""
        switch (field) {
            case "name":
                className = "tdChme"
                isCanEdit = this.inventoryNameRender()
                break
            case "quantity":
                isCanEdit = this.numRender()
                break
            case "price":
                isCanEdit = this.priceRender()
                break
            case "amount":
                className += " ybbalance"
                isCanEdit = this.amountRender()
                break
        }
        className += isCanEdit && isFocus ? " inputSelectonClick" : " inputSelectClass"
        className += !isCanEdit || isReadonly ? " readonly" : ""

        return className
    }
    check = async fieldPathAndValues => {
        if (!fieldPathAndValues) return

        var checkResults = []

        for (var o of fieldPathAndValues) {
            let r = { ...o }
            if (o.path == "data.form.cdate") {
                Object.assign(r, await this.checkCdate(o.value))
            }
            if (o.path == "data.form.code") {
                Object.assign(r, await this.checkCode(o.value))
            }
            if (o.path == "data.form.invNo") {
                Object.assign(r, await this.checkinvNo(o.value))
            }
            checkResults.push(r)
        }
        var json = {}
        var hasError = true
        checkResults.forEach(o => {
            json[o.path] = o.value
            json[o.errorPath] = o.message
            if (o.message) hasError = false
        })

        this.metaAction.sfs(json)
        return hasError
    }
    checkCdate = async code => {
        var message

        if (!code) message = "请选择入库日期"

        return { errorPath: "data.other.error.cdate", message }
    }

    checkCode = async name => {
        var message

        if (!name) message = "请录入单据编号"

        return { errorPath: "data.other.error.code", message }
    }
    checkinvNo = (value, isSet = false) => {
        let error = false
        if (value && (!/^[0-9]*$/.test(value) || value.length < 8)) {
            error = true
        }
        if (isSet) {
            return this.metaAction.sfs({
                "data.form.invNo": value,
                "data.other.error.invNo": error,
            })
        }
        return { errorPath: "data.other.error.invNo", message: error }
    }
    enableDateChange = async (path, data) => {
        this.metaAction.sf("data.loading", true)
        let currentOrg = momentUtil.stringToMoment(data).format("YYYY-MM")
        let serviceTypeCode = ""
        if (this.metaAction.gf("data.formList.titleName") == "采购入库单") {
            serviceTypeCode = "CGRK"
        } else {
            serviceTypeCode = "XSCB"
        }
        const response = await this.webapi.operation.query({
            serviceTypeCode: serviceTypeCode,
            period: currentOrg,
        })
        this.metaAction.sf(path, data)
        this.metaAction.sf("data.form.code", response)
        this.metaAction.sf("data.loading", false)
    }
    selectOption = async (path, data) => {
        let id = ""
        this.selectList.forEach(item => {
            if (item.supplierCode == data || item.customerCode == data) {
                id = item.supplierId ? item.supplierId : item.customerId
                return
            }
        })
        this.metaAction.sf(path, data)
        this.metaAction.sf("data.form.supplierId", id)
        if (this.mustSelectSupplier) this.checkRightNow("supplierName", true)
    }
    selectAccountOption = async (path, data) => {
        let id = ""
        this.selectList.forEach(item => {
            if (item.supplierCode == data || item.customerCode == data) {
                id = item.supplierId ? item.supplierId : item.customerId
                return
            }
        })
        this.metaAction.sf(path, data)
        this.metaAction.sf("data.form.supplierId", id)
    }
    calc = (col, rowIndex, rowData, params) => v => {
        params = Object.assign(params, {
            value: v,
        })
        this.voucherAction.calc(col, rowIndex, rowData, params)
    }
    quantityFormat = (quantity, decimals, isFocus) => {
        if (quantity) {
            if (isFocus == "price") {
                return formatprice(quantity, decimals)
            } else {
                return formatNumbe(quantity, decimals)
            }
        }
    }
    btnClicklist = async id => {
        const ret = await this.metaAction.modal("show", {
            title: "存货名称选择",
            width: 950,
            height: 520,
            children: this.metaAction.loadApp("ttk-stock-app-inventory-intelligence", {
                store: this.component.props.store,
            }),
        })
        if (ret) {
            let ids = ret.map(e => e.inventoryId)
            if (this.checkOutType == 3) {
                let stockOutList = ids.map(e => ({ inventoryId: e }))
                let numRes = await this.webapi.operation[interfaceObj[this.checkOutType]]({
                    period: this.period,
                    stockOutList,
                })
                let costs = numRes.stockOutList
                costs.forEach(e => {
                    e.num = e.pendingStockOutNum
                })
                ret.forEach(e => {
                    let cItem = costs.find(f => f.inventoryId === e.inventoryId)
                    if (cItem) {
                        e.placeholder = `库存: ${cItem.num ? cItem.num : "0"}`
                        e.stockNum = cItem.num
                    }
                })
            } else if (this.checkOutType == 0 || this.checkOutType == 1) {
                // let ids = ret.map(e => e.inventoryId)
                let costs = await this.webapi.operation[interfaceObj[this.checkOutType]]({
                    period: this.period,
                    ids,
                })
                ret.forEach(e => {
                    let cItem = costs.find(f => f.inventoryId === e.inventoryId)
                    if (cItem) {
                        e.placeholder = `库存: ${cItem.num ? cItem.num : "0"}`
                        if (this.checkOutType == 0) {
                            e.price = cItem.unitCost
                        } else if (this.checkOutType == 1) {
                            e.price = cItem.price
                        }
                    }
                })
            } else if (this.checkOutType == 2) {
                // let ids = ret.map(e => e.inventoryId)
                let costs = await this.webapi.operation[interfaceObj[this.checkOutType]]({
                    period: this.period,
                    ids,
                })
                ret.forEach(e => {
                    let cItem = costs.find(f => f.inventoryId === e.inventoryId)
                    if (cItem) {
                        e.placeholder = `库存: ${cItem.num ? cItem.num : "0"}`
                    }
                })
            }
            this.injections.reduce("updateSfs", ret, id, "btnClicklist")
            this.renderSelectOptionInventory(this.opstionList, true)
        }
    }
    btnClick = rowIndex => e => {
        this.btnClicklist(rowIndex)
    }
    selectOptionInventory = async (rowIndex, e, value) => {
        let list = []
        this.opstionList.forEach(item => {
            if (item.inventoryCode == e) {
                item.disabled = true
                list.push(item)
                return
            }
            if (item.inventoryName == value) {
                item.disabled = false
                return
            }
        })
        this.renderSelectOptionInventory(this.opstionList)
        let res,
            option = list.find(f => f.inventoryCode === e)
        if (this.checkOutType == 3) {
            res = await this.webapi.operation[interfaceObj[this.checkOutType]]({
                period: this.period,
                stockOutList: [{ inventoryId: option.inventoryId }],
            })
        } else {
            res = await this.webapi.operation[interfaceObj[this.checkOutType]]({
                period: this.period,
                ids: [option.inventoryId],
            })
        }
        if (this.checkOutType == 3) {
            list[0]["placeholder"] = `库存: ${
                res.stockOutList[0].pendingStockOutNum
                    ? res.stockOutList[0].pendingStockOutNum
                    : "0"
            }`
            list[0]["stockNum"] = res.stockOutList[0].pendingStockOutNum
            // 处理已有数据 再更改存货名称的情况
            if ((list[0].inventoryId || list[0].id) && list[0].num) {
                list[0].amount = ""
                list[0].price = ""
                list[0].quantity = ""
            }
        } else if (this.checkOutType == 0 || this.checkOutType == 1) {
            list[0]["placeholder"] = `库存: ${res[0].num ? res[0].num : "0"}`
            if (this.checkOutType == 0) {
                list[0]["price"] = res[0].unitCost
            } else if (this.checkOutType == 1) {
                list[0]["price"] = res[0].price
            }
        } else if (this.checkOutType == 2) {
            // 销售成本率的特殊处理
            list[0]["placeholder"] = `库存: ${res[0].num ? res[0].num : "0"}`
        }
        this.injections.reduce("updateSfs", list, rowIndex)
    }
    renderSelectOptionInventory = (data, falg) => {
        if (sessionStorage["inventoryNameList"].length > 0 && falg) {
            data.forEach(item => {
                if (sessionStorage["inventoryNameList"].indexOf(item.inventoryId) > -1) {
                    item.disabled = true
                } else {
                    item.disabled = false
                }
            })
        }
        this.metaAction.sf("data.fetching", true)
        const arr = data.map(item => {
            const { inventoryCode, inventoryName, inventoryGuiGe, inventoryUnit } = item
            const objArr = [inventoryCode, inventoryName, inventoryGuiGe, inventoryUnit]
            const contentText = objArr.filter(v => !!v).join("-")

            if (this.checkOutType != 3) {
                return (
                    <Option
                        width={200}
                        key={item.inventoryId}
                        value={item.inventoryCode}
                        title={contentText}>
                        {contentText}
                    </Option>
                )
            } else {
                return (
                    <Option
                        width={200}
                        key={item.inventoryId}
                        value={item.inventoryCode}
                        title={contentText}
                        disabled={item.disabled}>
                        {contentText}
                    </Option>
                )
            }
        })
        this.selectOptionInventory = arr
        this.metaAction.sf("data.other.key", Math.floor(Math.random() * 10000))
        this.metaAction.sf("data.fetching", false)
    }
    renderStockNameAdd = () => {
        return (
            <div className="stock-app-select-add-btn add" onClick={this.addStockName}>
                {/* <img src={img}/> */}
                <i className="add-img"></i>
                <span>新增</span>
            </div>
        )
    }
    addStockName = async e => {
        if (navigator.userAgent.indexOf("Trident") > -1) {
            e.cancelBubble = true
        }
        const ret = await this.metaAction.modal("show", {
            title: "新增存货档案",
            wrapClassName: "card-archive",
            width: 700,
            height: 520,
            footer: "",
            children: this.metaAction.loadApp("ttk-app-inventory-card", {
                store: this.component.props.store,
                initData: null,
            }),
        })
        if (ret) {
            this.opstionList = await this.webapi.operation.findInventoryList({})
            const flag = this.id ? true : false
            this.renderSelectOptionInventory(this.opstionList, flag)
        }
    }
    addSubject = rowIndex => async () => {
        const ret = await this.metaAction.modal("show", {
            title: "新增科目",
            width: 450,
            okText: "保存",
            bodyStyle: { padding: 24, fontSize: 12 },
            children: this.metaAction.loadApp("app-proof-of-charge-subjects-add", {
                store: this.component.props.store,
                columnCode: "subjects",
                active: "certificate",
            }),
        })
        if (ret) {
            if (rowIndex) {
                if (this.typeName == "销售出库单") {
                    // 销售出库贷方科目
                    this.tableSubjectData = await this.webapi.operation.getSubjectList({
                        operation: this.confirmOperation(),
                    })
                    this.metaAction.sf("data.form.tableAccountList", fromJS(this.tableSubjectData))
                }
            } else {
                if (this.typeName == "采购入库单") {
                    // 采购入库贷方科目
                    this.subjectData = await this.webapi.operation.getSubjectList({
                        operation: "CGRK_CREDIT",
                    })
                    this.metaAction.sf("data.form.accountList", fromJS(this.subjectData))
                } else {
                    // 销售出库借方科目
                    this.subjectData = await this.webapi.operation.getSubjectList({
                        operation: "XSCK_DEBIT",
                    })
                    this.metaAction.sf("data.form.accountList", fromJS(this.subjectData))
                }
            }
        }
    }
    //过滤往来单位
    filterCustomer = (input, option) => {
        return option.props.children.indexOf(input) >= 0
    }
    //存货名称搜索过滤下拉框
    filterIndustryInventory = (input, option) => option.props.children.indexOf(input) > -1

    getSelectOptionInventory = () => {
        return this.selectOptionInventory
    }
    delRow = rowIndex => () => {
        var list =
            (this.metaAction.gf("data.form.details") &&
                this.metaAction.gf("data.form.details").toJS()) ||
            []
        let selectname = []
        list.forEach((item, index) => {
            if (item.id && index != rowIndex) {
                selectname.push(item.id)
            }
        })
        sessionStorage["inventoryNameList"] = selectname
        this.renderSelectOptionInventory(this.opstionList, true)
        this.injections.reduce("delect", rowIndex)
    }
    isNewAdd = () => this.editType === "新增"
    mousedown = e => {
        const path = utils.path.findPathByEvent(e)
        if (this.metaAction.isFocus(path)) return

        if (path.indexOf("cell.cell") != -1) {
            this.focusCell(this.getCellInfo(path), path.indexOf("name") > -1 ? true : false)
        } else {
            if (!this.metaAction.focusByEvent(e)) return
            setTimeout(this.cellAutoFocus, 16)
        }
    }
    getCellInfo(path) {
        const parsedPath = utils.path.parsePath(path)
        const rowCount =
            (this.metaAction.gf("data.form.details") &&
                this.metaAction.gf("data.form.details").size) ||
            0
        const colCount = 10
        // debugger
        var colKey = ""
        if (parsedPath.path.indexOf("name") > -1) {
            colKey = parsedPath.path
                .replace("root.children.content.children.details.columns.", "")
                .replace(".cell.cell", "")
                .replace(".children.input", "")
                .replace(/\s/g, "")
            this.flag = true
        } else {
            colKey = parsedPath.path
                .replace("root.children.content.children.details.columns.", "")
                .replace(".cell.cell", "")
                .replace(/\s/g, "")
            this.flag = false
        }

        return {
            x: colKeys.findIndex(o => o == colKey),
            y: Number(parsedPath.vars[0]),
            colCount,
            rowCount,
        }
    }
    focusCell(position, falg) {
        if (falg) {
            this.metaAction.sfs({
                "data.other.focusFieldPath": `root.children.content.children.details.columns.${
                    colKeys[position.x]
                }.cell.cell.children.input,${position.y}`,
                "data.other.scrollToRow": position.y,
                "data.other.scrollToColumn": position.x,
            })
        } else {
            this.metaAction.sfs({
                "data.other.focusFieldPath": `root.children.content.children.details.columns.${
                    colKeys[position.x]
                }.cell.cell,${position.y}`,
                "data.other.scrollToRow": position.y,
                "data.other.scrollToColumn": position.x,
            })
        }
        setTimeout(this.cellAutoFocus, 16)
    }
    gridKeydown = e => {
        if (!this.option) return

        var path = ""

        if (
            e.keyCode == 37 ||
            e.keyCode == 39 ||
            e.keyCode == 13 ||
            e.keyCode == 108 ||
            e.keyCode == 9 ||
            e.keyCode == 38 ||
            e.keyCode == 40
        ) {
            path = utils.path.findPathByEvent(e)
            if (!path || path.indexOf(",") == -1) return
        }

        const len = path.length
        const index = path.slice(len - 1, len)

        //37:左键
        if (e.keyCode == 37) {
            if (!utils.dom.cursorAtBegin(e)) return
            this.moveEditCell(path, "left")

            const ele = ReactDOM.findDOMNode(this.component)
            if (index && ele) {
                const elems = ele.querySelectorAll(".ybbalance")[index]
                elems.blur()
                // elems.forEach(item=>{
                //     item.blur()
                // })
            }

            return
        }

        //39:右键 13:回车 108回车 tab:9
        if (e.keyCode == 39 || e.keyCode == 13 || e.keyCode == 108 || e.keyCode == 9) {
            // 应该只有右键的时候，才会去判断光标是否已经到了文本的末端
            // 回车键、tab键不需要判断，直接切换
            if (e.keyCode == 39 && !utils.dom.cursorAtEnd(e)) return
            if (path) {
                let columnGetter = this.metaAction.gm(path)
                if (columnGetter) {
                    if (columnGetter.noTabKey == true) {
                        return
                    }
                }
            }

            this.moveEditCell(path, "right")

            const ele = ReactDOM.findDOMNode(this.component)
            if (index && ele) {
                const elems = ele.querySelectorAll(".ybbalance")[index]
                elems.blur()
                // elems.forEach(item=>{
                //     item.blur()
                // })
            }

            return
        }

        //38:上键
        if (e.keyCode == 38) {
            this.moveEditCell(path, "up")
            return
        }

        //40:下键
        if (e.keyCode == 40) {
            this.moveEditCell(path, "down")
            return
        }
    }
    cellAutoFocus = () => {
        this.gridCellAutoFocus(this.component, ".inputSelectonClick")
    }
    moveEditCell(path, action) {
        const cellInfo = this.getCellInfo(path)
        this.moveCell(cellInfo, action, path)
    }
    moveCell(cellInfo, action, path) {
        const position = utils.matrix.move(
            cellInfo.rowCount,
            cellInfo.colCount,
            { x: cellInfo.x, y: cellInfo.y },
            action
        )
        this.focusCell({ ...cellInfo, ...position }, this.flag)
    }
    gridCellAutoFocus(container, editCtrlClassName, position, path) {
        let containerObj = ReactDOM.findDOMNode(container)
        if (!containerObj) return
        let editorDOM = containerObj.querySelector(editCtrlClassName)

        if (!editorDOM) return
        // if (!editorDOM) {
        //     editorDOM = containerObj.querySelector(".tdChme")
        //     if (!editorDOM) return
        //     if (editorDOM.className.indexOf('tdChme') != -1) {
        //         const input = editorDOM.querySelector('.mk-datagrid-cellContent')
        //         input && input.click()
        //         return
        //     }
        // }

        if (editorDOM.className.indexOf("mk-select") != -1) {
            editorDOM.click()
            // const input = editorDOM.querySelector('.ant-select-selection')
            // input && input.select()
            return
        }

        if (editorDOM.className.indexOf("input") != -1) {
            if (editorDOM.getAttribute("path")) {
                if (
                    editorDOM.getAttribute("path").indexOf("creditAmount") > -1 ||
                    editorDOM.getAttribute("path").indexOf("debitAmount") > -1
                ) {
                    window.setTimeout(function () {
                        editorDOM.blur()
                        editorDOM.select()
                        return
                    }, 10)
                }
            }
            if (editorDOM.select) {
                editorDOM.select()
            } else {
                const input = editorDOM.querySelector("input")
                input && input.select()
            }
            return
        }

        if (editorDOM.className.indexOf("select") != -1) {
            editorDOM.click()
            const input = editorDOM.querySelector("input")
            input && input.select()
            return
        }

        if (editorDOM.className.indexOf("datepicker") != -1) {
            const input = editorDOM.querySelector("input")
            input.click()
            return
        }

        if (editorDOM.className.indexOf("checkbox") != -1) {
            const input = editorDOM.querySelector("input")
            input.focus()
            return
        }

        if (editorDOM.className.indexOf("cascader") != -1) {
            editorDOM.click()
            const input = editorDOM.querySelector("input")
            input && input.select()
            return
        }
    }
}

export default function creator(option) {
    // console.log(GridInputDecorator)
    const metaAction = new MetaAction(option),
        extendAction = extend.actionCreator({ ...option, metaAction }),
        voucherAction = GridInputDecorator.actionCreator({
            ...option,
            metaAction,
        }),
        o = new action({ ...option, metaAction, extendAction, voucherAction }),
        ret = {
            ...metaAction,
            ...extendAction.gridAction,
            ...voucherAction,
            ...o,
        }

    metaAction.config({ metaHandlers: ret })

    return ret
}
