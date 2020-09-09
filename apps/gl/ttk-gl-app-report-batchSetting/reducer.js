import { Map } from 'immutable'
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

    updateSingle = (state, option) => {
        state = this.metaReducer.sf(state, 'data.other.reClassType', option.reClassType)
        state = this.metaReducer.sf(state, 'data.other.dataSource', option.dataSource)
        state = this.metaReducer.sf(state, 'data.other.unShieldCashFlowStatement', option.unShieldCashFlowStatement)
        state = this.metaReducer.sf(state, 'data.other.needCashFlowStatement', option.needCashFlowStatement?option.needCashFlowStatement.toString():'false')
        state = this.metaReducer.sf(state, 'data.other.showValueType', option.showValueType)
        state = this.metaReducer.sf(state, 'data.other.tab1', option.tab1)
        state = this.metaReducer.sf(state, 'data.other.tab2', option.tab2)
        state = this.metaReducer.sf(state, 'data.other.valueType', option.valueType)
        return state
    }

}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}