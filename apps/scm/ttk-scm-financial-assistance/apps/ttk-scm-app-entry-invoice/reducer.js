import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import extend from './extend'
import { getInitState } from './data'
import utils from 'edf-utils'
var listeners = Map()

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
		let tabArr = [], tabIndex = 0

		if(initData && initData.date){
			state = this.metaReducer.sf(state, `data.filter.period`, initData.date)
			state = this.metaReducer.sf(state, `data.isCurrent`, initData.isCurrent)
		}
		if(value) state = this.metaReducer.sf(state, `data.filter`, fromJS(value))

		if(list && list.length){
			list.map((item,index) => {
				tabArr.push({name: item.fplx, id: index+1, list: item.fpxxlb, page: item.page, fplxdm: item.fplxdm})
			})
			//debugger
			let option
			if(value && value.fplxdm){
				option = tabArr.filter(item => item.fplxdm == value.fplxdm)[0]
			}
			if(!option && tabArr.length) option = tabArr[0]
			state = this.metaReducer.sf(state, `data.list`, fromJS(option.list))
			state = this.metaReducer.sf(state, `data.filter.page`, fromJS(option.page))
			state = this.metaReducer.sf(state, `data.filter.fplxdm`, fromJS(option.fplxdm))
			state = this.metaReducer.sf(state, `data.filter.activeKey`, fromJS(option.fplxdm))
			state = this.metaReducer.sf(state, `data.tabArr`, fromJS(tabArr))
		}else{
			state = this.metaReducer.sf(state, `data.list`, fromJS([]))
			state = this.metaReducer.sf(state, `data.tabArr`, fromJS([]))
		}
		
		return state
	}

	update = (state, { path, value }) => {
		return this.metaReducer.sf(state, path, fromJS(value))
	}

	handletabchange = (state, filter, list) => {
		state = this.metaReducer.sf(state, `data.filter`, fromJS(filter))
		let tabArr = []
		list.map((item,index) => {
			tabArr.push({name: item.fplx, id: index+1, list: item.fpxxlb, page: item.page, fplxdm: item.fplxdm})
		})
		state = this.metaReducer.sf(state, 'data.activekey', filter.activeKey);
		let option = tabArr.filter(item => item.fplxdm == filter.fplxdm)
		state = this.metaReducer.sf(state, `data.list`, fromJS(option[0].list))
		state = this.metaReducer.sf(state, `data.filter.page`, fromJS(option[0].page))
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