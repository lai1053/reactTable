import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import moment from 'moment'
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }
    init = (state, option) => {
        const initState = getInitState(option)
        return this.metaReducer.init(state, initState)
    }    
    load = (state, value) => { 
        state = this.metaReducer.sf(state, 'data.list', value['details'])
        state = this.metaReducer.sf(state, 'data.totalNum', value['totalNum'])
        state = this.metaReducer.sf(state, 'data.pagination', fromJS(value['page']))
        return state
    }
    updateArr = (state, arr) => {
        arr.forEach(item => {
            state = this.metaReducer.sf(state, item.path, fromJS(item.value))
        })
        return state
    }
    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.loading', loading)
    }
}
export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({...option, metaReducer })
    return {...metaReducer, ...o }
}