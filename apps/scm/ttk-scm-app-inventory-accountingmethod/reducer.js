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
            let type = 'toSellProducts'
            if(res.productionAccounting === '0') type = 'traditional'
            if(res.productionAccounting == 3 && res.mode == 3 ) type = 'costIncomeRatio'
            if(res.mode == 4 ) type = 'costSaleRatio'
            state = this.metaReducer.sf(state, 'data.type', type) 
            state = this.metaReducer.sf(state, 'data.other.type', res.mode) 
            
            state = this.metaReducer.sf(state, 'data.productionAccounting', res.productionAccounting)
            state = this.metaReducer.sf(state, 'data.date', res.lastDayOfUnEndingClosingCalendar.slice(0,10))
            state = this.metaReducer.sf(state, 'data.lastDay', res.lastDayOfUnEndingClosingCalendar.slice(0,10))
            state = this.metaReducer.sf(state, 'data.date1', '')
            if(res.periodBeginDate) state = this.metaReducer.sf(state, 'data.periodBeginDate', res.periodBeginDate)
            state = this.metaReducer.sf(state, 'data.paramValue', res.paramValue)

            const accountRatio = res.accountRatio ? Number(res.accountRatio).toFixed(2) : '100.00'
            state = this.metaReducer.sf(state, 'data.accountRatio', `${accountRatio}%`)
        }
        return state  
    }

    update = (state, { path, value }) => {
        state = this.metaReducer.sf(state, path, fromJS(value))  
        return state  
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}