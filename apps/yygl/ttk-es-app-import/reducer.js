import {Map, List, fromJS} from 'immutable'
import {reducer as MetaReducer} from 'edf-meta-engine'
import {getInitState} from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state) => {
        return this.metaReducer.init(state, getInitState())
    }

    load = (state, option) => {
        return state
    }

    upload = (state, value) => {
        if (value){ state = this.metaReducer.sf(state, 'data.file', fromJS(value)) }
        state = this.metaReducer.sf(state, 'data.url', fromJS(''))
        return state
    }

    downUrl = (state, option) => {
        state = this.metaReducer.sf(state, 'data.url', fromJS(option.accessUrl))
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({...option, metaReducer})

    return {...metaReducer, ...o}
}