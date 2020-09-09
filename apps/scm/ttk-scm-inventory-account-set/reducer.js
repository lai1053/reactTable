import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state, option) => {
        let initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    upDate = (state, option) => {
        return state = this.metaReducer.sf(state, option.path, fromJS(option.value))
    }

    upDateSfs = (state, value) => {
        return this.metaReducer.sfs(state, value);
    }

    setTableOption = (state, value) => {
		return this.metaReducer.sf(state, 'data.tableOption', fromJS(value))
	}
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}