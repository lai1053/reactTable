import { Map, fromJS, toJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import { getInitState } from './data'
import moment from 'moment'
import config from './config'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }

    updateArr = (state, arr) => {
        arr.forEach(item => {
            state = this.metaReducer.sf(state, item.path, fromJS(item.value))
        })
        return state
    }

    init = (state, option) => {
        const initState = getInitState(option)
        return this.metaReducer.init(state, initState)
    }

    load = (state, value) => {
        state = this.metaReducer.sf(state, 'data.list', fromJS(value.data))
        state = this.metaReducer.sf(state, 'data.pagination', fromJS(value.page))
        return state
    }

    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.loading', loading)
    }

    getEnableDate = (state, res) => {
        return this.metaReducer.sf(state, 'data.enableDate', moment(new Date(res)))
    }

    normalSearchChange = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }

    showOptionsChange = (state, {path, value}) => {
        return this.metaReducer.sf(state, path, value)
    }

    searchUpdate = (state, value) => {
        return this.metaReducer.sf(state, 'data.searchValue', fromJS(value))
    }

    initOption = (state, { currencyList , accountList, dataList}) => {
        state = this.metaReducer.sf(state, 'data.other.currencylist', fromJS(currencyList))
        state = this.metaReducer.sf(state, 'data.other.accountlist', fromJS(accountList))
        state = this.metaReducer.sf(state, 'data.list', fromJS(dataList.data))
        state = this.metaReducer.sf(state, 'data.pagination', fromJS(dataList.page))
        return state
    }

    tableOnchange = (state, value) => {
        state = this.metaReducer.sf(state, 'data.list', fromJS(value))
        return state
    }

    sortReduce = (state, key, value) => {
        state = this.metaReducer.sf(state, `data.sort.${key}`, fromJS(value))
        state = this.metaReducer.sf(state, 'data.key', Math.random())
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}
