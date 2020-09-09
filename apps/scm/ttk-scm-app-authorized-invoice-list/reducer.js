import { Map, fromJS } from 'immutable'
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
		return this.metaReducer.init(state, initState)
	}

	load = (state, { list, colmns }) => {
		state = this.metaReducer.sfs(state, {
			'data.list': fromJS(list),
			'data.columns': fromJS(colmns)
		});
		return state
	}
	request=(state,list)=>{
		return this.metaReducer.sf(state, 'data.list', fromJS(list));
	}
	update = (state, { path, value }) => {
		return this.metaReducer.sf(state, path, fromJS(value))
	}
	updateSfs = (state, value) => {
		return this.metaReducer.sfs(state, value);
	}
	setTableOption = (state, value) => {

		return this.metaReducer.sf(state, 'data.tableOption', fromJS(value))
	}


}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		o = new reducer({ ...option, metaReducer }),
		ret = { ...metaReducer, ...o }
	return { ...ret }
}
