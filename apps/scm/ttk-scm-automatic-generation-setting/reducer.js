import { Map, List, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import moment from 'moment'
import { moment as momentUtil } from 'edf-utils'
import { getInitState } from './data'
import { consts } from 'edf-consts'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state) => {
        return this.metaReducer.init(state, getInitState())
    }

    load = (state, option) => {
        return this.metaReducer.sfs(state, option);
    }

    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}