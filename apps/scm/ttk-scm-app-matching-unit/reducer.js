import { Map, List, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import extend from './extend';
import { getInitState } from './data'

class reducer {
    constructor(option) {
		this.metaReducer = option.metaReducer;
		this.extendReducer = option.extendReducer;
	}

    init = (state) => {
        return this.metaReducer.init(state, getInitState())
    }

    load = (state, option, supplierList, customerList, searchs) => {
        let list = []
        option.allList = this.changeItmes(option.allList, customerList.list, supplierList.list)
        option.notMatchList = this.changeItmes(option.notMatchList, customerList.list, supplierList.list)
        if(option.currentAccountEnable){
            list = option.notMatchList
        }else{
            list = option.allList
        }

        let data = {
            'data.list': fromJS(list),
            'data.allList': fromJS(option.allList),
            'data.notMatchList': fromJS(option.notMatchList),
            'data.currentAccountEnable': option.currentAccountEnable,
            'data.customerAccounts': fromJS(option.customerAccounts),
            'data.supplierAccounts': fromJS(option.supplierAccounts),
            'data.supplierRootAccounts': fromJS(option.supplierRootAccounts),
            'data.customerRootAccounts': fromJS(option.customerRootAccounts),
            'data.customerParentAccounts': fromJS(option.customerParentAccounts),
            'data.supplierParentAccounts': fromJS(option.supplierParentAccounts),
            'data.other.supplier': fromJS(supplierList.list),
            'data.other.customer': fromJS(customerList.list),
            'data.inventoryNameSet': option.currentAccountEnable ? 1 : 0
        }
        //debugger
        if(searchs && option.currentAccountEnable){
            if(searchs.inventoryNameSet==0){
                data['data.list'] = fromJS(option.allList)
            }else if(searchs.inventoryNameSet==1){
                data['data.list'] = fromJS(option.notMatchList)
            }
            data['data.inventoryNameSet'] = searchs.inventoryNameSet
            data['data.search'] = searchs.search
        }

        state = this.metaReducer.sfs(state, data)
        return state
    }

    changeItmes = (list, customerAccounts, supplierAccounts) => {
        list.map(item => {
            let option = undefined
            if(!item.archiveId) return
            if(item.archiveType=="客户"){
                option = customerAccounts.filter(o=>o.id == item.archiveId)
                item.ba = option[0]
            }
            if(item.archiveType=="供应商"){
                option = supplierAccounts.filter(o=>o.id == item.archiveId)
                item.ba = option[0]
            }
        })
        return list
    }

	updatefile = (state, item) => {
        state = this.metaReducer.sf(state, item.path, fromJS(item.value))
        return state
    }

    update = (state, option) => {
        state = this.metaReducer.sfs(state, option)
        return state
    }
    
    selectRow = (state, rowIndex, checked) => {
		state = this.metaReducer.sf(state, `data.list.${rowIndex}.selected`, checked);
		return state;
	}

	selectAll = (state, checked, gridName) => {
		state = this.extendReducer.gridReducer.selectAll(state, checked, gridName);
		return state;
	}
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer }),
		ret = { ...metaReducer, ...extendReducer.gridReducer, ...o };
	return { ...ret };
}