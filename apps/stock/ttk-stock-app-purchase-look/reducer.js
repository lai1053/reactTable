import { Map, fromJS } from "immutable"
import { reducer as MetaReducer } from "edf-meta-engine"
import config from "./config"
import { getInitState } from "./data"
import utils from "edf-utils"
import moment from "moment"
import { formatNumbe } from "./../common"
import { formatSixDecimal } from "../commonAssets/js/common"

const blankDetail = {
    inventoryCode: "",
    inventoryName: "",
    inventoryGuiGe: "",
    fzUnitName: "",
    fzUnitNum: "",
    num: "",
    price: "",
    ybbalance: "",
    taxRate: "",
    tax: "",
    taxInclusiveAmount: "",
    accountName: "",
    remarks: "",
}
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, titleName, type, fromType) => {
        const initState = getInitState()
        initState.data.title.titleName = titleName
        if (titleName == "采购入库单") {
            initState.data.formList.rkriqi = "入库日期"
        } else {
            initState.data.formList.rkriqi = "出库日期"
        }
        // initState.data.flag = flag
        initState.data.type = type
        initState.data.fromType = fromType
        return this.metaReducer.init(state, initState)
    }

    load = (state, response) => {
        if (response) {
            let list = JSON.parse(response.billBodys) || []
            let billBodyNum = 0
            let billBodyYbBalance = 0
            let taxRateAll = 0
            let taxAll = 0
            let billBodyfzUnitNum = 0
            if (list) {
                list.forEach(item => {
                    if (item.taxRate != 0 && !item.taxRate) {
                        item.taxRate = ""
                        item.tax = ""
                    } else {
                        item.taxRate = formatNumbe(item.taxRate) + "%"
                        item.tax = utils.number.format(item.tax, 2)
                    }
                    item.taxInclusiveAmount = formatNumbe(
                        formatNumbe(item.tax) + formatNumbe(item.ybbalance),
                        2
                    )
                    billBodyNum = formatSixDecimal(formatNumbe(billBodyNum) + formatNumbe(item.num))
                    billBodyYbBalance = formatNumbe(
                        formatNumbe(billBodyYbBalance) + formatNumbe(item.ybbalance),
                        2
                    )
                    taxRateAll = formatNumbe(
                        formatNumbe(taxRateAll) +
                            formatNumbe(item.ybbalance) +
                            formatNumbe(item.tax),
                        2
                    )
                    taxAll = formatNumbe(formatNumbe(taxAll) + formatNumbe(item.tax), 2)
                    billBodyfzUnitNum = utils.number.format(
                        formatNumbe(billBodyfzUnitNum) + formatNumbe(item.fzUnitNum)
                    )
                })
            }
            while (list.length < 7) {
                list.push(blankDetail)
            }
            state = this.metaReducer.sf(state, "data.cacheData", fromJS(list))
            state = this.metaReducer.sf(state, "data.list", fromJS(list))
            state = this.metaReducer.sf(state, "data.listAll.billBodyfzUnitNum", billBodyfzUnitNum)
            state = this.metaReducer.sf(state, "data.listAll.billBodyNum", billBodyNum)
            state = this.metaReducer.sf(state, "data.listAll.billBodyYbBalance", billBodyYbBalance)
            state = this.metaReducer.sf(state, "data.listAll.taxRateAll", taxRateAll)
            state = this.metaReducer.sf(state, "data.listAll.taxAll", taxAll)
            response.billBodys = ""
            response.supplierName = response.supplierName
                ? response.supplierName
                : response.customerName
            state = this.metaReducer.sf(state, "data.form", fromJS(response))
        }

        return state
    }

    updateSfs = (state, options, id, btnClicklist) => {
        var list = this.metaReducer.gf(state, "data.list").toJS()
        if (options.length == 1) {
            list[id].inventoryId = options[0].inventoryId
            list[id].inventoryCode = options[0].inventoryCode
            list[id].inventoryName = options[0].inventoryName
            list[id].inventoryGuiGe = options[0].inventoryGuiGe
            list[id].fzUnitName = options[0].fzUnitName
            list[id].inventoryUnit = options[0].inventoryUnit
            let selectname = []
            list.forEach(item => {
                if (item.inventoryId) {
                    selectname.push(item.inventoryId)
                }
            })
            sessionStorage["inventoryNameList"] = selectname
            return this.metaReducer.sf(state, "data.list", fromJS(list))
        }
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}
