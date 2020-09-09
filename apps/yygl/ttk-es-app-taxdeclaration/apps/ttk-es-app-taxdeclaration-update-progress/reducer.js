import {reducer as MetaReducer} from 'edf-meta-engine'
import {Map, List, fromJS} from 'immutable'
import {getInitState} from './data'

class reducer{
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state) => {
        return this.metaReducer.init(state, getInitState())
    }
    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
	}
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({...option, metaReducer})

    return {...metaReducer, ...o}
}