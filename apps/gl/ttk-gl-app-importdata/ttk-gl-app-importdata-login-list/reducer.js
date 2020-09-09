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
        let initState = getInitState();
        Object.assign(initState.data.form, option)
        initState.data.other.version = option.version
        return this.metaReducer.init(state, initState)
    }
    load = (state,reqlist,createTask) => {       
        state = this.metaReducer.sf(state, 'data.list', fromJS(createTask))
        state = this.metaReducer.sf(state, 'data.selectTimeTitle', fromJS(reqlist.softName))
        return state
    } 
    tableLoading = (state, value) => {
        return this.metaReducer.sf(state, 'data.other.loading', value)
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })
    return { ...metaReducer, ...o }
}