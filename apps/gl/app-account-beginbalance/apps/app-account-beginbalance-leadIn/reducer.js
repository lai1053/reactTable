import { fromJS } from 'immutable'
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

    // modifyContent = (state) => {
    //     const content = this.metaReducer.gf(state, 'data.content')
    //     return this.metaReducer.sf(state, 'data.content', content + '!')
    // }
    uploadFile = (state, value) => {
        state = this.metaReducer.sf(state, 'data.uploadFile', fromJS(value))
        state = this.metaReducer.sf(state, 'data.file', true)
        state = this.metaReducer.sf(state, 'data.fileName', fromJS(value.originalName))
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}