import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, newslist) => {
        const initState = getInitState()
        return this.metaReducer.sf(state, 'data.newslist', fromJS(newslist))
        // return this.metaReducer.init(state, initState)
    }

    load = (state, newslist) => {
        return this.metaReducer.sf(state, 'data.newslist', fromJS(newslist))
    }


}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}