import { Map, fromJS } from "immutable"
import { reducer as MetaReducer } from "edf-meta-engine"
import config from "./config"
import { getInitState, blankDetail } from "./data"
import moment from "moment"
import extend from "./extend"
import { FormDecorator } from "edf-component"
import { formatNumbe, deepClone } from "./../common"
import { SSL_OP_SINGLE_DH_USE } from "constants"
import { formatSixDecimal } from "../commonAssets/js/common"
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
        this.voucherReducer = option.voucherReducer
    }

    init = (
        state,
        option,
        type,
        id,
        inventoryArr,
        financeAuditor,
        voucherIds,
        isReadonly,
        checkOutType,
        hideButton
    ) => {
        const initState = getInitState()
        initState.data.formList.titleName = option
        // initState.data.selectOptionList = JSON.stringify(data);
        if (option == "采购入库单") {
            this.formType = "ck"
            initState.data.formList.rkriqi = "入库日期"
        } else {
            this.formType = ""
            initState.data.formList.rkriqi = "出库日期"
        }
        // initState.data.form.operater = sessionStorage['username']
        this.financeAuditor = financeAuditor
        initState.data.form.operater = financeAuditor || ""
        this.type = initState.data.type = type
        this.id = id
        initState.data.id = id
        voucherIds && (initState.data.voucherIds = voucherIds)
        this.isReadonly = null
        isReadonly && (this.isReadonly = isReadonly) && (initState.data.isReadonly = isReadonly)
        this.inventoryArr = inventoryArr
        this.checkOutType = checkOutType
        hideButton && (initState.data.hideButton = hideButton)
        return this.metaReducer.init(state, initState)
    }

    // 针对全月加权或移动加权的 '生成' 这个类型的单据
    forSpecialGenerate = () => {
        return (this.checkOutType == 0 || this.checkOutType == 1) && this.type == 0
    }

    load = (state, response) => {
        let list = JSON.parse(response.billBodys)
        if (list) {
            list.forEach((item, idx) => {
                item.detailId = item.id
                item.accountName = item.accountName
                item.accountId = item.accountId
                item.amount = formatSixDecimal(formatNumbe(item.ybbalance))
                item.quantity = formatNumbe(item.num)
                item.name = item.inventoryName
                item.id = item.inventoryId
                item.code = item.inventoryCode
                item.unit = item.inventoryUnit
                item.guige = item.inventoryGuiGe
                item.taxRateName = formatNumbe(item.taxRate) + "%"
                item.taxRate = formatNumbe(item.taxRate) / 100
                item.taxInclusiveAmount = formatNumbe(
                    formatNumbe(item.tax) + formatNumbe(item.ybbalance),
                    2
                )
            })
        }
        let oldList = deepClone(list)
        response.details = list
        //如果行数太少,则用空行补足
        if (response.details) {
            while (response.details.length < 7) {
                response.details.push(blankDetail)
            }
        }
        response.cacheData = response.details
        response.supplierName = response.supplierName
            ? response.supplierName
            : response.customerName
        response.operater = (response.id && response.operater) || this.financeAuditor
        state = this.metaReducer.sf(state, "data.oldList", fromJS(oldList))
        return this.metaReducer.sf(state, "data.form", fromJS(response))
    }
    updateSfs2 = (state, options) => {
        return this.metaReducer.sfs(state, options)
    }

    // screen = (inventoryArr, list) => {
    //     list.forEach((v, idx) => {
    //         let index = inventoryArr.findIndex((item) => {return v.id === item.inventoryId})
    //         if (index !== -1) {
    //             v.qmNum = inventoryArr[index].qmNum
    //             if (this.newAdd) v.price = inventoryArr[index].qmPrice
    //         } else {
    //             v.qmNum = 0
    //         }
    //     })
    // }

    // 不能选择相同的存货
    canNotSelectSameInventory = arr => {
        let selectname = []
        arr.forEach(item => {
            if (item.id) {
                selectname.push(item.id)
            }
        })
        sessionStorage["inventoryNameList"] = selectname
    }

    updateSfs = (state, options, id, btnClicklist) => {
        var list = this.metaReducer.gf(state, "data.form.details").toJS()
        let listdata = []
        if (options.length == 1) {
            if (btnClicklist === "btnClicklist") {
                let flag
                let haveFirst = id > 0 ? true : false
                if (haveFirst) flag = list[id - 1].code
                if (!flag) {
                    listdata = list.filter(f => f.code)
                    options[0].id = options[0].inventoryId
                    options[0].code = options[0].inventoryCode
                    options[0].name = options[0].inventoryName
                    options[0].guige = options[0].inventoryGuiGe
                    options[0].unit = options[0].inventoryUnit
                    options[0].taxInclusiveAmount = ""
                    var obj = listdata.concat(options)
                    // 已选的存货名称选项
                    if (this.checkOutType === 3) this.canNotSelectSameInventory(obj)
                    // this.screen(this.inventoryArr, obj)
                    while (obj.length < 7) {
                        obj.push(blankDetail)
                    }
                    return this.metaReducer.sf(state, "data.form.details", fromJS(obj))
                }
            }
            // 修改当前行存货名称的情况
            list[id].id = options[0].inventoryId
            list[id].code = options[0].inventoryCode
            list[id].name = options[0].inventoryName
            list[id].guige = options[0].inventoryGuiGe
            list[id].unit = options[0].inventoryUnit
            // list[id].price = options[0].price
            list[id].placeholder = options[0].placeholder
            list[id].stockNum = options[0].stockNum
            if (this.checkOutType == 3) {
                list[id].amount = options[0].amount
                list[id].price = options[0].price
                list[id].quantity = options[0].quantity
            } else {
                if (list[id].price) {
                    // 非先进先出在当前有数据的明细修改存货名称将该明细后三项相应清空
                    list[id].amount = ""
                    list[id].quantity = ""
                }
                list[id].price = options[0].price
            }
            if (this.formType) {
                list[id].accountId = options[0].accountId
                list[id].accountName = options[0].accountName
            }
            // 已选的存货名称选项
            if (this.checkOutType === 3) this.canNotSelectSameInventory(list)
            // sessionStorage['inventoryNameList'] = selectname
            return this.metaReducer.sf(state, "data.form.details", fromJS(list))
        } else {
            listdata = list.filter(f => f.code)
            options.forEach(item => {
                item.id = item.inventoryId
                item.code = item.inventoryCode
                item.name = item.inventoryName
                item.guige = item.inventoryGuiGe
                item.unit = item.inventoryUnit
                item.taxInclusiveAmount = ""
                if (!this.formType) {
                    item.accountId = ""
                    item.accountName = ""
                }
            })
            var obj = listdata.concat(options)
            // 已选的存货名称选项
            if (this.checkOutType === 3) this.canNotSelectSameInventory(obj)
            while (obj.length < 7) {
                obj.push(blankDetail)
            }
            return this.metaReducer.sf(state, "data.form.details", fromJS(obj))
        }
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
            while (list.length < 7) {
                list.push(blankDetail)
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
