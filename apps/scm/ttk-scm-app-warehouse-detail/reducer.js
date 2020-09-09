import { Map, List, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import { getInitState } from './data'
import extend from './extend'
import {FormDecorator} from 'edf-component'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state, option) => {
        let initState = getInitState();
        return this.metaReducer.init(state, initState)
    }
    load = (state, {res, inventoryId, enableTime}) => {
        if(inventoryId) state = this.metaReducer.sf(state, 'data.other.inventoryId', fromJS(inventoryId))
        if(res.details) {
            if(res.details.length && !res.details[res.details.length-1].businessTypeId){
                res.details[res.details.length-1].businessTypeName = '合计'
            } 
            state = this.metaReducer.sf(state, 'data.other.tableList', fromJS(res.details))
        }
        
        if(enableTime) state = this.metaReducer.sf(state, 'data.other.enableTime', fromJS(enableTime))
        if(res.inventoryPropertyList) {
            let propertyList = []
            res.inventoryPropertyList.map(item=> {
                propertyList.push({
                    value: item.id,
                    label: item.name
                })
            })
            state = this.metaReducer.sf(state, 'data.other.type', fromJS(propertyList))
        }
        if(res.businessTypeDtos){
            let businessList = []
            res.businessTypeDtos.map(item=> {
                businessList.push({
                    value: item.id,
                    label: item.name
                })
            })
            state = this.metaReducer.sf(state, 'data.other.businessList', fromJS(businessList))
        }
        if(res.page) state = this.setPages(state, res.page)
        if(res.setupDto) {
            state = this.metaReducer.sfs(state, {
                'data.other.proMethod': fromJS(res.setupDto.productionAccounting),
                'data.other.mode': fromJS(res.setupDto.mode),
                'data.other.lastDayOfUnEndingClosingCalendar': fromJS(res.setupDto.lastDayOfUnEndingClosingCalendar),
                'data.other.recoilMode': fromJS(res.setupDto.recoilMode)
            })
        }
        return state
    }
    update = (state, {path,value})=> {
        state = this.metaReducer.sf(state, path, fromJS(value))
        return state
    }
    searchUpdate = (state, value) => {
        value.type = value.type ? value.type : undefined
        value.business = value.business ? value.business : undefined
        state = this.metaReducer.sfs(state, {
            'data.other.searchValue': fromJS(value),
            'data.form.typeId': value.type ,
            'data.form.businessId': value.business
        })
        return state
    }
	upDateStart = (state, path, value)=> {
        state = this.metaReducer.sf(state, path, fromJS(value))
        return state
    }

    setTableOption = (state, value) => {
        return this.metaReducer.sf(state, 'data.tableOption', fromJS(value))
    }
    updateOption = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }

    //设置分页
	setPages = (state, page) => {
		if(page){
			state = this.metaReducer.sf(state, `data.page`, fromJS({
				currentPage: page.currentPage,
				total: page.totalCount,
				pageSize: page.pageSize
			}))
        }
		return state
	}
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        extendReducer = extend.reducerCreator({ ...option, metaReducer }),
        voucherReducer = FormDecorator.reducerCreator({ ...option, metaReducer }),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...extendReducer, ...o }
}