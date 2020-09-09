import React from "react"
import ReactDOM from "react-dom"
import { action as MetaAction } from "edf-meta-engine"
import config from "./config"
// import { FormDecorator, Input, DataGrid, DatePicker, Select } from 'edf-component'
// import moment from 'moment'
// import { moment as momentUtil } from 'edf-utils'
// const colKeys = ['code', 'name', 'number', 'work', 'size', 'monery', 'pices']
import { FormDecorator } from "edf-component"
import { fromJS } from "immutable"
import utils from "edf-utils"
import { formatNumbe } from "./../common"
import {
    stockLoading,
    billDisabledDate,
    formatSixDecimal,
    transToNum,
} from "../commonAssets/js/common"
import extend from "./extend"
import isEquall from "lodash.isequal"
const colKeys = [
    "inventoryCode",
    "inventoryName1",
    "inventoryName",
    "inventoryGuiGe",
    "fzUnitName",
    "inventoryUnit",
    "fapiaonum",
    "num",
    "price",
    "ybbalance",
    "taxRate",
    "tex",
    "taxall",
    "remarks",
    "input",
]

class action {
    constructor(option) {
        this.metaAction = option.metaAction
        this.config = config.current
        this.extendAction = option.extendAction
        this.voucherAction = option.voucherAction
        this.webapi = this.config.webapi
    }

    onInit = ({ component, injections }) => {
        this.extendAction.gridAction.onInit({ component, injections })
        this.voucherAction.onInit({ component, injections })
        this.component = component
        this.injections = injections
        this.component.props.setOkListener(this.onOk)
        if (this.component.props.setCancelLister) {
            this.component.props.setCancelLister(this.onCancel)
        }
        const id = this.component.props.id
        this.id = this.component.props.id
        this.unEditable = this.component.props.unEditable // 是否已经生成出库凭证
        this.invNo = this.component.props.invNo //是否是由进项/销项生成的单据
        this.stateNow = this.component.props.stateNow //是否结转了销售出库凭证
        const serviceTypeCode = this.component.props.serviceTypeCode
        const type = this.component.props.type
        this.type = type
        const fromType = this.component.props.fromType
        const titleName = this.component.props.titleName
        injections.reduce("init", titleName, type, fromType)
        this.load(id, serviceTypeCode)
    }

    stockLoading = param => stockLoading(param)

    // 禁用时间 (只能选当前会计期间的日期)
    disabledDate = currentDate => billDisabledDate(this, currentDate, "data.form.cdate")

    /*@description: 日期是否可编辑
     *   可编辑: (没有结转出库成本)
     *   不可编辑: (已经结转出库成本)
     * @return {boolen} true——可编辑； false——不可编辑
     */
    dateEditable = () => {
        let ret = this.unEditable == undefined || this.unEditable ? false : true
        return ret // 该单据是由进销项生成的 && 并且该月还未生成出库凭证
    }

