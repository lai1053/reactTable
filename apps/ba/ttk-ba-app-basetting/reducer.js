import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {//初始化
        let initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    load = (state, res) => {
		if(res.accountEnableDto.currentAccount || res.accountEnableDto.currentAccount == 0) {
            state = this.metaReducer.sf(state, 'data.form.currentAccount', res.accountEnableDto.currentAccount)
            if(res.accountEnableDto.currentAccount == 1) {
                state = this.metaReducer.sf(state, 'data.other.flag', true)
            }
        }
        if(res.accountEnableDto.inventoryAccount || res.accountEnableDto.inventoryAccount == 0) {
            state = this.metaReducer.sf(state, 'data.form.inventoryAccount', res.accountEnableDto.inventoryAccount)
        }
        if(res.accountEnableDto.revenueAccount || res.accountEnableDto.revenueAccount == 0) {
            state = this.metaReducer.sf(state, 'data.form.revenueAccount', res.accountEnableDto.revenueAccount)
        }
        if(res.accountEnableDto.saleAccount || res.accountEnableDto.saleAccount == 0) {
            state = this.metaReducer.sf(state, 'data.form.saleAccount', res.accountEnableDto.saleAccount)
        }

        if(res.achivalRuleDto.accountSet || res.achivalRuleDto.accountSet == 0) {
            state = this.metaReducer.sf(state, 'data.achivalRuleDto.accountSet', res.achivalRuleDto.accountSet)
            if(res.achivalRuleDto.accountSet == 1) {
                state = this.metaReducer.sf(state, 'data.other.accountSetVisible', false)
            }
        }
        if(res.achivalRuleDto.supplierAccountSet || res.achivalRuleDto.supplierAccountSet == 0) {
            state = this.metaReducer.sf(state, 'data.achivalRuleDto.supplierAccountSet', res.achivalRuleDto.supplierAccountSet)
            if(res.achivalRuleDto.supplierAccountSet == 1) {
                state = this.metaReducer.sf(state, 'data.other.supplierAccountSetVisible', false)
            }
        }
        if(res.achivalRuleDto.customerUpperAccount) {
            state = this.metaReducer.sf(state, 'data.achivalRuleDto.customerUpperAccount', res.achivalRuleDto.customerUpperAccount)
        }
        if(res.achivalRuleDto.supplierUpperAccount) {
            state = this.metaReducer.sf(state, 'data.achivalRuleDto.supplierUpperAccount', res.achivalRuleDto.supplierUpperAccount)
        }

        if(res.accountEnableDto.id) {
            state = this.metaReducer.sf(state, 'data.form.id', res.accountEnableDto.id)
        }
        return state  
    }

	updateBatchByparamKey = (state, params) => {
		return state = this.metaReducer.sf(state, `data.${params.paramKey}`, params.paramValue);
	}

}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })
    return { ...metaReducer, ...o }
}
