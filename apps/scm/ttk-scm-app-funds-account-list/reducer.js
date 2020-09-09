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
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    load = (state, option) => {
        return this.metaReducer.sf(state, 'data', fromJS(option))
    }
    // modifyContent = (state) => {
    //     const content = this.metaReducer.gf(state, 'data.content')
    //     return this.metaReducer.sf(state, 'data.content', content + '!')
    // }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}