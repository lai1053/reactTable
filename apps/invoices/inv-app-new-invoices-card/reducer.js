import {fromJS, Map} from 'immutable'
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

    modifyContent = (state) => {
        const content = this.metaReducer.gf(state, 'data.content')
        return this.metaReducer.sf(state, 'data.content', content + '!')
    }
    setStates = (state, option) => {
        return this.metaReducer.sfs(state, option)
    }
    setState = (state, field, value) => {
        return this.metaReducer.sf(state, field, value instanceof Object ? fromJS(value) : value)
    }
    //修改单条数据
    update = (state, path, v) => {
        return this.metaReducer.sf(state, path, fromJS(v))
    }
    
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}