import { Map } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import { fromJS } from 'immutable'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        let initState = getInitState()
        if (option) {
            if (option.init !== undefined) {
                initState.data.init = option.init
            }
            if (option.value !== undefined) {
                initState.data.value = option.value
            }
            if (option.error !== undefined) {
                initState.data.error = option.error
            }
        }
        return this.metaReducer.init(state, initState)
    }
    load = (state, response) => {
        state = this.metaReducer.sf(state, 'data.spbmFilterList', fromJS(response))
        return this.metaReducer.sf(state, 'data.other.focusCellInfo', undefined)
    }
    modifyContent = (state) => {
        const content = this.metaReducer.gf(state, 'data.content')
        return this.metaReducer.sf(state, 'data.content', content + '!')
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}