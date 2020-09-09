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
    load = (state, res) => {
        if(res) {
            if(res.month < 10) res.month = `0${res.month}`
            state = this.metaReducer.sf(state, 'data.other.monthlyClosing', fromJS(`${res.year}-${res.month}`)) 
        }
        return state  
    }
    update = (state,path,value) => {
        state = this.metaReducer.sf(state, path, fromJS(value))  
        return state  
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}