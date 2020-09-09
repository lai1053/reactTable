import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import { blankDetail } from './data'
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
        this.voucherReducer = option.voucherReducer
    }

    init = (state, option) => {
        let initState = getInitState()
        return this.metaReducer.init(state, initState)
    }
    
    load = (state, res) => {
         state = this.metaReducer.sf(state, 'data.date', res.date)
         state = this.metaReducer.sf(state, 'data.amount', res.amount) 
         state = this.metaReducer.sf(state, 'data.productAmount', res.productAmount) 
        //  state = this.metaReducer.sf(state, 'data.amount', res.materialCost)
         state = this.metaReducer.sf(state, 'data.other.inventorys', fromJS(res.inventorys))
         state = this.metaReducer.sf(state, 'data.productionAccounting', res.productionAccounting)
         return state
    }

    addRowBefore = (state, gridName, rowIndex) => {
        return state
    }
    addRow = (state, gridName, rowIndex) => {
        let deatils = this.metaReducer.gf(state, 'data.form.details').toJS()
        deatils.splice(rowIndex, 0, blankDetail)
        state = this.metaReducer.sf(state, 'data.form.details', fromJS(deatils))
        return state
    }

    delRowBefore = (state, gridName, rowIndex) => {
        return state
    }
    delRow = (state, gridName, rowIndex) => {
        let details = this.metaReducer.gf(state, 'data.form.details').toJS(),
        error = this.metaReducer.gf(state, 'data.other.error').toJS()
        
        if (rowIndex > 6) {
            details.splice(rowIndex, 1)
        } else {

            if (details.length > 7) {
                details.splice(rowIndex, 1)
            } else {
                details.splice(rowIndex, 1, blankDetail)
            }
            // if (error[rowIndex] && error[rowIndex].quantity) {
            //     state = this.metaReducer.sf(state, `data.other.error.${rowIndex}.quantity`, false)
            // }
        }
        
        if (details[rowIndex] && details[rowIndex].errorQuantity) {
            details[rowIndex].errorQuantity = false
        }

        state = this.metaReducer.sf(state, 'data.form.details', fromJS(details))
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