    load = async (id, serviceTypeCode) => {
        let selectname = []
        const response = await this.webapi.operation.queryone({
            serviceTypeCode: serviceTypeCode,
            id: id,
        })
        this.metaAction.sf("data.loading", false)
        if (response) {
            this.invType = response.invType
            const listData = JSON.parse(response.billBodys)
            if (listData && Object.prototype.toString.call(listData) == "[object Array]") {
                listData.forEach(item => {
                    selectname.push(item.inventoryId)
                })
            }
            this.injections.reduce("load", response)
        }
        sessionStorage["inventoryNameList"] = selectname
        this.opstionList = await this.webapi.operation.findInventoryList({})
        this.renderSelectOptionInventory(this.opstionList, true)
    }
    mousedown = e => {
        const path = utils.path.findPathByEvent(e)
        if (this.metaAction.isFocus(path)) return
        if (path.indexOf("cell.cell") != -1) {
            this.focusCell(
                this.getCellInfo(path),
                path.indexOf("inventoryName") > -1 ? true : false
            )
        } else {
            if (!this.metaAction.focusByEvent(e)) return
            setTimeout(this.cellAutoFocus, 16)
        }
    }
    getCellInfo(path) {
        const parsedPath = utils.path.parsePath(path)
        const rowCount =
            (this.metaAction.gf("data.list") && this.metaAction.gf("data.list").size) || 0
        const colCount = 4
        // debugger
        var colKey = ""
        if (parsedPath.path.indexOf("inventoryName") > -1) {
            colKey = parsedPath.path
                .replace("root.children.table.columns.", "")
                .replace(".cell.cell", "")
                .replace("inventoryName.children.", "")
                .replace(/\s/g, "")
        } else {
            colKey = parsedPath.path
                .replace("root.children.table.columns.", "")
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
    focusCell(position, falg) {
        if (falg) {
            this.metaAction.sfs({
                "data.other.focusFieldPath": `root.children.table.columns.inventoryName.cell.cell.children.${
                    colKeys[position.x]
                },${position.y}`,
                "data.other.scrollToRow": position.y,
                "data.other.scrollToColumn": position.x,
            })
        } else {
            this.metaAction.sfs({
                "data.other.focusFieldPath": `root.children.table.columns.${
                    colKeys[position.x]
                }.cell.cell,${position.y}`,
                "data.other.scrollToRow": position.y,
                "data.other.scrollToColumn": position.x,
            })
        }
        setTimeout(this.cellAutoFocus, 16)
    }
    quantityFormat = (quantity, decimals, isFocus) => {
        if (quantity) {
            if (decimals == 6) return formatSixDecimal(quantity, decimals)
            return formatNumbe(quantity, decimals)
        } else {
            return utils.number.format(quantity) == 0 ? "" : utils.number.format(quantity)
        }
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
        this.injections.reduce("updateSfs", list, rowIndex)
    }
    getSelectOptionInventory = () => {
        return this.selectOptionInventory
    }

    //过滤行业
    filterIndustryInventory = (input, option) => {
        let flag = false
        option.props.children.forEach(item => {
            if (item.props.children.indexOf(input) >= 0) {
                flag = true
            }
        })
        return flag
    }
    calc = (col, rowIndex, rowData, params) => v => {
        const list = this.metaAction.gf("data.list").toJS() || []
        if (v.constructor == String) {
            v = transToNum(v)
        }
        list[rowIndex]["num"] = v
        list[rowIndex]["price"] = list[rowIndex]["ybbalance"] / list[rowIndex]["num"]
        let billBodyNum = 0
        list.forEach(item => {
            billBodyNum = item.num + billBodyNum
            item.num = formatSixDecimal(item.num)
            item.price = formatSixDecimal(item.price)
        })
        this.metaAction.sfs({
            "data.listAll.billBodyNum": formatSixDecimal(billBodyNum),
            "data.list": fromJS(list),
        })
    }

    onOk = async () => await this.save()

    onCancel = async () => {
        let cacheData =
            (this.metaAction.gf("data.cacheData") && this.metaAction.gf("data.cacheData").toJS()) ||
            []
        let list = (this.metaAction.gf("data.list") && this.metaAction.gf("data.list").toJS()) || []
        if (!isEquall(cacheData, list)) {
            const res = await this.metaAction.modal("confirm", {
                className: "haveData",
                content: `当前界面数据已改变，请确认是否先进行保存`,
            })
            if (res) return false
        }
        this.component.props.closeModal && this.component.props.closeModal()
    }

    save = async type => {
        if (!this.dateEditable()) {
            this.component.props.closeModal("save")
            return false
        }
        let list = (this.metaAction.gf("data.list") && this.metaAction.gf("data.list").toJS()) || []
        this.metaAction.sf("data.loading", true)
        let reqList = {
            serviceTypeCode: "",
            code: "",
            cdate: "",
            operater: "liucp",
            billBodys: "",
            type: this.type,
        }
        let form = (this.metaAction.gf("data.form") && this.metaAction.gf("data.form").toJS()) || {}
        let falg = true,
            flag = true
        list = list.filter(item => {
            if (item.inventoryCode) {
                item.taxRate = transToNum(item.taxRate)
                if (item.taxInclusiveAmount)
                    item.taxInclusiveAmount = transToNum(item.taxInclusiveAmount)
                if (item.cost) item.cost = transToNum(item.cost)
                if (item.fzUnitNum) item.fzUnitNum = transToNum(item.fzUnitNum)
                if (item.wbbalance) item.wbbalance = transToNum(item.wbbalance)
                if (item.ybbalance) item.ybbalance = transToNum(item.ybbalance)
                if (item.chBalance) item.chBalance = transToNum(item.chBalance)
                if (item.tax) item.tax = transToNum(item.tax)
                if (item.taxRate) item.taxRate = transToNum(item.taxRate)
                if (item.chNum) item.chNum = transToNum(item.chNum)
                if (item.num) item.num = transToNum(item.num)
                if (item.price) item.price = transToNum(item.price)

                if (!item.num) {
                    falg = false
                }
                if (item.price < 0) {
                    flag = false
                }
                return true
            } else {
                return false
            }
        })
        if (!falg) {
            this.metaAction.toast("error", "请填写数量")
            this.metaAction.sf("data.loading", false)
            return false
        }
        if (!flag) {
            this.metaAction.toast("error", "单价均不能为负数，请重新输入数量调整")
            this.metaAction.sf("data.loading", false)
            return false
        }
        reqList.id = this.id
        reqList.code = form.code
        reqList.cdate = form.cdate
        reqList.operater = form.operater
        reqList.billBodys = JSON.stringify(list)
        reqList.customerId = form.supplierId
        reqList.customerName = form.supplierName
        reqList.serviceTypeCode =
            this.metaAction.gf("data.title.titleName") == "采购入库单" ? "CGRK" : "XSCK"
        reqList.invType = this.invType
        let resp
        resp = await this.webapi.operation.updateBillTitle(reqList)
        this.metaAction.sf("data.loading", false)
        if (resp) {
            this.metaAction.toast("success", "保存成功")
            this.component.props.closeModal("save")
        } else {
            return false
        }
    }
    renderSelectOptionInventory = (data, falg) => {
        const arr = data.map(item => {
            return (
                <Option
                    width={200}
                    key={item.inventoryId}
                    value={item.inventoryCode}
                    title={
                        item.inventoryCode +
                        "  " +
                        item.inventoryName +
                        "  " +
                        item.inventoryGuiGe +
                        " " +
                        item.inventoryUnit
                    }>
                    <span className="selectSpanStyle">{item.inventoryCode}</span>
                    <span className="selectSpanStyle">{item.inventoryName}</span>
                    <span className="selectSpanStyle">{item.inventoryGuiGe}</span>
                    <span className="selectSpanStyle">{item.inventoryUnit}</span>
                </Option>
            )
        })
        this.selectOptionInventory = arr
        // this.metaAction.sf('data.other.key', Math.floor(Math.random() * 10000))
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
