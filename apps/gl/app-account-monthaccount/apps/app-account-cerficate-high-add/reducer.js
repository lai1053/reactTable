import { fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import { FormDecorator } from 'edf-component'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState(option)
        return this.metaReducer.init(state, initState)
    }

  	load = (state, value) => {
        // state = this.metaReducer.sf(state, 'data.accountingSubjects', fromJS(value.accountSubjects))
        // state = this.metaReducer.sf(state, 'data.findCost_ProfitAndLossAccounts', fromJS(value.findCost_ProfitAndLossAccounts))
      	return state
      }
    update = (state, list) => {
        // return this.metaReducer.sf(state, path, fromJS(value))
        return this.metaReducer.sf(state ,'data.list', fromJS(list))
    }  
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        voucherReducer = FormDecorator.reducerCreator({ ...option, metaReducer }),
        o = new reducer({ ...option, metaReducer, voucherReducer })

    return { ...metaReducer, ...o }
}
