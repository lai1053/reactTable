import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import moment from 'moment'
import extend from './extend';
import { formatNumbe } from './../common'
import { formatSixDecimal } from '../commonAssets/js/common'
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    load = (state, response, invSet, bomConfig, xdzOrgIsStop ) => {
        let name=this.metaReducer.context.get('currentOrg').name
        let pageObj = {
            'current': 1,
            'pageSize': 50,
            'total': 0
        },
        dataObj = {
            'data.listAll.billBodyNumMinus': formatSixDecimal(0),
            'data.listAll.billBodyNumPlus': formatSixDecimal(0),
            'data.listAll.billBodyYbBalanceMinus': formatNumbe(0, 2),
            'data.listAll.billBodyYbBalancePlus': formatNumbe(0, 2),
            'data.list': fromJS([])
        }
        if(response){
            const {list=[], page={}} = response
            if(list && list.length>0){
                const listAll = response.list.pop() || {}
                const {billBodyNumMinus=0, billBodyNumPlus=0, billBodyYbBalanceMinus=0, billBodyYbBalancePlus=0} = listAll
                dataObj = {
                    'data.listAll.billBodyNumMinus': formatSixDecimal(billBodyNumMinus),
                    'data.listAll.billBodyNumPlus': formatSixDecimal(billBodyNumPlus),
                    'data.listAll.billBodyYbBalanceMinus': formatNumbe(billBodyYbBalanceMinus, 2),
                    'data.listAll.billBodyYbBalancePlus': formatNumbe(billBodyYbBalancePlus, 2),
                    'data.list': fromJS(list)
                }
            }
    
            if(page) {
                pageObj = {
                    'current': page.currentPage,
                    'total': page.totalCount,
                    'pageSize': page.pageSize
                }
            }
        }

        if(invSet){
            const {isGenVoucher, isCarryOverMainCost, isCarryOverProductCost, isMaterial, isCompletion, endCostType} = invSet
            let stateNow=(isGenVoucher || isCarryOverMainCost || isCarryOverProductCost)? true : false
            let disabledFast = ( isMaterial || !isCompletion ) ? true :  false
            let bomStatus = true
            let bomList = bomConfig && bomConfig.list || []
            if(
                bomList 
                && Object.prototype.toString.call(bomList)=='[object Array]' 
                && bomList.length>0
            ){
                bomStatus = false
            }
            dataObj = Object.assign( {}, dataObj, {
                'data.disabledBom': (bomStatus || disabledFast),
                'data.bomList': fromJS(bomList),
                'data.limit.stateNow': stateNow,
                'data.getInvSet': invSet,
                'data.disalbledFPick': disabledFast
            })
        }
        let year=sessionStorage['stockPeriod'+name].split('-')
        let skssq=year[0]+year[1]
        
        return this.metaReducer.sfs(state, {
            ...dataObj,
            'data.defaultPickerValue': moment(skssq, 'YYYYMM'),
            'data.xdzOrgIsStop': xdzOrgIsStop,
            'data.pagination': fromJS(pageObj),
            'data.other.focusCellInfo': undefined,
        })
    }

    reload = (state, resp, invSet, bomConfig, xdzOrgIsStop) => {
        let pageObj = {
            'current': 1,
            'total': 0,
            'pageSize': 50,
        },
        dataObj = {
            'data.listAll.billBodyNumMinus': formatSixDecimal(0),
            'data.listAll.billBodyNumPlus': formatSixDecimal(0),
            'data.listAll.billBodyYbBalanceMinus': formatNumbe(0, 2),
            'data.listAll.billBodyYbBalancePlus': formatNumbe(0, 2),
            'data.list': fromJS([])
        }

        if(resp){
            const {list=[], page={}} = resp
            if(list && list.length>0){
                const listAll = resp.list.pop() || {}
                const { billBodyNumMinus=0, billBodyNumPlus=0, billBodyYbBalanceMinus=0, billBodyYbBalancePlus=0} = listAll
                dataObj = {
                   'data.listAll.billBodyNumMinus': formatSixDecimal(billBodyNumMinus),
                   'data.listAll.billBodyNumPlus': formatSixDecimal(billBodyNumPlus),
                   'data.listAll.billBodyYbBalanceMinus': formatNumbe(billBodyYbBalanceMinus, 2),
                   'data.listAll.billBodyYbBalancePlus': formatNumbe(billBodyYbBalancePlus, 2),
                   'data.list': fromJS(list)
                }
           }
           if(page) {
                pageObj = {
                   'current': page.currentPage,
                   'total': page.totalCount,
                   'pageSize': page.pageSize
                }
           }
        }
        
        if(invSet){
            let bomStatus = true
            const { isGenVoucher, isCarryOverMainCost, isCarryOverProductCost, isMaterial, endCostType, isCompletion} = invSet
            let stateNow=(isGenVoucher||isCarryOverMainCost||isCarryOverProductCost)
            let disabledFast = (isMaterial || !isCompletion) //? true :  false
            const bomList = bomConfig && bomConfig.list || []
            if( bomList && Array.isArray(bomList) && bomList.length>0 ){
                bomStatus = false
            }
            dataObj = Object.assign( {}, dataObj, {
                'data.disabledBom': (bomStatus || disabledFast),
                'data.limit.stateNow': stateNow,
                'data.getInvSet': invSet,
                'data.disalbledFPick': disabledFast,
            })
        }

        return this.metaReducer.sfs(state, {
            ...dataObj,
            'data.other.focusCellInfo': undefined,
            'data.pagination': fromJS(pageObj),
            'data.xdzOrgIsStop': xdzOrgIsStop,
        })
    }

    selectRow = (state, rowIndex, checked) => this.metaReducer.sf(state, `data.list.${rowIndex}.selected`, checked)

    modifyContent = (state) => {
        const content = this.metaReducer.gf(state, 'data.content')
        return this.metaReducer.sf(state, 'data.content', content + '!')
    }
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer }),
		ret = { ...metaReducer, ...extendReducer.gridReducer, ...o };
	return { ...ret };
}