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
        let initState = getInitState()
        return this.metaReducer.init(state, initState)
    }
    load = (state, response) => {
        if (response) {
            if (response.profitLoss && response.profitLoss.length > 0) {
                let profitLoss = response.profitLoss
                let isExists1 = profitLoss.filter(x => x.profitLossType == 1)
                let array = [...profitLoss]
                if (isExists1 < 1) {
                    array = [{
                        accountId: null,
                        profitLossType: 1,
                        propertyName: "汇兑收益科目",
                    }, ...profitLoss]
                }
                let isExists2 = profitLoss.filter(x => x.profitLossType == 2)
                if (isExists2 < 1) {
                    array = [...profitLoss, {
                        accountId: null,
                        profitLossType: 2,
                        propertyName: "汇兑损失科目"
                    }]
                }
                state = this.metaReducer.sf(state, 'data.profitLossList', fromJS(array))
            }
            if (response.assetLiability && response.assetLiability.length > 0) {
                let assetLiability = response.assetLiability
                let isExists1 = assetLiability.filter(x => x.assetLiabilityType == 1)
                let array = [...assetLiability]
                if (isExists1 < 1) {
                    array = [{
                        accountId: null,
                        assetLiabilityType: 1,
                        orderNum: 1,
                        propertyName: "货币性资产"
                    }, ...assetLiability]
                }
                let isExists2 = assetLiability.filter(x => x.assetLiabilityType == 2)
                if (isExists2 < 1) {
                    array = [...assetLiability, {
                        accountId: null,
                        assetLiabilityType: 2,
                        orderNum: 1,
                        propertyName: "货币性负债"
                    }]
                }
                state = this.metaReducer.sf(state, 'data.assetLiabilityList', fromJS(this.sortList(array)))
            }
            if (response.profitLossList) {
                state = this.metaReducer.sf(state, 'data.other.profitLossAccountList', fromJS(response.profitLossList))
            }
            let details = fromJS(response.assetLiabilityList || [])
            if (details && details.size > 0) {
                const assetAccountList = details.filter(x => x.get('assetLiabilityType') == 1)
                const liabilitiesAccountList = details.filter(x => x.get('assetLiabilityType') == 2)
                state = this.metaReducer.sf(state, 'data.other.assetAccountList', assetAccountList)
                state = this.metaReducer.sf(state, 'data.other.liabilitiesAccountList', liabilitiesAccountList)
            }
        }
        return state
    }
    sortList = (list) => {
        if (list) {
            let i = 0, j = 0
            list.map((item, index) => {
                if (item.assetLiabilityType == 1) {
                    item.orderNum = ++i
                }
                if (item.assetLiabilityType == 2) {
                    item.orderNum = ++j
                }
            })
        }
        return list
    }
    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.other.loading', loading)
    }

    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }

    addRowBefore = (state, gridName, rowIndex) => {
        state = this.metaReducer.sf(state, 'data.other.btnDisabled', false)
        return state
    }

    delRowBefore = (state, gridName, rowIndex) => {
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        extendReducer = extend.reducerCreator({ ...option, metaReducer }),
        o = new reducer({ ...option, metaReducer, extendReducer })
    return { ...metaReducer, ...extendReducer.gridReducer, ...o }
}