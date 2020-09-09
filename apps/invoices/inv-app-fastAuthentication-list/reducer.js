import { Map,fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }
    setTableOption = (state, value) => {
    return this.metaReducer.sf(state, 'data.tableOption', fromJS(value))
  }
    modifyContent = (state) => {
        const content = this.metaReducer.gf(state, 'data.content')
        return this.metaReducer.sf(state, 'data.content', content + '!')
    }
    
    initInvoiceInfo = (state,field,value) =>{
    if(value){
      state = this.metaReducer.sf(state,field,fromJS(value))
    }
    return state
  }
  
    tableOption=(state,options)=>{

         return this.metaReducer.sf(state, 'data.tableOption', fromJS(options))
    }

}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}