import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
// import moment from 'moment'
import extend from './extend'
import { formatNumbe } from './../common'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, proid) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }
    
    load = (state, response, startperiod, propertyDetailFilter, getInvSetByPeroid, xdzOrgIsStop) => { 
        let billBodyNum, billBodyybBalance, listData, initialList, pdfVal, staPeriod
        if (response && response.length > 0) {
            // let list = response[response.length - 1]
            let list = response.pop()
            billBodyNum = formatNumbe(list.num)
            billBodyybBalance = formatNumbe(list.ybBalance, 2)
            listData = fromJS(response)
            initialList = fromJS(response)
        } else {

            billBodyNum = formatNumbe(0)
            billBodyybBalance = formatNumbe(0, 2)
            listData = fromJS([])
            initialList = fromJS([])
        }

        pdfVal = fromJS(propertyDetailFilter)
        staPeriod = startperiod  
        let obj = {
            'data.listAll.billBodyNum': billBodyNum,
            'data.listAll.billBodyybBalance': billBodyybBalance,
            'data.list': listData,
            'data.initialList': initialList,
            'data.form.propertyDetailFilter': pdfVal,
            'data.other.proid': staPeriod,
            'data.loading': false
        }

        if (getInvSetByPeroid) {
            let stateNow = (getInvSetByPeroid.isGenVoucher || getInvSetByPeroid.isCarryOverMainCost) ? true : false
            obj = Object.assign({}, obj, {
                'data.limit.stateNow': stateNow,
                'data.xdzOrgIsStop': xdzOrgIsStop
            })
        }

        state= this.metaReducer.sfs(state, obj)
        return state
    }

    reload = (state, response) => {
        let billBodyNum, billBodyybBalance, listData, initialList
        if (response && response.length > 0) {
            // let list = response[response.length - 1]
           let list =  response.pop()
            billBodyNum = formatNumbe(list.num)
            billBodyybBalance = formatNumbe(list.ybBalance, 2)
            listData = fromJS(response)
            initialList = fromJS(response)
        } else {
            billBodyNum = formatNumbe(0)
            billBodyybBalance = formatNumbe(0, 2)
            listData = fromJS([])
            initialList = fromJS([])
        }

        state = this.metaReducer.sfs(state, {
            'data.listAll.billBodyNum': billBodyNum,
            'data.listAll.billBodyybBalance': billBodyybBalance,
            'data.list': listData,
            'data.initialList': initialList,
        })
        return state
    }


    reloadReq = (state, response, getInvSetByPeroid, xdzOrgIsStop) => {
        let billBodyNum, billBodyybBalance, reqList
        if (response && response.length > 0) {
            // let list = response[response.length - 1]
            let list = response.pop()
            response.forEach((item, index) => {
                item.voucherId = index + 1
                item.code = item.inventoryCode
                item.supplierName = item.supplierId
                item.guige = item.specification
                item.unit = item.unitName
            })

            billBodyNum = formatNumbe(list.num)
            billBodyybBalance = formatNumbe(list.ybBalance, 2)
            reqList = fromJS(response)
        
        } else {
            billBodyNum = formatNumbe(0)
            billBodyybBalance = formatNumbe(0, 2)
            reqList = fromJS([])
        }
        let obj = {
            'data.listAll.billBodyNum': billBodyNum,
            'data.listAll.billBodyybBalance': billBodyybBalance,
            'data.reqList': reqList
        }
        if (getInvSetByPeroid) {
            let stateNow = (getInvSetByPeroid.isGenVoucher || getInvSetByPeroid.isCarryOverMainCost) ? true : false
            obj = Object.assign({}, obj, {
                'data.limit.stateNow': stateNow,
                'data.xdzOrgIsStop': xdzOrgIsStop
            })
        }

        state = this.metaReducer.sfs(state, obj)
        return state
    }


    selectRow = (state, rowIndex, checked) => {
		state = this.metaReducer.sf(state, `data.list.${rowIndex}.selected`, checked)
		return state
    }
    
    
    addEmptyRow = (state, rowIndex) => {
        var list = this.metaReducer.gf(state, 'data.list')
        list = list.insert(rowIndex, Map({
            id: list.size
        }))

        return this.metaReducer.sf(state, 'data.list', list)
    }


    delrow = (state, id) => {
        var list = this.metaReducer.gf(state, 'data.list')
        const index = list.findIndex(o => {
           return o.get('id') == id
        })
        
        if (index == -1)
            return state

        list = list.remove(index)
        return this.metaReducer.sf(state, 'data.list', list)
    }


    update = (state, {path, value}) => {
        state = this.metaReducer.sf(state, path, fromJS(value))
        return state
    }


    updateList = (state, path, value) => {
        // console.log([path], value, 'JJJHHH&&&')
        state = this.metaReducer.sf(state, path, fromJS(value))
        return state
    }


    setTableOption = (state, value) => {
        return this.metaReducer.sf(state, 'data.tableOption', fromJS(value))
	}
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer }),
		ret = { ...metaReducer, ...extendReducer.gridReducer, ...o }
	return { ...ret }
}