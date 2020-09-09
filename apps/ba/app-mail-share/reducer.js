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
    load = (state, value, name) => {
        
        state = this.metaReducer.sf(state, 'data.form.url', fromJS(value.url))
        state = this.metaReducer.sf(state, 'data.form.urlName', fromJS(name))
        state = this.metaReducer.sf(state, 'data.form.periodName', fromJS(value.period))
        state = this.metaReducer.sf(state, 'data.form.fileHref', `${location.origin}/share-oss${value.url}`)
        state = this.metaReducer.sf(state, 'data.form.search', fromJS(value.params))
        return state
    }

}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}