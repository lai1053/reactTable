import { Map, fromJS, toJS } from 'immutable'
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

    load = (state, response) => {
        state = this.metaReducer.sf(state, 'data.list', fromJS(response.list))
        state = this.metaReducer.sf(state, 'data.value', fromJS(response.value))
        state = this.metaReducer.sf(state, 'data.other', fromJS(response.other))

        return state
    }

    loadData = (state, response) => {
        state = this.metaReducer.sf(state, 'data.list', fromJS(response))
        return state
    }
    setData = (state, value) =>{
        state = this.metaReducer.sf(state, 'data.selectValue', fromJS(value.selectValue))
        state = this.metaReducer.sf(state, 'data.list', fromJS(value.list))
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}