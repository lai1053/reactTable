import { Map, fromJS } from 'immutable' 
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
		return this.metaReducer.init(state, initState) 
	} 

	load = (state, option) => {
		return state 
	} 
	
	upload = (state, value) => {
    	if(value) state = this.metaReducer.sf(state, 'data.file', fromJS(value))
		return state
	}
	
	updateState = (state, name, value) => {
        state = this.metaReducer.sf(state, name , value)
		return state
    }

}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		o = new reducer({ ...option, metaReducer }) 

	return { ...metaReducer, ...o } 
}