import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state, option) => {
        let initState = getInitState()
        return this.metaReducer.init(state, initState)
    }
    load = (state, option) => {
        const { res: { achivalRuleDto: { id, ts, accountSet }, invoiceInventoryList }, inventory } = option;
        state = this.metaReducer.sfs(state, {
            'data.form.id': id,
            'data.form.ts': ts,
            'data.form.accountSet': accountSet,
            'data.form.details': fromJS(invoiceInventoryList),
            'data.other.inventory': fromJS(inventory)
        })
        return state
    }
    upDate = (state, option) => {
        return state = this.metaReducer.sf(state, option.path, fromJS(option.value))
    }
    upDateSfs = (state, value) => {
        return this.metaReducer.sfs(state, value);
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}