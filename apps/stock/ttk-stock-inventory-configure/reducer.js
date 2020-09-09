import { Map, fromJS } from 'immutable' 
import { reducer as MetaReducer } from 'edf-meta-engine' 
import config from './config' 
import { getInitState } from './data' 
import extend from './extend'
import { deepClone } from '../commonAssets/js/common'

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

	load = (state, option,list,getInvSetByPeroid) => {
		const optionCopy = deepClone(option)
		const original = option || {}
		state = this.metaReducer.sf(state, 'data.hasRecord', original.state)
		state = this.metaReducer.sf(state, 'data.form', fromJS(optionCopy))
		state = this.metaReducer.sf(state, 'data.list', fromJS(list) )
		state = this.metaReducer.sf(state, 'data.limit', fromJS(getInvSetByPeroid) )
		return state 
	} 

	//初始化账套信息
	initSetInfo = (state, setInfo) => {
		let getInvSetByPeroid = setInfo || {}
		state = this.metaReducer.sf(state, 'data.limit', fromJS(getInvSetByPeroid) )
		return state
	}

	glAccounts = (state, value) => {
		return state = this.metaReducer.sf(state, 'data.glAccounts', fromJS(value))
	}
	
	selectRow = (state, rowIndex, checked) => {
		state = this.metaReducer.sf(state, `data.list.${rowIndex}.selected`, checked) 
		return state 
	} 
	updata = (state,path, value) => {
		return state = this.metaReducer.sf(state, path, fromJS(value))
	}
	selectAll = (state, checked, gridName) => {
		state = this.extendReducer.gridReducer.selectAll(state, checked, gridName) 
		return state 
	} 

}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer }),
		ret = { ...metaReducer, ...extendReducer.gridReducer, ...o } 

	return { ...ret } 
}
