import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState(option)
        return this.metaReducer.init(state, initState)
    }

    // 初始化年列表
    initYearSelectView = (state, value) => {
        state = this.metaReducer.sf(state, 'data.yearList', fromJS(value))
        return state
    }
    // 初始化月列表
    initMonthSelectView = (state, value) => {
        state = this.metaReducer.sf(state, 'data.monthList', fromJS(value))
        return state
    }
   
    // 改变选中
    changeValue = (state, value, name) => {
        if (name == 'year') {
            state = this.metaReducer.sf(state, 'data.selectYear', value)
            return state
        } else if (name == 'month') {
            state = this.metaReducer.sf(state, 'data.selectMonth', value)
            return state
        }
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}