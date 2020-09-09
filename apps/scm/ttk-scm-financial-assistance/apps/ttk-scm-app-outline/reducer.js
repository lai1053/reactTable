import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state, option) => {
        let initState = getInitState();
        return this.metaReducer.init(state, initState)
    }

    load = (state, { list }) => {
        if (list.length) list = this.getQueryList(list)
        state = this.metaReducer.sf(state, 'data.other.tableList', fromJS(list))
        return state
    }

    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}