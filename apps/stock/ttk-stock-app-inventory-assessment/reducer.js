import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import moment from 'moment'
import extend from './extend'
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, id) => {
        const initState = getInitState()
        initState.data.other.activeTabKey = id;
        return this.metaReducer.init(state, initState)
    }
    
    load = (state, resp, invset, adjustList, xdzOrgIsStop) => {   
        const  name=this.metaReducer.context.get('currentOrg').name
        const year=sessionStorage['stockPeriod'+name].split('-')
        const skssq=year[0]+year[1]
        const activeTabKey = this.metaReducer.gf(state, 'data.other.activeTabKey')  
        const {isGenVoucher, isCarryOverMainCost} = invset || {}
        let listData = [],  limitData = {}, listAll={}, pageData = {},
            pageObj={ 'current': 1, 'pageSize': 50, 'total': 0}
        
        if(resp){
            const {list=[], page=[]} = resp
            if(list){
                for(const v of list){
                    v.billBodyChNumCopy = (v.billBodyChNum==0 && !v.billBodyChNum) ? '' : v.billBodyChNum
                }
                listAll = list.splice(list.length-1, 1)
                listAll = listAll.length>0 ? listAll[0] : {}
                listData = list
            }
            if(page) {
                pageObj = {
                    'current': resp.page.currentPage,
                    'total': resp.page.totalCount,
                    'pageSize': resp.page.pageSize
                }    
            }
        }
           
        pageData = activeTabKey==1 
            ? {'data.pagination': fromJS(pageObj)} 
            : {'data.paginationList': fromJS(pageObj)}

        if(invset){
            let stateNow=(isGenVoucher || isCarryOverMainCost) 
            const limit = {
                'stateNow': stateNow,
                'isCarryOverMainCost': isCarryOverMainCost
            }
            limitData = { 'data.limit': fromJS(limit) }
        }

        state = this.metaReducer.sfs(state, {
            'data.list': fromJS(listData),
            'data.listAll': fromJS(listAll),
            'data.other.focusCellInfo': undefined,
            'data.defaultPickerValue': moment(skssq, 'YYYYMM'),
            'data.adjustList': fromJS(adjustList),
            'data.isShowAdjust': (adjustList.length>0),
            'data.xdzOrgIsStop': xdzOrgIsStop,   
            ...pageData,
            ...limitData
        })
        return state
    }

    reload = (state, resp, invSet, adjustList, xdzOrgIsStop) => {
        const activeTabKey = this.metaReducer.gf(state, 'data.other.activeTabKey')
        
        let listData = [], pageData = {}, listAll={}, limitData={}, 
            pageObj={'current': 1, 'pageSize': 50, 'total': 0}

        if(resp){
            const {list=[], page={}} = resp 
            const {currentPage, totalCount, pageSize} = page
            if(list){
                for(const v of list){
                    v.billBodyChNumCopy = (v.billBodyChNum==0 && !v.billBodyChNum) ? '' : v.billBodyChNum 
                }
                listAll = list.splice(list.length-1, 1)
                listAll = listAll.length>0 ? listAll[0] : {}
                listData = list
            }
            if(page) {
                pageObj = {
                    'current': currentPage,
                    'total': totalCount,
                    'pageSize': pageSize
                }
            }   
        }
       
        pageData = activeTabKey==1 
            ? {'data.pagination': fromJS(pageObj)} 
            : {'data.paginationList': fromJS(pageObj)}
        
        // 是否已结转
        if(invSet){
            const {isGenVoucher, isCarryOverMainCost} = invSet 
            let stateNow=(isGenVoucher || isCarryOverMainCost)//? true : false
            const limit = {
                'stateNow': stateNow,
                'isCarryOverMainCost': isCarryOverMainCost
            }
            limitData = { 'data.limit': fromJS(limit) }
        }
        
        state = this.metaReducer.sfs(state, {
            'data.other.focusCellInfo': undefined,
            'data.list': fromJS(listData),
            'data.listAll': fromJS(listAll),
            'data.adjustList': fromJS(adjustList),
            'data.isShowAdjust': (adjustList.length>0),
            'data.xdzOrgIsStop': xdzOrgIsStop,   
            ...pageData,
            ...limitData
        })
        return state
    }

    selectRow = (state, rowIndex, checked) => {
		state = this.metaReducer.sf(state, `data.list.${rowIndex}.selected`, checked)
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
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer }),
		ret = { ...metaReducer, ...extendReducer.gridReducer, ...o };
	return { ...ret };
}