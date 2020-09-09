import {Map, toJS,fromJS} from 'immutable'
import {reducer as MetaReducer} from 'edf-meta-engine'
import config from './config'
import {getInitState} from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
      const initState = getInitState()
      return this.metaReducer.init(state, initState)  // metaReducer是啥
    }
    // 初始化列表和页签数据
    load = (state, value) => {
        // console.log('reducer-load:',value)
        let list, pagination  
        const tabName = this.metaReducer.gf(state, 'data.tabFilter.trans_catagory')
        if (tabName === 'check') {
            list = 'data.list'
        }else{
            list = 'data.certificationList'
        }
        
        if (value && value.list) {
            state = this.metaReducer.sf(state, list, fromJS(value.list))           
        }
        
        if (value && value.page && value.page.totalCount &&value.page.totalCount>-1) {
            let page = {
                pageSizeOptions: ['20', '50', '60', '200'],                
                currentPage: value.page.currentPage,
                totalCount: value.page.totalCount,
                totalPage: value.page.totalPage,
                pageSize: value.page.pageSize
            }
            state = this.metaReducer.sf(state, 'data.pagination', fromJS(page))
        }
        if(value){
            let statics = {
                fpzs: value.fpzs || 0,
				ljje: value.ljje || 0,
				ljse: value.ljse || 0
            }
            state = this.metaReducer.sf(state, 'data.statics', fromJS(statics))

        }
        return state
    }

    //  初始化信息（发票信息、勾选状态、认证状态）
    initInfo = (state,field,value) =>{
        if(value){
            state = this.metaReducer.sf(state,field,fromJS(value))
        }
        return state
    }
    
    setTableOption = (state, value) => {
        return this.metaReducer.sf(state, 'data.tableOption', fromJS(value))
    }
    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({...option, metaReducer}),
        ret = {...metaReducer,  ...o}

    return {...ret}
}