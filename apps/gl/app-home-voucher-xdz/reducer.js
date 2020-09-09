import { Map, fromJS, toJS } from 'immutable'
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
        if(option.periodList){
            initState.data.periodList = option.periodList
            initState.data.certificateCount = option.certificateCount
            initState.data.period = option.period
            initState.data.isExpire = option.isExpire
        }else{
            initState.data.period = option.period
            initState.data.isExpire = option.isExpire
        }
        return this.metaReducer.init(state, initState)
    }

    load = (state, response) => {
        state = this.metaReducer.sfs(state, {
            'data.periodList': fromJS(response.periodList),
            'data.certificateCount': response.certificateCount
        })
        // state = this.metaReducer.sf(state, 'data.periodList', fromJS(response.periodList))
        // state = this.metaReducer.sf(state, 'data.certificateCount', response.certificateCount)
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}