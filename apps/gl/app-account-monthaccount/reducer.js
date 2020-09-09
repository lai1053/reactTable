import { fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import { consts } from 'edf-consts'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    load = (state, res) => {
        res.cerficateData.map(item => {
            item.checked = false
        })
        state = this.metaReducer.sf(state, 'data.monthList', fromJS(res.monthList))
        state = this.metaReducer.sf(state, 'data.dataList', fromJS(res.dataList))
        state = this.metaReducer.sf(state, 'data.finalRecord', fromJS(res.finalRecord))
        state = this.metaReducer.sf(state, 'data.list', fromJS(res.cerficateData))
        state = this.metaReducer.sf(state, 'data.isHasExchangeRate', fromJS(res.isHasExchangeRate))
        return state
    }
    setSelectYear = (state, res) => {
        state = this.metaReducer.sf(state, 'data.selectYear', fromJS(res))
        return state
    }

    account = (state, res, accountingStandards) => {
        if (accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization) {
            if (res.mecBalanceDto.mecBalanceDiffDtoList) {
                let mfgdzcItem = res.mecBalanceDto.mecBalanceDiffDtoList.find(o => o.accountCode1 == '1501')
                if (mfgdzcItem) {
                    mfgdzcItem.total = true
                }
            }
        } else {
            if (res.mecBalanceDto.mecBalanceDiffDtoList) {

                let gdzcItem = res.mecBalanceDto.mecBalanceDiffDtoList.find(o => o.accountCode1 == '1601'),
                    wxzcItem = res.mecBalanceDto.mecBalanceDiffDtoList.find(o => o.accountCode1 == '1701')
                if (gdzcItem) {
                    gdzcItem.total = true
                }
                if (wxzcItem) {
                    wxzcItem.total = true
                }
            }
        }

        state = this.metaReducer.sf(state, 'data.accountCheck', fromJS(res))
        if (consts.ACCOUNTINGSTANDARDS_nonProfitOrganization == accountingStandards) {
            if (res && res.profitLoss == 0) {
                state = this.metaReducer.sf(state, 'data.profitLossAccount', '净资产结转未完成，请处理')
            } else if (res && res.profitLoss == 1) {
                state = this.metaReducer.sf(state, 'data.profitLossAccount', '净资产结转已经完成')
            }
        } else {
            if (res && res.profitLoss == 0) {
                state = this.metaReducer.sf(state, 'data.profitLossAccount', '损益结转未完成，请处理')
            } else if (res && res.profitLoss == 1) {
                state = this.metaReducer.sf(state, 'data.profitLossAccount', '损益结转已经完成')
            }
        }

        return state
    }
    setActiveKey = (state, res) => {
        state = this.metaReducer.sf(state, 'data.activeKey', fromJS(res))
        return state
    }
    btnState = (state, res) => {
        state = this.metaReducer.sf(state, 'data.isBtnShow', fromJS(res.isBtnShow))
        state = this.metaReducer.sf(state, 'data.isAgainShow', fromJS(res.isAgainShow))
        state = this.metaReducer.sf(state, 'data.isAccountShow', fromJS(res.isAccountShow))
        state = this.metaReducer.sf(state, 'data.immediatelyAccountBtn', fromJS(res.immediatelyAccountBtn))
        return state
    }
    btnIsClickState = (state, { path, value }) => {
        state = this.metaReducer.sf(state, path, fromJS(value))
        return state
    }
    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}