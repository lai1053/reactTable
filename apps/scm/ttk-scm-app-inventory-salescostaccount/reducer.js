import { Map } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

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
        if(res) {
            if(res.accountRatio) state = this.metaReducer.sf(state, 'data.accountRatio', res.accountRatio)
            state = this.metaReducer.sf(state, 'data.lastCalendar', res.paramValue)
            state = this.metaReducer.sf(state, 'data.mode', res.mode)
        }
        return state  
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}