import {Map, fromJS} from 'immutable'
import {reducer as MetaReducer} from 'edf-meta-engine'
import config from './config'
import {getInitState} from './data'
import { consts } from 'edf-consts'
import moment from 'moment'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }
    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }
    load = (state, res, queryUnMatchObj) => {
        state = this.metaReducer.sf(state, 'data.other.sucessinfos', fromJS(res))
        state = this.metaReducer.sf(state, 'data.other.errorDetails', queryUnMatchObj)
        return state
    }
}
export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({...option, metaReducer})
    return {...metaReducer, ...o}
}