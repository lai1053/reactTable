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
    load = (state, res) => {        
        state = this.metaReducer.sf(state, 'data.form.assistFormOption', fromJS(res.auxGroupList))
        state = this.metaReducer.sf(state, 'data.form.subjectItem', fromJS(res.subjectItem))
        state = this.metaReducer.sf(state, 'data.form.isUsed', fromJS(res.isUsed))
        state = this.metaReducer.sf(state, 'data.form.calcDict', fromJS(res.findSubject.calcDict))
        state = this.metaReducer.sf(state, 'data.form.glAccount', fromJS(res.findSubject.glAccount))
        return state
    }
    tableLoading = (state, value) => {
        return this.metaReducer.sf(state, 'data.other.loading', value)
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({...option, metaReducer})
    return {...metaReducer, ...o}
}
