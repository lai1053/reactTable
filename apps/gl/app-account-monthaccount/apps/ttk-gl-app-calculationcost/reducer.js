import { fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import extend from './extend'
import config from './config'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.extendReducer = option.extendReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        if (option.businessType == 5000040005) {
            initState.data.other.spshow = `对应收入:0.00    结转比例:0%    结转成本总额为:0.00`
        } else if (option.businessType == 5000040026) {
            initState.data.other.spshow = `原材料本月科目余额:0.00    结转领料成本比例:0%    结转领料成本总额为:0.00`
        } else {
            initState.data.other.spshow = `销售成本结转比例:0%    本期销售收入:0.00    预计本期销售成本:0.00    生产成本余额:0.00    成本分配系数(预计本期销售成本/生产成本余额):0`
        }
        //结转方式
        initState.data.other.carryForwardMode = option.carryForwardMode
        initState.data.other.businessType = option.businessType
        initState.data.other.isEdit = option.isEdit
        return this.metaReducer.init(state, initState)
    }

    load = (state, response) => {
        if (response) {
            const list = response.list
            if (list) {
                state = this.metaReducer.sf(state, 'data.form.details', fromJS(list))
                state = this.metaReducer.sf(state, 'data.saveFilterList', fromJS(list))
                state = this.metaReducer.sf(state, 'data.other.btnDisabled', false)
                const inventoryList = list.filter(element => element.code != '账面金额' && element.code != '待分配金额').map(item => {
                    return {
                        label: `${item.code} ${item.name}`,
                        value: item.code
                    }
                })
                state = this.metaReducer.sf(state, 'data.other.inventoryList', fromJS(inventoryList))
            }
            if (response.spshow) {
                state = this.metaReducer.sf(state, 'data.other.spshow', response.spshow)
            }
            if (response.pickingType) {
                state = this.metaReducer.sf(state, 'data.other.pickingType', response.pickingType)
            }
            if (response.headList) {
                state = this.metaReducer.sf(state, 'data.other.headList', fromJS(response.headList))
            }
            let costTotalData = {
                proportion: response.proportion || 100,
                incomeAmountDouble: response.incomeAmountDouble || 0,//本期销售收入
                finishAmountDouble: response.finishAmountDouble || 0,//预计本期销售成本
                costAmountDouble: response.costAmountDouble || 0,//生产成本余额
                productProportion: response.productProportion || 0//成本分配系数(预计本期销售成本/生产成本余额)
            }
            state = this.metaReducer.sf(state, 'data.costTotalData', fromJS(costTotalData))
            state = this.metaReducer.sf(state, 'data.other.showPreAdd', response.showPreAdd)
        }
        return state
    }

    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }

    setTotalData = (state, value) => {
        state = this.metaReducer.sf(state, 'data.other.spshow', value)
        return state
    }

    sortReduce = (state, { key, value }) => {
        state = this.metaReducer.sf(state, `data.sortOrder.${key}`, fromJS(value))
        return state
    }
    updateDetails = (state, { details, newLists }) => {
        state = this.metaReducer.sf(state, 'data.form.details', fromJS(details))
        state = this.metaReducer.sf(state, 'data.saveFilterList', fromJS(newLists))
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        extendReducer = extend.reducerCreator({ ...option, metaReducer }),
        o = new reducer({ ...option, metaReducer, extendReducer })

    return { ...metaReducer, ...extendReducer.gridReducer, ...o }
}