import { Map, fromJS } from 'immutable'
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

    initLoad = (state, parmas) => {
        state = this.metaReducer.sf(state, 'data.list', fromJS(parmas.list))
        state = this.metaReducer.sf(state, 'data.page', fromJS(parmas.page))
        state = this.metaReducer.sf(state, 'data.loading', parmas.loading)
        state = this.metaReducer.sf(state, 'data.gradeSetting', fromJS(parmas.gradeSetting))
        return state
    }

    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }

    loading = (state, path, value) => {
        return this.metaReducer.sf(state, path, value)
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}