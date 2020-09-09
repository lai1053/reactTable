import { Map ,fromJS,toJS} from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        let initState = getInitState()
        if (option.periodList) {
            initState.data.periodList = option.periodList
            initState.data.other.emptyData= option.emptyData
            initState.data.period = option.period
            initState.data.type = 'chart'
        }else{
            initState.data.other.emptyData = option.emptyData
            initState.data.period = option.period
            initState.data.type = 'chart'
        }
        return this.metaReducer.init(state, initState)
    }
    load = (state, response) => {
        state = this.metaReducer.sf(state, 'data.periodList', fromJS(response.periodList))
        return state
    }
    setData = (state ,response) => {
        state = this.metaReducer.sf(state, 'data.list', fromJS(response.data))
        state = this.metaReducer.sf(state, 'data.tableSource', fromJS(response.tableSource))
       
        return state
    }

}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}