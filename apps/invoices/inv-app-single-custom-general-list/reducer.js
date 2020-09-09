import {fromJS, Map} from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import moment from 'moment'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    modifyContent = (state) => {
        const content = this.metaReducer.gf(state, 'data.content')
        return this.metaReducer.sf(state, 'data.content', content + '!')
    }
    load = (state, data) => {
        if (data && data.list) {
            const {list, skssq} = data
            state = this.metaReducer.sf(state, 'data.list', fromJS(list))
            if (skssq) {
                state = this.metaReducer.sf(state, 'data.nsqj', moment(skssq, 'YYYY-MM'))
            }
        }

        return state
    }
    tableLoading = (state, value) => {
        return this.metaReducer.sf(state, 'data.loading', value)
    }
    tableSettingVisible = (state, {value}) => {
        state = this.metaReducer.sf(state, 'data.showTableSetting', value)
        return state
    }
    setTableOption = (state, value) => {
        return this.metaReducer.sf(state, 'data.tableOption', fromJS(value))
    }

    update = (state, {path, value}) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}