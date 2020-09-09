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
        state = this.metaReducer.sf(state, 'data.list', fromJS(response))
        //state = this.metaReducer.sf(state, 'data.pagination', fromJS(response.pagination))
        //state = this.metaReducer.sf(state, 'data.filter', fromJS(response.filter))
        return state
    }


    tableOnchange = (state, value) => {
        state = this.metaReducer.sf(state, 'data.list', fromJS(value))
        state = this.metaReducer.sf(state, 'data.key', Math.random())
        //state = this.metaReducer.sf(state, 'data.pagination', fromJS(response.pagination))
        //state = this.metaReducer.sf(state, 'data.filter', fromJS(response.filter))
        return state
    }

    sortReduce = (state, key, value) => {
        state = this.metaReducer.sf(state, `data.sort.${key}`, fromJS(value))
        state = this.metaReducer.sf(state, 'data.key', Math.random())
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}