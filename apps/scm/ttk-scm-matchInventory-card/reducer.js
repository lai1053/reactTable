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
    load = (state, option) => {
        if(option) {
            option.map(item=>{
                item.name = null
                item.inventoryId = null
            })
            state = this.metaReducer.sf(state, 'data.form.details', fromJS(option))
        }
        return state  
    }
    upDate = (state,option) => {
        return state = this.metaReducer.sf(state, option.path, fromJS(option.value))
    }
    upDates = (state,value) => {
        return state = this.metaReducer.sfs(state, {
            'data.other.dateHabit': fromJS(value[0]),
            'data.form.dateHabitId': fromJS(value[1])
        })
    }
    addRowBefore = (state, gridName, rowIndex) => {
		return state
    }
    
    delRowBefore = (state, gridName, rowIndex) => {
		return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}