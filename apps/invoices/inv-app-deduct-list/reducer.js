import {Map, fromJS} from 'immutable'
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
        if (value && value.data !== null && value.data !==undefined && value.data.list ) {
            state = this.metaReducer.sf(state, 'data.list', fromJS(value.list))
        }

        // 从服务端返回的分页数据初始化
        if (value && value.page.totolCount>-1) {
            let page = {
                pageSizeOptions: ['20', '50', '60', '200'],                
                currentPage: value.page.currentPage,
                totalCount: value.page.totalCount,
                totalPage: value.page.totalPage,
                pageSize: value.page.pageSize
            }
            state = this.metaReducer.sf(state, 'data.pagination', fromJS(page))
        }

        return state
    }
    //  初始化信息（发票信息、勾选状态、认证状态）
    initInfo = (state,field,value) =>{
        if(value){
            let calVal
            if(typeof(value)==='object'){
                calVal = fromJS(value)
            }else{
                calVal = value
            }
            state = this.metaReducer.sf(state,field,calVal)
        }
        return state
    }
    
    setTableOption = (state, value) => {
        return this.metaReducer.sf(state, 'data.tableOption', fromJS(value))
    }
    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }
    updateSfs = (state, options) => {
       return this.metaReducer.sfs(state, options)
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({...option, metaReducer}),
        ret = {...metaReducer,  ...o}

    return {...ret}
}