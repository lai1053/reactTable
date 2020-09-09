import { List, Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

const DEFAULT_COL_COUNT = 3

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        // initState.data.list = option.result
        initState.data.customerList = option.customerList
        initState.data.saveData.customerList = option.customerList
        initState.data.type = option.type
        initState.data.dt = option.dt
        return this.metaReducer.init(state, initState)
    }

    updateObj = (state,obj) => {
        return this.metaReducer.sfs(state,obj)
    }

    updateSingle = (state,path,value) => {
        return this.metaReducer.sf(state,path,value)
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}
