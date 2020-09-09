import { Map, List, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state) => {
        return this.metaReducer.init(state, getInitState())
    }

    load = (state, { defaultdate, enableddate, enableddateStart, enableddateEnd, flag }) => {
        return this.metaReducer.sfs(state, {
            'data.date': defaultdate,
            'data.dateString': defaultdate.format('YYYY-MM'),
            'data.enableddate': enableddate,
            'data.loading': false,
            'data.other.flag': flag,
            'data.enableddateStart': enableddateStart ? enableddateStart : undefined,
            'data.enableddateEnd': enableddateEnd ? enableddateEnd : undefined
        })
    }
    updateArr = (state, patch, option) => {
        return this.metaReducer.sf(state, patch, option);
    }
    dateChange = (state, date, dateString) => {
        return this.metaReducer.sfs(state, {
            'data.date': date,
            'data.dateString': dateString
        });
    }
    // accountDateChange=(state,date)=>{
    //     return this.metaReducer.sf(state, 'data.accountDate', date);
    // }
    loading = (state, res) => {
        return this.metaReducer.sf(state, 'data.loading', res);
    }
    updateTip = (state, res) => {
        return this.metaReducer.sf(state, 'data.other.tip', res);
    }

    updateState = (state, res) => {

        state = this.metaReducer.sfs(state, res)
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}