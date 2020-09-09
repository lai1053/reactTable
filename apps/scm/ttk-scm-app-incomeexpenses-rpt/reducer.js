import { Map, fromJS, toJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import { getInitState } from './data'
import moment from 'moment'
import config from './config'
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

    updateArr = (state, arr) => {
        arr.forEach(item => {
            if(item.value){
                state = this.metaReducer.sf(state, item.path, fromJS(item.value))
            }
        })
        return state
    }

    settingOptionsUpdate = (state, {visible, data}) => {
        state = this.metaReducer.sf(state, 'data.other.columnDto', fromJS(data))
		state = this.metaReducer.sf(state, 'data.showTableSetting', visible)
        return state
	}

	update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
	}
	
	tableSettingVisible = (state, { value, data }) => {
        state = this.metaReducer.sf(state, 'data.showTableSetting', value)
        data = this.metaReducer.gf(state, 'data.other.columnDto')
        return state
    }
    
    onColumnResizeEnd = (state, res) => {
		if(res[0]){
			state = this.metaReducer.sf(state, 'data.other.columnDto', fromJS(res[0].columnDetails))
		}
		return state
    }
    
    selectAll = (state, checked, gridName) => {
		state = this.extendReducer.gridReducer.selectAll(state, checked, gridName)
		return state
	}
	
	selectRow = (state, rowIndex, checked) => {
		state = this.metaReducer.sf(state, `data.list.${rowIndex}.selected`, checked)
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