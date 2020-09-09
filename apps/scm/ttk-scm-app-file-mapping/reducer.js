import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import extend from './extend'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.extendReducer = option.extendReducer
        this.config = config.current
    }

    init = (state, option) => {
        let initState = getInitState();
        return this.metaReducer.init(state, initState)
    }
    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }

    onTabChange = (state, key) => {
        return this.metaReducer.sf(state, 'data.other.activeKey', key);
    }

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