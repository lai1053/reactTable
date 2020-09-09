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

    saveData = (state, action) => {
        return this.metaReducer.sf(state, action.type, fromJS(action.data))
    }
    saveDatas = (state, action) => {
        let obj = {}
        action.type.forEach((el, i) => {
            obj[el] = fromJS(action.data[i])
        })
        return this.metaReducer.sfs(state, obj)
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}