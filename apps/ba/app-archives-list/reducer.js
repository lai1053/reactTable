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
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }
	
	load = (state, tabKey, columns, value) => {
		state = this.metaReducer.sf(state, 'data.tabKey', fromJS(tabKey))
		state = this.metaReducer.sf(state, 'data.columns', fromJS(columns))
		if(value && value[tabKey+'s']){
			state = this.metaReducer.sf(state, 'data.list', fromJS(value[tabKey+'s']))
		}
		
		if(value && value.page) {
			let page = {
				current: value.page.currentPage,
				total: value.page.sumCloum,
				pageSize: value.page.pageSize
			}
			state = this.metaReducer.sf(state, 'data.pagination', fromJS(page))
		}
		
    	return state
	}
	
	selectRow = (state, rowIndex, checked) => {
		state = this.metaReducer.sf(state, `data.list.${rowIndex}.selected`, checked)
		return state
	}
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}