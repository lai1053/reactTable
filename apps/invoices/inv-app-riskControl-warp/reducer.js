import { Map,fromJS } from 'immutable'
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
    
    load = (state, params) => {
        if (params.key == 'checkReport') {
            state = this.metaReducer.sf(state, 'data.url', fromJS(params.url))
        }else{
            state = this.metaReducer.sf(state, 'data.url', fromJS(''))
        }
        state = this.metaReducer.sf(state, 'data.urlData', fromJS(params))
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}