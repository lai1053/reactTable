import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import extend from './extend'
import { getInitState } from './data'
import utils from 'edf-utils'

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

	load = (state, list, initData, value) => {
		if(list && list.length){
			state = this.metaReducer.sf(state, `data.isNotValue`, false)
			state = this.metaReducer.sf(state, `data.list`, fromJS(list[0].fpxxlb))
			state = this.metaReducer.sf(state, `data.filter.page`, fromJS(list[0].page))
		}else{
			state = this.metaReducer.sf(state, `data.isNotValue`, true)
			state = this.metaReducer.sf(state, `data.list`, fromJS([]))
		}
		if(initData && initData.date){
			state = this.metaReducer.sf(state, `data.filter.period`, initData.date)
			state = this.metaReducer.sf(state, `data.isCurrent`, initData.isCurrent)
		}
		if(value) state = this.metaReducer.sf(state, `data.filter`, fromJS(value))
		return state
	}

	update = (state, { path, value }) => {
		return this.metaReducer.sf(state, path, fromJS(value))
	}
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer }),
		ret = { ...metaReducer, ...extendReducer.gridReducer, ...o }

	return { ...ret }
}