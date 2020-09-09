import {Map, fromJS} from 'immutable'
import {reducer as MetaReducer} from 'edf-meta-engine'
import config from './config'
import extend from './extend'
import {getInitState} from './data'

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

    load = (state, res, contentData, keyId) => {
        if (contentData && contentData.page) {
            let page = {
                current: contentData.page.currentPage,
                total: contentData.page.totalCount,
                pageSize: contentData.page.pageSize
            }
            state = this.metaReducer.sf(state, 'data.pagination', fromJS(page))
        }
        if (res.list && res.list.length) {
            state = this.metaReducer.sf(state, `data.other.entry`, "list")
            state = this.metaReducer.sf(state, `data.other.userDefineArchives`, fromJS(res.list))
            state = this.metaReducer.sf(state, `data.list`, fromJS(contentData.list))
	        if(typeof keyId == 'number'){
		        state = this.metaReducer.sf(state, `data.tabKey`, fromJS(res.list[res.list.length-1]['id']+''))
		        state = this.metaReducer.sf(state, `data.tabTs`, fromJS(res.list[res.list.length-1]['ts']+''))
	        }else{
		        state = this.metaReducer.sf(state, `data.tabKey`, fromJS(res.list[0]['id']+''))
		        state = this.metaReducer.sf(state, `data.tabTs`, fromJS(res.list[0]['ts']+''))
	        }
        } else {
            state = this.metaReducer.sf(state, `data.other.entry`, "name")
        }

        return state
    }

    tabChange = (state, res, v) => {
        // debugger
        if (res && res.page) {
            let page = {
                current: res.page.currentPage,
                total: res.page.totalCount,
                pageSize: res.page.pageSize
            }
            state = this.metaReducer.sf(state, 'data.pagination', fromJS(page))
        }
        if(v){
            state = this.metaReducer.sf(state, `data.tabKey`, v)
            let rawData = this.metaReducer.gf(state, `data.other.userDefineArchives`)
            let list = rawData && rawData.toJS()

            if(list) {
                list.some(e => {
                    if(v == e.id) {
                        state = this.metaReducer.sf(state, `data.tabTs`, e.ts)
                        return true
                    }
                })
            }
        }

        state = this.metaReducer.sf(state, `data.list`, fromJS(res.list))
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

    enable = (state, res, index) => {
        if (res) {
            state = this.metaReducer.sf(state, `data.list.${index}`, fromJS(res))
        }
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        extendReducer = extend.reducerCreator({...option, metaReducer}),
        o = new reducer({...option, metaReducer, extendReducer}),
        ret = {...metaReducer, ...extendReducer.gridReducer, ...o}

    return {...ret}
}
