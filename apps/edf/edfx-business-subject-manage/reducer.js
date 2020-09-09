import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state, option) => {
        let initState = getInitState();
        return this.metaReducer.init(state, initState)
    }
    load = (state, res) => {
        if(res.filter.entity.templateAccountTypeId == "2001001") {
            state = this.metaReducer.sf(state, 'data.flag', true) 
        }else {
            state = this.metaReducer.sf(state, 'data.flag', false) 
        }
        if(res.resTreeList) state = this.metaReducer.sf(state, 'data.other.resTreeList', fromJS(res.resTreeList)) 
        if(res.resAccountList) state = this.metaReducer.sf(state, 'data.other.list', fromJS(res.resAccountList))
        if(res.pageArr) state = this.setPages(state, res.pageArr)
        if(res.resTableList) state = this.metaReducer.sf(state, 'data.other.tableList', fromJS(res.resTableList)) 
        if(res.influenceList) state = this.metaReducer.sf(state, 'data.other.influenceList', fromJS(res.influenceList)) 
        if(!res.isBatch) res.isBatch = false
        state = this.metaReducer.sf(state, 'data.other.isBatch', res.isBatch) 
        return state  
    }
    normalSearchChange = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }
    update = (state, path, value) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }
    updateArr = (state, reduceArr) => {
        return state = this.metaReducer.sfs(state, reduceArr)
    }
    updateSelect = (state, {path,value})=> {
        state = this.metaReducer.sf(state, path, fromJS(value))
        return state
    }

    //设置分页
	setPages = (state, page) => {
		if(page){
			state = this.metaReducer.sf(state, `data.page`, fromJS({
				current: page.currentPage,
				total: page.totalCount,
				pageSize: page.pageSize
			}))
        }
		return state
	}
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}