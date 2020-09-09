import { Map, fromJS } from 'immutable' 
import { reducer as MetaReducer } from 'edf-meta-engine' 
import config from './config' 
import { getInitState } from './data' 
import extend from './extend'

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

	load = (state, unitList, queryAccount) => {
		if(unitList) state = this.metaReducer.sf(state, 'data.other.unitList', fromJS(unitList))
		if(queryAccount) {
			state = this.metaReducer.sfs(state, {
				'data.glAccounts': fromJS(queryAccount.glAccountsList),
				'data.isJieZhuan': queryAccount.certificateForward  // 结转后置灰
			})
		}
		return state 
	} 

	selectRow = (state, rowIndex, checked) => {
		state = this.metaReducer.sf(state, `data.list.${rowIndex}.selected`, checked) 
		return state 
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
