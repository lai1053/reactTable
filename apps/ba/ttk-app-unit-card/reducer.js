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
        state = this.metaReducer.sfs(state, {
            'data.other.name': res.name,
            'data.other.oldItem': res,
            'data.other.edit': res ? true : false
        })
        if(res.auxiliaryUnitList && res.auxiliaryUnitList.length){
            state = this.metaReducer.sf(state, 'data.form.details', fromJS(res.auxiliaryUnitList))
        }else{
            state = this.metaReducer.sf(state, 'data.form.details', fromJS(blankDetail))
        }
        return state
    }

    addRowBefore = (state, gridName, rowIndex) => {
        return state
    }
    addRow = (state, gridName, rowIndex) => {
        let deatils = this.metaReducer.gf(state, 'data.form.details').toJS()
        deatils.splice(rowIndex, 0, blankDetail[0])
        state = this.metaReducer.sf(state, 'data.form.details', fromJS(deatils))
        return state
    }

    delRowBefore = (state, gridName, rowIndex) => {
        return state
    }
    delRow = (state, gridName, rowIndex) => {
        let details = this.metaReducer.gf(state, 'data.form.details').toJS()
        if (rowIndex > 0) {
            details.splice(rowIndex, 1)
        } else {
            if (details.length > 1) {
                details.splice(rowIndex, 1)
            } 
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