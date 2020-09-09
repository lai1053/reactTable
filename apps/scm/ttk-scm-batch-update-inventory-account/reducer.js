import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import extend from './extend'
import { FormDecorator } from 'edf-component'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.voucherReducer = option.voucherReducer
    }

    init = (state, option) => {
        let initState = getInitState()
        return this.metaReducer.init(state, initState)
    }
    load = (state, option) => {

        return state
    }
    upDate = (state, option) => {
        return this.metaReducer.sf(state, option.path, fromJS(option.value))
    }

    upDateSfs = (state, arr) => {
        return this.metaReducer.sfs(state, arr);
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        extendReducer = extend.reducerCreator({ ...option, metaReducer }),
        voucherReducer = FormDecorator.reducerCreator({ ...option, metaReducer }),
        o = new reducer({ ...option, metaReducer, extendReducer, voucherReducer })

    return { ...metaReducer, ...extendReducer.gridReducer, ...o }
}