import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import extend from './extend'
import { fromJS } from 'immutable'
import utils from 'edf-utils'
import moment from 'moment'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.extendReducer = option.extendReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    initOption = (state, { inventoryPropertyOption, enableDate, oldDate }) => {
        if(inventoryPropertyOption){
            let newOption = []
            inventoryPropertyOption.map(item => {
                if(item.id == 1 || item.id == 2 || item.id == 3 || item.id == 4) newOption.push(item)
            })
            state = this.metaReducer.sf(state, 'data.other.inventoryPropertyOption', fromJS(newOption))
        }
        if(enableDate) state = this.metaReducer.sf(state, 'data.other.enableDate', fromJS(enableDate))

        const { enabledMonth, enabledYear, periodDate } = this.metaReducer.context.get('currentOrg') //获取全局的启用日期
        if(oldDate){
            state = this.metaReducer.sf(state, 'data.form.accountingPeriod', fromJS(oldDate))
        }else if(periodDate) {
            let a =  enableDate.replace('-',''), b = periodDate.replace('-',''), searchTime
            if(a < b){
                searchTime = periodDate
            }else{
                searchTime = enableDate
            }
            const date = utils.date.transformMomentDate(searchTime)
            state = this.metaReducer.sf(state, 'data.form.accountingPeriod', fromJS(date))
        }
        return state
    }

    modifyContent = (state) => {
        const content = this.metaReducer.gf(state, 'data.content')
        return this.metaReducer.sf(state, 'data.content', content + '!')
    }

    selectAll = (state, checked, gridName) => {
        state = this.extendReducer.gridReducer.selectAll(state, checked, gridName)
        return state
    }

    selectRow = (state, rowIndex, checked) => {
        state = this.metaReducer.sf(state, `data.list.${rowIndex}.selected`, checked)
        return state
    }
}
export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        extendReducer = extend.reducerCreator({...option, metaReducer}),
        o = new reducer({...option, metaReducer, extendReducer}),
        ret = {...metaReducer, ...extendReducer.gridReducer, ...o}

    return {...ret}
}