import { fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState(option)
        let list = initState.data.list
        initState.data.other.type = option.type
        if(option.curItem){
            list[0] = option.curItem
        }
        if(option.type == 'edit'){
            list.splice(1)
        }
        console.log(initState)
        return this.metaReducer.init(state, initState)
    }

	load = (state, option) => {
        state = this.metaReducer.sf(state, 'data.list', fromJS(list))
        
		// state = this.metaReducer.sf(state, 'data.other.value', fromJS(option.value))
    	return state
    }
    		
   //子页面删除
	deleteRows = (state, list) => {
		state = this.metaReducer.sf(state, 'data.list', fromJS(list))
		return state
    }
    
    setUserDefineItem = (state, address, value) => {
        state = this.metaReducer.sf(state, address, fromJS(value))
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}
