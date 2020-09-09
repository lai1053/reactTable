import { Map, fromJS, toJS, is } from 'immutable'
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

    setState = (state, field, value) => {
        if (field) {
            return this.metaReducer.sf(state, field, (value instanceof Object) ? fromJS(value) : value)
        }
        return;
        // const content = this.metaReducer.gf(state, 'data.content')
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}