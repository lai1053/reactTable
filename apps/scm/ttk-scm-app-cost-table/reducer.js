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
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    load = (state, response) => {
        state = this.metaReducer.sfs(state, {
            'data.other.tableList': fromJS(response.list || []),
            'data.other.inventoryTypes': fromJS(response.inventoryPropertyDtos || []),
            'data.other.businessDate': response.periodDate,
            'data.other.disabledTime': response.disabledTime,
		})
		return state
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