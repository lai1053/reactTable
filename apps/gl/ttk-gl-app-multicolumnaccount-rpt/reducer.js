import { Map, fromJS, toJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import { getInitState} from './data'
import moment from 'moment'
import config from './config'
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }
    init = (state, option) => {
        const initState = getInitState(option)
        return this.metaReducer.init(state, initState)
    }
    
    load = (state, value) => {              
        if (value.page){
            state = this.metaReducer.sf(state, 'data.pagination', fromJS(value.page))
        }
        if (value.enableDate){
            state = this.metaReducer.sf(state, 'data.other.enabledDate', fromJS(value.enableDate))
        }
        if (value.accountList) {
            state = this.metaReducer.sf(state, 'data.other.accountList', fromJS(value.accountList))
        }
        if (value.secondList) {
            state = this.metaReducer.sf(state, 'data.other.accountOrAuxList', fromJS(value.secondList))
            state = this.metaReducer.sf(state, 'data.searchValue.secondCode', value.secondList[0].code) 
        }
        if (value.valueTypeList) {
            state = this.metaReducer.sf(state, 'data.other.typeList', fromJS(value.valueTypeList))
        }
        if (value.beginDate){          
            state = this.metaReducer.sf(state, 'data.searchValue.date_start', moment(new Date(value.beginDate)))
        }
        if (value.endDate){
            state = this.metaReducer.sf(state, 'data.searchValue.date_end', moment(new Date(value.endDate)))
        }
        
        return state
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
   
    tableLoading = (state, loading) => {
        return this.metaReducer.sf(state, 'data.loading', loading)
    } 

    searchUpdate = (state, value) => {
        return this.metaReducer.sf(state, 'data.searchValue', fromJS(value))
    } 
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })
    return { ...metaReducer, ...o }
}
