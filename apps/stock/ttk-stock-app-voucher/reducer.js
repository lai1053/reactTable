import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import moment from 'moment'
import extend from './extend';

class reducer {

    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        
        initState.data.form.operater = sessionStorage['username'];
        return this.metaReducer.init(state, initState)
    }
    load = (state, response,propertyDetailFilter) => {
        
        if(response&&response.length>0){
            state = this.metaReducer.sf(state, 'data.list', fromJS(response))
        }else{
            state = this.metaReducer.sf(state, 'data.list', fromJS([]))
        }
        state = this.metaReducer.sf(state, 'data.form.propertyDetailFilter', fromJS(propertyDetailFilter))
        return state
    }
    updateSfs = (state, value,arr) => {
        
        var list = this.metaReducer.gf(state, 'data.list').toJS()
        list.forEach(item => {
            arr.forEach(data => {
                if(item.inventoryCode==data.inventoryCode){
                    item.kemu=value
                }
            });
        });
        state = this.metaReducer.sf(state, 'data.list', fromJS(list))
        return state
    }
    addEmptyRow = (state, rowIndex) => {
        var list = this.metaReducer.gf(state, 'data.list')
        list = list.insert(rowIndex,Map({
            id: list.size
        }))

        return this.metaReducer.sf(state, 'data.list', list)
    }

    delrow = (state, id) => {
        var list = this.metaReducer.gf(state, 'data.list')
        const index = list.findIndex(o => {
           return  o.get('id') == id
        })
        
        if (index == -1)
            return state

        list = list.remove(index)
        return this.metaReducer.sf(state, 'data.list', list)
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
		ret = { ...metaReducer, ...extendReducer.gridReducer, ...o };
	return { ...ret };
}