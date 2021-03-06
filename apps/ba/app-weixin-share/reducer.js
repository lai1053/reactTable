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
        state = this.metaReducer.sf(state, 'data.url', 'www.baidu.com')
        return this.metaReducer.init(state, initState)
    }
    load = (state, value) => {
       
        state = this.metaReducer.sf(state, 'data.url', value)
        return state
    }
   
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}