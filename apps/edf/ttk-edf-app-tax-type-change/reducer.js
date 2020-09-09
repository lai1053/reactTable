import {Map, List, fromJS} from 'immutable'
import {reducer as MetaReducer} from 'edf-meta-engine'
import config from './config'
import moment from 'moment'
import {getInitState} from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state, option) => this.metaReducer.init(state, getInitState(option))
    
    load = (state, option) => this.metaReducer.sf(state, 'data.form', fromJS(option))

    taxType = (state, option) => this.metaReducer.sf(state, 'data.form', fromJS(option))
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({...option, metaReducer})
    return {...metaReducer, ...o}
}
