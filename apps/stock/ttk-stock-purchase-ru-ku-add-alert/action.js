import React from "react"
import ReactDOM from "react-dom"
import { action as MetaAction } from "edf-meta-engine"
import config from "./config"
import { Checkbox, DataGrid } from "edf-component"
// import {DataGrid, Select, Icon, Input,Button} from 'edf-component'
import moment from "moment"
import { Map, fromJS } from "immutable"
import { GridInputDecorator } from "../components/index"
import utils from "edf-utils"
import { moment as momentUtil } from "edf-utils"
import { formatNumbe, formatprice } from "./../common"
import BatchSetting from "./BatchSetting"
const colKeys = ["name", "num", "pices", "ybbalance", "taxRate", "taxAmount", "account"]
import { blankDetail } from "./data"
import extend from "./extend"
import isEquall from "lodash.isequal"
import { stockLoading, billDisabledDate, getVoucherDateZGRK } from "../commonAssets/js/common"

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
        this.selectList = []
        this.typeName = this.component.props.formName
        this.id = this.component.props.id
        this.type = this.component.props.type
        this.voucherIds = this.component.props.voucherIds
        this.unEditable = this.component.props.unEditable
        this.checkOutType = this.component.props.checkOutType
        this.editType = this.component.props.editType
        this.giveBackInfo = this.component.props.giveBackInfo
        injections.reduce("init", this.typeName, this.type)
        this.load(this.typeName)
        this.mustSelectSupplier = false
        this.subjectData = []
        this.tableSubjectData = []
    }

    // 是否生成凭证
    isVoucher = () => this.voucherIds

    // 是否已结转出库凭证
    isCarryOver = () => this.unEditable

    /*@description: 一般表单是否可编辑
     *   可编辑: (已经结转出库成本 或 已经生成凭证)
     *   不可编辑: (没有结转出库成本 && 并且没有生成凭证)
     * @return {boolen} true——可编辑； false——不可编辑
     */
    commonEditable = () => {
        return !this.isCarryOver() && !this.isVoucher() // 是否是既没有结转出库成本 && 也没生成凭证
    }

    /*@description: 日期是否可编辑
     *   可编辑: (没有结转出库成本)
     *   不可编辑: (已经结转出库成本)
     * @return {boolen} true——可编辑； false——不可编辑
     */
    dateEditable = () => {
        return !this.isCarryOver() // 没有结转出库凭证
    }

    // 出不出现增删行
    readonly = data => {
        return !this.commonEditable()
    }

    // 序号排序
    sort = index => {
        return Number(index) + 1
    }

    // 删行控制
    deleteControl = data => {
        if (this.checkOutType == 3 && this.editType == "编辑" && data.bodyStockOutStatus == 1) {
            return false
        } else {
            return true
        }
    }

    // 存货名称的控制
    inventoryNameRender = data => {
        if (this.checkOutType == 3) {
            if (this.typeName == "采购入库单") {
                if (this.editType == "查看") {
                    return false
                } else if (this.editType == "编辑") {
                    return data.bodyStockOutStatus == 1 ? false : true
                } else {
                    return true
                }
            } else {
                return this.commonEditable()
            }
        } else {
            return this.commonEditable()
        }
    }

    // 按钮控制
    commonRender = data => {
        if (this.checkOutType == 3) {
            if (this.typeName == "采购入库单") {
                if (this.editType == "查看") {
                    return false
                } else if (this.editType == "编辑") {
                    return data.bodyStockOutStatus == 1 ? false : true
                } else {
                    return true
                }
            } else {
                return this.commonEditable()
            }
        } else {
            return this.commonEditable()
        }
    }
    // 先进先出Icon
    showFifoIcon = data => {
        return (
            this.checkOutType == 3 && this.typeName == "采购入库单" && data.bodyStockOutStatus == 1
        )
    }

    stockLoading = param => stockLoading(param)

    // 禁用时间 (只能选当前会计期间的日期)
    disabledDate = currentDate => billDisabledDate(this, currentDate, "data.form.cdate")

    load = async name => {
        this.metaAction.sf("data.loading", true)

        let list1Req, list2Req, list3Req
        if (this.typeName == "采购入库单") {
            list1Req = this.webapi.operation.getSubjectListId({ operation: "CGRK_CREDIT" })
        } else {
            list2Req = this.webapi.operation.getSubjectListId({ operation: "XSCK_DEBIT" })
            list3Req = this.webapi.operation.getSubjectListId({
                operation: this.confirmOperation(),
            })
        }

        this.giveBackInfo &&
            this.injections.reduce("load", this.giveBackInfo, fromJS([]), fromJS([]))

        // 查看、编辑
        if (this.id) {
            let serviceTypeCode = "",
                direction = "",
                oppositeReq = "",
                flag = "",
                tableSubReq,
                acList = [],
                tacList

            if (this.typeName == "采购入库单") {
                serviceTypeCode = "CGRK"
                direction = "CGRK_CREDIT" // 采购入库贷方科目
                oppositeReq = "findSupplierList"
                flag = "Supplier"
            } else {
                serviceTypeCode = "XSCK"
                direction = "XSCK_DEBIT" // 销售出库借方科目
                oppositeReq = "findCustomerList"
                tableSubReq = this.webapi.operation.getSubjectList({
                    operation: this.confirmOperation(),
                }) // 销售出库贷方科目
                flag = "Customer"
            }

            const responseReq = this.webapi.operation.queryone({
                    // 查询单据列表信息
                    serviceTypeCode: serviceTypeCode,
                    id: this.id,
                }),
                subjectDataReq = this.webapi.operation.getSubjectList({
                    // 采购入库贷方科目  或是  销售出库借方科目
                    operation: direction,
                }),
                dataReq = this.webapi.operation[oppositeReq]({}), // 请求”供应商“或是”客户“列表
                optionListReq = this.webapi.operation.findInventoryList({}) // 查询下拉可选择存货列表

            let selectname = []
            const response = (await responseReq) || "{}"
            const billBodys = JSON.parse(response.billBodys)
            if (
                Object.prototype.toString.call(billBodys) === "[object Array]" &&
                billBodys.length > 0
            ) {
                billBodys.forEach(item => {
                    selectname.push(item.inventoryId)
                })
            }
            sessionStorage["inventoryNameList"] = selectname
            this.subjectData = await subjectDataReq // 科目方向
            acList = fromJS(this.subjectData)
            if (this.taxRateName != "采购入库单") {
                this.tableSubjectData = await tableSubReq
                tacList = fromJS(this.tableSubjectData)
            }
            this.injections.reduce("load", response, acList, tacList)
            let data = await dataReq // ’供应商‘ 或是 ’客户‘
            this.selectList = data
            this.opstionList = await optionListReq // 下拉可选择的存货列表
            this.renderSelectOption(data, flag)
            this.renderSelectOptionInventory(this.opstionList, true) // 1
        } else {
            const getServerDate = await this.webapi.operation.getServerDate()
            let data = momentUtil.stringToMoment(getServerDate).format("YYYY-MM")
            let name = this.metaAction.context.get("currentOrg").name

            if (this.typeName == "采购入库单") {
                const currentMonth = sessionStorage["stockPeriod" + name]
                const cDate = getVoucherDateZGRK(currentMonth)
                this.enableDateChange("data.form.cdate", cDate)
            } else {
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
            }

            sessionStorage["inventoryNameList"] = []
            let dataName,
                flag = "",
                direction = ""
            if (this.typeName == "采购入库单") {
                direction = "CGRK_CREDIT"
                // 采购入库贷方科目
                this.subjectData = await this.webapi.operation.getSubjectList({
                    operation: "CGRK_CREDIT",
                })
                this.metaAction.sf("data.form.accountList", fromJS(this.subjectData))
                dataName = await this.webapi.operation.findSupplierList({})
                flag = "Supplier"
            } else {
                direction = "XSCK_DEBIT"
                // 销售出库借方科目
                this.subjectData = await this.webapi.operation.getSubjectList({
                    operation: "XSCK_DEBIT",
                })
                // 销售出库贷方科目
                this.tableSubjectData = await this.webapi.operation.getSubjectList({
                    operation: this.confirmOperation(),
                })

                this.metaAction.sfs({
                    "data.form.accountList": fromJS(this.subjectData),
                    "data.form.tableAccountList": fromJS(this.tableSubjectData),
                })

                dataName = await this.webapi.operation.findCustomerList({})
                flag = "Customer"
            }
            this.metaAction.sf("data.loading", false)
            this.selectList = dataName
            this.renderSelectOption(dataName, flag)
            this.opstionList = await this.webapi.operation.findInventoryList({})
            this.renderSelectOptionInventory(this.opstionList, false) //2
        }

        if (this.typeName == "采购入库单") {
            this.list1 = await list1Req
        } else {
            this.list2 = await list2Req
            this.list3 = await list3Req
        }
        this.metaAction.sf("data.loading", false)
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
        } else if (this.typeName === "销售收入单") {
            if (selectOption.isCalcCustomer) this.mustSelectSupplier = true
        }
        this.metaAction.sfs({
            "data.form.accountId": value,
            "data.form.accountName": selectOption.codeAndName,
        })
        this.checkRightNow("accountName")
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

    renderSelectOption = (data, flag) => {
        const arr = data.map(item => {
            const tag = flag == "Supplier" ? "supplier" : "customer"
            return (
                <Option
                    key={item[`${tag}Id`]}
                    value={item[`${tag}Code`]}
                    title={item[`${tag}Name`]}>
                    {item[`${tag}Name`]}
                </Option>
            )
        })
        this.selectOption = arr
        this.metaAction.sf("data.other.key", Math.floor(Math.random() * 10000))
    }
    //过滤行业
    filterIndustry = (input, option) => {
        return option.props.children.indexOf(input) >= 0
    }

    getSelectOption = () => this.selectOption

    addRow = rowIndex => () => {
        let details = this.metaAction.gf("data.form.details").toJS(),
            index = Number(rowIndex) + 1,
            maxKey = Math.max(...details.map(m => m.key || 0))
        details.splice(index, 0, { ...blankDetail, key: maxKey + 1 })
        this.metaAction.sfs({ "data.form.details": fromJS(details) })
    }

    onOk = async type => await this.save(type)

    onCancel = async () => {
        let cacheData =
            (this.metaAction.gf("data.form.cacheData") &&
                this.metaAction.gf("data.form.cacheData").toJS()) ||
            []
        let list =
            (this.metaAction.gf("data.form.details") &&
                this.metaAction.gf("data.form.details").toJS()) ||
            []

        if (this.type !== undefined && !isEquall(cacheData, list)) {
            const res = await this.metaAction.modal("confirm", {
                className: "haveData",
                content: `当前界面有数据，请确认是否先进行保存`,
            })
            if (res) return false
        }
        this.component.props.closeModal && this.component.props.closeModal()
    }

    checkRightNow = async (key, flag) => {
        var form = (this.metaAction.gf("data.form") && this.metaAction.gf("data.form").toJS()) || {}
        let checkList
        if (flag) {
            checkList = []
            checkList.push({ path: `data.form.${key}`, value: form[key] })
        } else {
            checkList = [{ path: `data.form.${key}`, value: form[key] }]
            if (this.mustSelectSupplier && key === "accountName") {
                checkList.push({ path: "data.form.supplierName", value: form.supplierName })
            }
        }
        const ok = await this.check(checkList)
    }

    codeChange = async value => {
        this.metaAction.sf("data.form.code", value)
        this.checkRightNow("code")
    }
    invNoChange = ({ value, check }) => {
        const invNo = value
        let error = false
        if (invNo && (!/^[0-9]*$/.test(invNo) || invNo.length < 8)) {
            error = true
        }
        if (check) {
            return { errorPath: "data.other.error.invNo", message: error }
        }
        this.metaAction.sfs({
            "data.form.invNo": value,
            "data.other.error.invNo": error,
        })
    }
    save = async type => {
        if (this.saveDoing) {
            return
        }
        this.saveDoing = true
        if (this.type === 0) {
            const confirm = await this.metaAction.modal("confirm", {
                className: "haveData",
                content: `已生成凭证的单据，编辑单据不会同步修改凭证，请确认？`,
            })
            if (!confirm) {
                this.saveDoing = false
                return false
            }
        }
        let reqList = {
            serviceTypeCode: "CGRK",
            code: "",
            cdate: "",
            operater: "liucp",
            billBodys: "",
        }
        var form = (this.metaAction.gf("data.form") && this.metaAction.gf("data.form").toJS()) || {}
        let checkList = [
            { path: "data.form.cdate", value: form.cdate },
            { path: "data.form.code", value: form.code },
            { path: "data.form.accountName", value: form.accountName },
        ]
        if (
            (this.type == undefined || this.type == 1 || this.type == 3 || this.type == 6) &&
            form.invNo
        ) {
            checkList.push({ path: "data.form.invNo", value: form.invNo })
        }
        if (this.mustSelectSupplier) {
            checkList.push({ path: "data.form.supplierName", value: form.supplierName })
        }
        const formCheck = await this.check(checkList)

        let list =
            (this.metaAction.gf("data.form.details") &&
                this.metaAction.gf("data.form.details").toJS()) ||
            []
        let detailsCheck = []
        let falgName = true
        let arr = []
        let accountIdFlag = true
        let errorMsg = ""
        const titleName = this.metaAction.gf("data.formList.titleName")
        list.forEach(item => {
            if (item.code) {
                item.inventoryName = item.name
                item.inventoryId = item.id
                item.accountId = item.accountId
                item.ybbalance = formatNumbe(item.amount)
                item.tax = formatNumbe(item.tax)
                item.num = formatNumbe(item.quantity)
                item.taxRate =
                    item.taxRateName == 0 || item.taxRateName ? formatNumbe(item.taxRateName) : ""
                item.price = formatNumbe(item.price)
                item.taxInclusiveAmount = formatNumbe(item.taxInclusiveAmount)
                if (this.giveBackInfo) {
                    // 退货数据 销售收入单据头id
                    item.salesRevenueId = this.giveBackInfo.salesRevenueId
                }
                arr.push(item)
                // 去掉数量、单价、金额的必填校验
                if (
                    !(item.num && item.price && item.ybbalance) ||
                    (titleName == "销售收入单" && !item.accountId)
                ) {
                    detailsCheck.push(item.key)
                }
            }
        })
        if (!formCheck || detailsCheck.length) {
            errorMsg = "红框内填入正确值"
        }
        if (arr.length == 0) {
            errorMsg += (errorMsg ? "，" : "") + "存货明细不能为空"
        }
        if (errorMsg) {
            this.metaAction.sf("data.other.error.detailsCheck", fromJS(detailsCheck))
            this.metaAction.toast("error", errorMsg)
            this.saveDoing = false
            return false
        }
        reqList.code = form.code
        reqList.cdate = form.cdate
        reqList.operater = form.operater
        reqList.accountId = form.accountId
        reqList.invNo = form.invNo
        reqList.invCode = form.invCode
        reqList.invType = form.invType

        reqList.billBodys = JSON.stringify(arr)
        if (titleName == "采购入库单") {
            reqList.supplierName = form.supplierName
            reqList.supplierId = form.supplierId
            reqList.serviceTypeCode = "CGRK"
        } else {
            reqList.customerName = form.supplierName
            reqList.customerId = form.supplierId
            reqList.serviceTypeCode = "XSCK"
        }

        let resp
        if (this.id) {
            reqList.id = this.id
            reqList.type = form.type
            resp = await this.webapi.operation.updateBillTitle(reqList)
        } else {
            this.giveBackInfo && (reqList.type = 6)
            resp = await this.webapi.operation.createBillTitle(reqList)
        }
        this.saveDoing = false
        this.metaAction.sf("data.loading", false)
        if (resp) {
            this.giveBackInfo = null
            if (type == "saveAndNew") {
                if (this.id) this.id = ""
                const option = this.metaAction.gf("data.formList.titleName")
                this.injections.reduce("init", option)
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
            if (o.path == "data.form.accountName") {
                Object.assign(r, await this.checkAccount(o.value))
            }
            if (o.path == "data.form.supplierName") {
                Object.assign(r, await this.checkSupplierName(o.value))
            }
            if (o.path == "data.form.invNo") {
                Object.assign(r, await this.invNoChange({ value: o.value, check: true }))
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

    checkSupplierName = async name => {
        var message
        if (!name) message = "请选择往来单位"
        return { errorPath: "data.other.error.supplierName", message }
    }

    checkCode = async name => {
        var message
        if (!name) message = "请录入单据编号"
        return { errorPath: "data.other.error.code", message }
    }

    checkAccount = async name => {
        var message
        if (!name) message = `请录入${this.typeName === "采购入库单" ? "贷方科目" : "借方科目"}`
        return { errorPath: "data.other.error.accountName", message }
    }

    enableDateChange = async (path, data) => {
        let time = momentUtil.stringToMoment(data).format("YYYY-MM")
        const billType = this.metaAction.gf("data.formList.titleName")
        let serviceTypeCode = billType === "采购入库单" ? "CGRK" : "XSCB"
        const response = await this.webapi.operation.query({
            serviceTypeCode: serviceTypeCode,
            period: time,
        })
        this.metaAction.sfs({
            [path]: data,
            "data.form.code": response,
            "data.loading": false,
        })
    }

    selectOption = async (path, data) => {
        let id = ""
        this.selectList.forEach(item => {
            if (item.supplierCode == data || item.customerCode == data) {
                id = item.supplierId ? item.supplierId : item.customerId
                return
            }
        })
        this.metaAction.sfs({
            [path]: data,
            "data.form.supplierId": id,
        })
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
        this.metaAction.sfs({
            [path]: data,
            "data.form.supplierId": id,
        })
    }

    calc = (col, rowIndex, rowData, params) => v => {
        params = Object.assign(params, { value: v })
        const { value } = params
        if (value === undefined && col === "taxRateName") {
            let details =
                (this.metaAction.gf("data.form.details") &&
                    this.metaAction.gf("data.form.details").toJS()) ||
                []
            details[rowIndex][col] = ""
            details[rowIndex]["tax"] = ""
            details[rowIndex]["taxInclusiveAmount"] = ""
            this.metaAction.sf("data.form.details", fromJS(details))
        } else {
            this.voucherAction.calc(col, rowIndex, rowData, params)
        }
    }

    inputSelect = (e, a) => {
        a.onKeyDown && a.onKeyDown.stopPropagation && a.onKeyDown.stopPropagation()
    }

    inputDown = e => {
        e && e.stopPropagation && e.stopPropagation()
    }

    quantityFormat = (quantity, decimals, isFocus) => {
        if (quantity) {
            const ret =
                isFocus == "price"
                    ? formatprice(quantity, decimals)
                    : formatNumbe(quantity, decimals)
            return ret
        }
    }

    btnClicklist = async id => {
        let canRepeat = this.typeName === "销售收入单" || this.typeName === "采购入库单"
        const ret = await this.metaAction.modal("show", {
            title: "存货名称选择",
            width: 950,
            height: 520,
            style: { top: 50 },
            children: this.metaAction.loadApp("ttk-stock-app-inventory-intelligence", {
                store: this.component.props.store,
                canRepeat,
            }),
        })
        if (ret) {
            this.injections.reduce("updateSfs", ret, id, "btnClicklist")
            this.renderSelectOptionInventory(this.opstionList, true) //3
        }
    }

    btnClick = id => e => this.btnClicklist(id)

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
        this.injections.reduce("updateSfs", list, rowIndex)
    }
    renderSelectOptionInventory = (data, falg) => {
        this.metaAction.sf("data.fetching", true)
        const arr = data.map(item => {
            const { inventoryCode, inventoryName, inventoryGuiGe, inventoryUnit } = item
            const objArr = [inventoryCode, inventoryName, inventoryGuiGe, inventoryUnit]
            const contextText = objArr.filter(v => !!v).join("-")
            return (
                <Option
                    width={200}
                    key={item.inventoryId}
                    value={item.inventoryCode}
                    title={contextText}>
                    {contextText}
                </Option>
            )
        })
        this.selectOptionInventory = arr
        this.metaAction.sf("data.other.key", Math.floor(Math.random() * 10000))
        this.metaAction.sf("data.fetching", false)
    }

    renderStockNameAdd = () => {
        return (
            <div className="stock-app-select-add-btn add" onClick={this.addStockName}>
                <i className="add-img"></i>
                <span className="addSpan">新增</span>
            </div>
        )
    }

    addStockName = async () => {
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
        let sonListByPidList = []
        sonListByPidList = !(Object.prototype.toString.call(rowIndex) === "[object Object]")
            ? this.list3
            : this.typeName === "采购入库单"
            ? this.list1
            : this.list2

        const ret = await this.metaAction.modal("show", {
            title: "新增科目",
            width: 450,
            okText: "保存",
            bodyStyle: { padding: "20px 30px", fontSize: 12 },
            children: this.metaAction.loadApp("app-proof-of-charge-subjects-add", {
                store: this.component.props.store,
                columnCode: "subjects",
                active: "certificate",
                initData: {
                    sonListByPidList,
                },
            }),
        })

        if (ret) {
            if (!(Object.prototype.toString.call(rowIndex) === "[object Object]")) {
                if (this.typeName == "销售收入单") {
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

    //存货名称搜索过滤下拉框
    filterIndustryInventory = (input, option) => option.props.children.indexOf(input) > -1

    getSelectOptionInventory = () => this.selectOptionInventory

    getRowError = (row, cell) => {
        if (!row || (row && !row.code)) {
            return "inputSelectClass"
        }
        const detailsCheck = this.metaAction.gf("data.other.error.detailsCheck").toJS()
        return detailsCheck.length > 0 &&
            row &&
            !row[cell] &&
            detailsCheck.find(f => String(f) === String(row.key)) !== undefined
            ? "inputSelectClass -sales-error"
            : "inputSelectClass"
    }
    batchSetting = async () => {
        if (this.batchSettingDoing) {
            return false
        }

        const selectedRowKeys = this.metaAction.gf("data.selectedRowKeys").toJS()
        if (selectedRowKeys.length < 1) {
            this.metaAction.toast("error", "请选择存货档案")
            return
        }
        const details = this.metaAction
            .gf("data.form.details")
            .toJS()
            .filter(f => f.code)
        if (
            details.length < 1 ||
            !details.some(s => selectedRowKeys.find(f => String(f) === String(s.key)))
        ) {
            this.metaAction.toast("error", "选择的明细行，没有存货内容，请选择存货后，再点批设科目")
            return
        }
        this.batchSettingDoing = true
        const tableAccountList = this.metaAction.gf("data.form.tableAccountList").toJS()
        const option = {
            title: "批设科目",
            className: "stock-transfer-modal batch-Setting-subject-modal",
            width: 400,
            height: 400,
            okText: "保存",
            style: { top: 25 },
            bodyStyle: {
                padding: "20px 30px",
                borderTop: "1px solid #e9e9e9",
                overflow: "auto",
            },
            children: (
                <BatchSetting
                    webapi={this.webapi}
                    metaAction={this.metaAction}
                    store={this.component.props.store}
                    options={tableAccountList}
                    sonListByPidList={this.list3}
                />
            ),
        }
        const ret = await this.metaAction.modal("show", option)
        if (ret) {
            // 如果是新增，则需添加到科目源中
            if (ret.id) {
                this.tableSubjectData = await this.webapi.operation.getSubjectList({
                    operation: this.confirmOperation(),
                })
            }
            const newDetails = this.metaAction.gf("data.form.details").toJS()
            newDetails.map(m => {
                if (
                    m.code &&
                    selectedRowKeys.find(f => String(f) === String(m.key)) !== undefined
                ) {
                    m.accountId = ret.value
                    m.accountName = ret.codeAndName
                }
                return m
            })
            this.metaAction.sfs({
                "data.form.tableAccountList": fromJS(this.tableSubjectData),
                "data.form.details": fromJS(newDetails),
            })
        }
        this.batchSettingDoing = false
    }
    selectActionHeader = () => {
        const dataSource =
            (this.metaAction.gf("data.form.details") &&
                this.metaAction.gf("data.form.details").toJS()) ||
            []
        let selectedRowKeys =
            (this.metaAction.gf("data.selectedRowKeys") &&
                this.metaAction.gf("data.selectedRowKeys").toJS()) ||
            []
        const allcheck =
            dataSource.length &&
            dataSource.every(o => selectedRowKeys.some(s => String(s) === String(o.key)))
        return (
            <DataGrid.Cell name="header">
                <Checkbox
                    indeterminate={!allcheck && selectedRowKeys.length > 0}
                    checked={allcheck}
                    onChange={e => {
                        if (e.target.checked) {
                            selectedRowKeys = dataSource.map(m => m.key)
                        } else {
                            selectedRowKeys = []
                        }
                        this.metaAction.sf("data.selectedRowKeys", fromJS(selectedRowKeys))
                    }}
                />
            </DataGrid.Cell>
        )
    }
    selectActionCell = ps => {
        const list =
            (this.metaAction.gf("data.form.details") &&
                this.metaAction.gf("data.form.details").toJS()) ||
            []
        if (!list || (list && list.length < 1)) return null
        const selectedRowKeys =
            (this.metaAction.gf("data.selectedRowKeys") &&
                this.metaAction.gf("data.selectedRowKeys").toJS()) ||
            []
        const key = list[ps.rowIndex].key
        const checked =
            selectedRowKeys.find(f => String(f) === String(key)) !== undefined ? true : false
        return (
            <DataGrid.Cell name="cell">
                <Checkbox name="select" onChange={this.selectRow(key)} checked={checked} />
            </DataGrid.Cell>
        )
    }
    selectRow = key => e => {
        let selectedRowKeys =
            (this.metaAction.gf("data.selectedRowKeys") &&
                this.metaAction.gf("data.selectedRowKeys").toJS()) ||
            []
        if (e.target.checked) {
            selectedRowKeys.push(String(key))
        } else {
            selectedRowKeys = selectedRowKeys.filter(f => String(f) !== String(key))
        }
        this.metaAction.sf("data.selectedRowKeys", fromJS(selectedRowKeys))
    }
    delRow = rowIndex => () => {
        rowIndex = Number(rowIndex)
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
    mousedown = e => {
        const path = utils.path.findPathByEvent(e)
        const prePath = this.metaAction.gf("data.other.focusFieldPath")
        if (
            path !== prePath &&
            prePath &&
            (prePath.indexOf(".num.") ||
                prePath.indexOf(".pices.") ||
                prePath.indexOf(".ybbalance.") ||
                prePath.indexOf(".taxAmount."))
        ) {
            // focus前，需要手动触发onblur，否则在fixed-data-table下，Onblur失效
            const dom = document.querySelector(`input[path="${prePath}"]`)
            dom && dom.blur()
        }
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
        const colCount = colKeys.length - (this.typeName === "销售收入单" ? 0 : 1)
        // debugger
        var colKey = ""
        if (parsedPath.path.indexOf("name") > -1) {
            colKey = parsedPath.path
                .replace("root.children.content.children.details.columns.", "")
                .replace(".cell.cell", "")
                .replace(".children.input", "")
                .replace(/\s/g, "")
        } else {
            colKey = parsedPath.path
                .replace("root.children.content.children.details.columns.", "")
                .replace(".cell.cell", "")
                .replace(/\s/g, "")
        }

        return {
            x: colKeys.findIndex(o => o == colKey),
            y: Number(parsedPath.vars[0]),
            colCount,
            rowCount,
        }
    }

    focusCell(position, flag) {
        this.metaAction.sfs({
            "data.other.scrollToRow": position.y,
            "data.other.scrollToColumn": position.x,
            "data.other.focusFieldPath": flag
                ? `root.children.content.children.details.columns.${
                      colKeys[position.x]
                  }.cell.cell.children.input,${position.y}`
                : `root.children.content.children.details.columns.${
                      colKeys[position.x]
                  }.cell.cell,${position.y}`,
        })
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
        if (
            (e.keyCode == 38 || e.keyCode == 40) &&
            path.indexOf("name.cell.cell.children.input") > -1 &&
            e.target.className.indexOf("ant-select-search__field") > -1
        )
            return
        const len = path.length
        const index = path.slice(len - 1, len)

        //37:左键
        if (e.keyCode == 37) {
            if (!utils.dom.cursorAtBegin(e)) return
            this.moveEditCell(path, "left")
            this.manualBlur(e, "ybbalance")
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
                    if (columnGetter.noTabKey == true) return
                }
            }
            this.moveEditCell(path, "right")
            this.manualBlur(e, "ybbalance")
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
    manualBlur(e, className) {
        if (e.target && e.target.className.indexOf(className) > -1) {
            e.target.blur()
        }
    }
    cellAutoFocus = () => {
        this.gridCellAutoFocus(
            this.component,
            this.flag ? ".selectName.ant-select" : ".inputSelectonClick"
        )
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
        this.flag = position.x === 0 ? true : false
        this.focusCell({ ...cellInfo, ...position }, this.flag)
    }

    gridCellAutoFocus(container, editCtrlClassName, position, path) {
        let containerObj = ReactDOM.findDOMNode(container)
        if (!containerObj) return
        let editorDOM = containerObj.querySelector(editCtrlClassName)

        if (!editorDOM) return

        if (editorDOM.className.indexOf("mk-select") != -1) {
            editorDOM.click()
            return
        }

        if (editorDOM.className.indexOf("input") != -1) {
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
        voucherAction = GridInputDecorator.actionCreator({ ...option, metaAction }),
        o = new action({ ...option, metaAction, extendAction, voucherAction }),
        ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o }

    metaAction.config({ metaHandlers: ret })

    return ret
}
