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
    load = (state, option) => {
        state = this.metaReducer.sf(state, 'data.printOption.startDate', option.startDate)
        state = this.metaReducer.sf(state, 'data.printOption.endDate', option.endDate)
        state = this.metaReducer.sf(state, 'data.enableDate', option.enabledPeriod) 
        return state
    }
    updateState = (state, arr) => {
        arr.forEach(item => {
            state = this.metaReducer.sf(state, item.path, item.value)
        })
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })
    return { ...metaReducer, ...o }
}