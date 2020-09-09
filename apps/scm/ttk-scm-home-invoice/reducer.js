import { Map , fromJS} from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import { consts } from 'edf-consts'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        if (option) {
            initState.data = option
        }
        return this.metaReducer.init(state, initState)
    }
    load = (state, option) => {
        let smallScaleTaxPayer = consts.VATTAXPAYER_smallScaleTaxPayer,
            vatTaxpayer = this.metaReducer.context.get("currentOrg").vatTaxpayer
        state = this.metaReducer.sf(state, 'data.smallScaleTaxPayer', smallScaleTaxPayer)
        state = this.metaReducer.sf(state, 'data.vatTaxpayer', vatTaxpayer)
        state = this.metaReducer.sf(state, 'data.form.code', fromJS(option.code))
        state = this.metaReducer.sf(state, 'data.form.estimatedNegativeRate', fromJS(option.estimatedNegativeRate)) 
        state = this.metaReducer.sf(state, 'data.form.estimatedStressAddTax', fromJS(option.estimatedStressAddTax)) 
        state = this.metaReducer.sf(state, 'data.form.taxTotal', fromJS(option.taxTotal)) 
        state = this.metaReducer.sf(state, 'data.form.invoiceSum', fromJS(option.invoiceSum)) 
        if(option.sfl) {
            state = this.metaReducer.sf(state, 'data.form.sfl', fromJS(option.sfl)) 
        }else {
            state = this.metaReducer.sf(state, 'data.form.sflDisplay', false) 
        }
        state = this.metaReducer.sf(state, 'data.form.list', fromJS(option.list)) 
        state = this.metaReducer.sf(state, 'data.form.taxInclusiveAmountTotal', fromJS(option.taxInclusiveAmountTotal)) 
        // state = this.metaReducer.sf(state, 'data.form.textDisplay', true) 
        state = this.metaReducer.sf(state, 'data.form.date', fromJS(option.date)) 
        
        if(option.dateList) {
            state = this.metaReducer.sf(state, 'data.periodList', fromJS(option.dateList))
        }
        
        return state
    }

}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}