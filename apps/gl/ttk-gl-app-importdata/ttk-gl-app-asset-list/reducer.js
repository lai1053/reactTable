import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import extend from './extend'
import { getInitState } from './data'
class reducer {
	constructor(option) {
		this.metaReducer = option.metaReducer
		this.extendReducer = option.extendReducer
		this.config = config.current
	}
	init = (state) => {
		const initState = getInitState()
		return this.metaReducer.init(state, initState)
	}
	load = (state, response, periodDate, maxClosingPeriod) => {
		if (response.assetList) {
			state = this.metaReducer.sf(state, `data.list`, fromJS(response.assetList))
			state = this.metaReducer.sf(state, `data.sourceList`, fromJS(response.assetList))
		}
		state = this.metaReducer.sf(state, `data.search.period`, periodDate)
		state = this.metaReducer.sf(state, `data.maxClosingPeriod`, maxClosingPeriod)
		return state
	}
	/**
     * 加载load状态
     */
	loading = (state, loading) => {
		return this.metaReducer.sf(state, 'data.other.loading', loading)
	}
	update = (state, { path, value }) => {
		return this.metaReducer.sf(state, path, fromJS(value))
	}
	refreshList = (state, response) => {
		if (response.assetList) {
			state = this.metaReducer.sf(state, 'data.list', fromJS(response.assetList))
		}
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
