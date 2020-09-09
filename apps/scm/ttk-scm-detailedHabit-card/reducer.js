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
        if(option[0].id) {
            state = this.metaReducer.sf(state, 'data.id1', option[0].id)
            state = this.metaReducer.sf(state, 'data.ts1', option[0].ts)
        }
        if(option[1].id) {
            state = this.metaReducer.sf(state, 'data.id2', option[1].id)
            state = this.metaReducer.sf(state, 'data.ts2', option[1].ts)
        }
        if(option[0].mergeRule) {
            state = this.metaReducer.sf(state, 'data.form.mergeRule1', option[0].mergeRule)
        }
        if(option[1].mergeRule) {
            state = this.metaReducer.sf(state, 'data.form.mergeRule2', option[1].mergeRule)
        }
        return state  
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}