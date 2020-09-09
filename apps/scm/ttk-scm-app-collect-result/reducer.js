import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import utils from 'edf-utils'
import config from './config'
import { getInitState } from './data'
import changeToOption from './utils/changeToOption'
import moment from 'moment'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, { dateVisible, vatOrEntry }) => {
        const initState = getInitState()
        initState.data.dateVisible = dateVisible
        initState.data.vatOrEntry = vatOrEntry
        return this.metaReducer.init(state, initState)
    }
    load = (state, { res, puArrivalAuthenticat }) => {
        state = this.metaReducer.sfs(state,
            {
                'data.list': fromJS(res),
                'data.loading': false,
                'data.tableKey': Math.random(),
                'data.puArrivalAuthenticat': puArrivalAuthenticat ? fromJS(puArrivalAuthenticat) : fromJS({
                    amountAndTaxTotal:0,
                    amountTotal:0,
                    authenticatSum:0,
                    taxTotal: 0,
                })
            }
        );
        return state
    }
    //改变日期
    dateChange = (state, date) => {
        return this.metaReducer.sf(state, 'data.date', date);
    }

    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.loading', loading)
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

    searchUpdate = (state, value) => {
        return this.metaReducer.sf(state, 'data.searchValue', fromJS(value))
    }

    tableOnchange = (state, value) => {
        state = this.metaReducer.sf(state, 'data.list', fromJS(value))
        state = this.metaReducer.sf(state, 'data.key', Math.random())
        //state = this.metaReducer.sf(state, 'data.pagination', fromJS(response.pagination))
        //state = this.metaReducer.sf(state, 'data.filter', fromJS(response.filter))
        return state
    }
    setTableScroll = (state, value) => {
        let tableOption = { x: 1090, y: value }
        state = this.metaReducer.sf(state, 'data.tableOption', fromJS(tableOption))
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
