import { Map, fromJS } from "immutable"
import { reducer as MetaReducer } from "edf-meta-engine"
import config from "./config"
import { getInitState, blankDetail } from "./data"
import utils from "edf-utils"
import moment from "moment"
import extend from "./extend"
import { FormDecorator } from "edf-component"
import { formatNumbe } from "./../common"
import { SSL_OP_SINGLE_DH_USE } from "constants"
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
        this.voucherReducer = option.voucherReducer
    }

    init = (state, option, type, data) => {
        const initState = getInitState()
        initState.data.formList.titleName = option
        // initState.data.selectOptionList = JSON.stringify(data);
        if (option == "采购入库单") {
            this.type = "ck"
            initState.data.formList.rkriqi = "入库日期"
        } else {
            this.type = ""
            initState.data.formList.rkriqi = "出库日期"
        }
        initState.data.form.operater = sessionStorage["username"]
        initState.data.type = type
        return this.metaReducer.init(state, initState)
    }

    load = (state, response, acList, tacList) => {
        let list = JSON.parse(response.billBodys)
        if (list) {
            list.forEach((item, index) => {
                item.key = index
                item.accountName = item.accountName
                item.accountId = item.accountId
                item.amount = formatNumbe(item.ybbalance)
                item.quantity = formatNumbe(item.num)
                item.name = item.inventoryName
                item.id = item.inventoryId
                item.code = item.inventoryCode
                item.unit = item.inventoryUnit
                item.guige = item.inventoryGuiGe
                if (item.taxRate != 0 && !item.taxRate) {
                    item.taxRateName = ""
                    item.taxRate = ""
                    item.tax = ""
                } else {
                    item.taxRateName = formatNumbe(item.taxRate) + "%"
                    item.taxRate = formatNumbe(item.taxRate) / 100
                    item.tax = utils.number.format(item.tax, 2)
                }
                item.taxInclusiveAmount = formatNumbe(
                    formatNumbe(item.tax) + formatNumbe(item.ybbalance),
                    2
                )
            })
        }
        response.details = list

        //如果行数太少,则用空行补足
        if (response.details) {
            while (response.details.length < 7) {
                response.details.push({ ...blankDetail, key: response.details.length })
            }
        }
        response.cacheData = response.details
        response.supplierName = response.supplierName
            ? response.supplierName
            : response.customerName

        let obj = {
            "data.form": fromJS(response),
            "data.form.accountList": acList,
            "data.loading": false,
            "data.isEdit": "readonly",
        }

        if (tacList && Object.prototype.toString.call(tacList) === "[object Object]") {
            obj = Object.assign({}, obj, { "data.form.tableAccountList": tacList })
        }
        state = this.metaReducer.sfs(state, obj)
        return state // this.metaReducer.sf(state, 'data.form', fromJS(response))
    }
    updateSfs2 = (state, options) => {
        return this.metaReducer.sfs(state, options)
    }
    updateSfs = (state, options, id, btnClicklist) => {
        // 共有两种场景：1、btnClicklist有值时，将选择的内容，追加到空行；2、btnClicklist无值时，将当前id行内容，用选择内容替换
        let list = this.metaReducer.gf(state, "data.form.details").toJS()
        let listdata = []
        if (btnClicklist === "btnClicklist") {
            let dataLen = list.length
            let oldDataLen = list.filter(f => f.code).length
            let newDataLen = options.length + oldDataLen
            let maxKey = Math.max(...list.map(m => m.key || 0)) + 1
            let optIndex = 0
            let resultData = []
                .concat(list)
                .concat(dataLen > newDataLen ? [] : new Array(newDataLen - dataLen).fill({}))
            resultData.forEach(d => {
                const item = { ...d }
                if (item.key === undefined) {
                    item.key = maxKey
                    maxKey++
                }
                if (!item.code && options[optIndex]) {
                    item.id = options[optIndex].inventoryId
                    item.code = options[optIndex].inventoryCode
                    item.name = options[optIndex].inventoryName
                    item.guige = options[optIndex].inventoryGuiGe
                    item.unit = options[optIndex].inventoryUnit
                    if (this.type) {
                        item.accountId = options[optIndex].accountId
                        item.accountName = options[optIndex].accountName
                    }
                    optIndex++
                }
                listdata.push(item)
            })
        } else if (list[id] && options[0]) {
            list[id].id = options[0].inventoryId
            list[id].code = options[0].inventoryCode
            list[id].name = options[0].inventoryName
            list[id].guige = options[0].inventoryGuiGe
            list[id].unit = options[0].inventoryUnit
            if (this.type) {
                list[id].accountId = options[0].accountId
                list[id].accountName = options[0].accountName
            }
            listdata = list
        }
        return this.metaReducer.sf(state, "data.form.details", fromJS([].concat(listdata)))
    }
    addEmptyRow = (state, rowIndex) => {
        var list = this.metaReducer.gf(state, "data.form.details")
        list = list.insert(
            rowIndex,
            Map({
                id: list.size,
            })
        )
        return this.metaReducer.sf(state, "data.form.details", list)
    }
    addRowBefore = (state, gridName, rowIndex) => {
        state = this.metaReducer.sf(state, "data.other.isSaveSuccess", false)
        return state
    }

    delRowBefore = (state, gridName, rowIndex) => {
        // debugger
        state = this.metaReducer.sf(state, "data.other.isSaveSuccess", false)
        return state
    }

    delect = (state, id) => {
        // debugger
        var list = this.metaReducer.gf(state, "data.form.details").toJS()
        list.splice(id, 1)
        if (list) {
            // const details = this.metaReducer.gf(state, 'data.form.details').toJS()
            let maxKey = Math.max(...list.map(m => m.key || 0)) + 1
            while (list.length < 7) {
                list.push({ ...blankDetail, key: maxKey })
                maxKey++
            }
        }
        return this.metaReducer.sf(state, "data.form.details", fromJS(list))
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        extendReducer = extend.reducerCreator({ ...option, metaReducer }),
        voucherReducer = FormDecorator.reducerCreator({ ...option, metaReducer }),
        o = new reducer({ ...option, metaReducer, extendReducer, voucherReducer })

    return { ...metaReducer, ...extendReducer.gridReducer, ...o }
}
