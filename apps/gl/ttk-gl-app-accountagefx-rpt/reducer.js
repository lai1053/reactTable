import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import { number } from 'edf-utils'
import moment from 'moment'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState(option)
        return this.metaReducer.init(state, initState)
    }

    initLoadRpt = (state, value) => {
        if(value){
            if(value.dataList){
                state = this.metaReducer.sf(state, 'data.list', fromJS(this.formatDataList(value.dataList)))
            }
            state = this.metaReducer.sf(state, 'data.other.customerList', fromJS(value.customers))
            state = this.metaReducer.sf(state, 'data.other.enabledYM', moment(new Date(value.enabledYearMonth)))
        }
        
        state = this.tableLoading(state, false)
        return state
    }

    load = (state, value) => {
        if(value){
            if(value.dataList){
                state = this.metaReducer.sf(state, 'data.list', fromJS(this.formatDataList(value.dataList)))
            }
            if (value.customers) {
                state = this.metaReducer.sf(state, 'data.other.customerList', fromJS(value.customers))
            }
            state = this.metaReducer.sf(state, 'data.other.enabledYM', moment(new Date(value.enabledYearMonth)))
            state = this.tableLoading(state, false)
        }
        return state
    }

    onFieldChange = (state, path, value) => {
        return this.metaReducer.sf(state, 'data.other.id', value)
    }

    formatDataList = (dataList) => {
        
        let dataItem, isRetailZero = true

        for (var i = 0; i < dataList.length; i++) {
            dataItem = dataList[i]

            dataItem.balanceAmount = number.addThousPos(dataItem.balanceAmount, true, isRetailZero)
            dataItem.amount1 = number.addThousPos(dataItem.amount1, true, isRetailZero)
            dataItem.amount2 = number.addThousPos(dataItem.amount2, true, isRetailZero)
            dataItem.amount3 = number.addThousPos(dataItem.amount3, true, isRetailZero)
            dataItem.amount4 = number.addThousPos(dataItem.amount4, true, isRetailZero)
            dataItem.amount5 = number.addThousPos(dataItem.amount5, true, isRetailZero)
            dataItem.amount6 = number.addThousPos(dataItem.amount6, true, isRetailZero)

            dataList[i] = dataItem
        }

        return dataList
    }

    onFieldChange = (state, path, value) => {
        if (path.indexOf('date') > -1) {
            state = this.metaReducer.sf(state, 'data.other.startDate', value.startDate)
            state = this.metaReducer.sf(state, 'data.other.endDate', value.endDate)
        } else if (path.indexOf('select') > -1) {
            state = this.metaReducer.sf(state, 'data.other.id', value)
        } else if (path.indexOf('noBalanceNoDisplay') > -1) {
            state = this.metaReducer.sf(state, 'data.other.noBalanceNoDisplay', value)
        }

        return state
    }

    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.loading', loading)
    }
}
export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({...option, metaReducer })
    return {...metaReducer, ...o }
}
