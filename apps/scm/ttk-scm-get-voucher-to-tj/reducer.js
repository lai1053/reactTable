import { Map, List, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import moment from 'moment'
import { moment as momentUtil } from 'edf-utils'
import { getInitState } from './data'
import { consts } from 'edf-consts'
import extend from './extend'
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.extendReducer = option.extendReducer
        this.config = config.current
    }

    init = (state, option) => {

        return this.metaReducer.init(state, getInitState(option))
    }
    load = (state, arr) => {
        return this.metaReducer.sfs(state, arr)
    }
    upDate = (state, option) => {
        return state = this.metaReducer.sf(state, option.path, fromJS(option.value))
    }
    sfs = (state, option) => {
        return this.metaReducer.sfs(state, option)
    }
    // selectAll = (state, checked, gridName) => {

    //     state = this.extendReducer.gridReducer.selectAll(state, checked, gridName)
    //     return state
    // }

    selectRow = (state, rowIndex, path, checked) => {
        state = this.metaReducer.sf(state, `${path}.${rowIndex}.selected`, checked)
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        extendReducer = extend.reducerCreator({ ...option, metaReducer }),
        o = new reducer({ ...option, metaReducer, extendReducer }),
        ret = { ...metaReducer, ...extendReducer.gridReducer, ...o }

    return { ...ret }
}


