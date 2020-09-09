import { Map, fromJS, toJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import { getInitState } from './data'
import moment from 'moment'
import extend from './extend'
import config from './config'


class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.extendReducer = option.extendReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    updateArr = (state, arr) => {
        arr.map(item => {
            state = this.metaReducer.sf(state, item.path, fromJS(item.value))
        })
        return state
    }

    selectAll = (state, checked, gridName) => {
        state = this.extendReducer.gridReducer.selectAll(state, checked, gridName)
        return state
    }

    selectRow = (state, rowIndex, checked) => {
        state = this.metaReducer.sf(state, `data.list.${rowIndex}.selected`, checked)
        return state
    }

    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
	}
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        extendReducer = extend.reducerCreator({...option, metaReducer}),
        o = new reducer({...option, metaReducer, extendReducer}),
        ret = {...metaReducer, ...extendReducer.gridReducer, ...o}

    return {...ret}
}