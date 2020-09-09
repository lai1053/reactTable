import { Map } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import {fromJS, toJS} from 'immutable'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    initInfo=(state, period, isUnOpen, startPeriod)=>{
        state = this.metaReducer.sf(state, 'data.period', period) 
        state = this.metaReducer.sf(state, 'data.isUnOpen', isUnOpen) 
        state = this.metaReducer.sf(state, 'data.isVisible', true) 
        state = this.metaReducer.sf(state, 'data.startPeriod', startPeriod) 
        return state
    }

    modifyContent = (state) => {
        const content = this.metaReducer.gf(state, 'data.content')
        return this.metaReducer.sf(state, 'data.content', content + '!')
    }

    updateSfs = (state,option)=>{
        return this.metaReducer.sfs(state, option)
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