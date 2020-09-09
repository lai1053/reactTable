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
        //初始化
        let initState = getInitState()
        return this.metaReducer.init(state, initState)
    }
    load = (state, value) => {
        state = this.metaReducer.sf(state, 'data.list', fromJS(value && value.auxDataList))  
        state = this.metaReducer.sf(state, 'data.other.showcode', fromJS(value && value.showcode))              
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