import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import extend from './extend';
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer;
        this.extendReducer = option.extendReducer;
        this.config = config.current;
    }

    init = (state, option) => {
        let initState = getInitState()
        return this.metaReducer.init(state, initState)
    }
    load = (state, option) => {
        if (option.res.achivalRuleDto) {
            // customerSet 正常显示的值， otherCustomerSet 多余的记录，需要再传给后端
            let isSet, achivalRuleDto = option.res.achivalRuleDto, otherCustomerSet

            isSet = achivalRuleDto.supplierSet ? true : false
            otherCustomerSet = achivalRuleDto.customerSet ? true : false

            state = this.metaReducer.sf(state, 'data.form.customerSet', fromJS(isSet))
            state = this.metaReducer.sf(state, 'data.form.otherCustomerSet', fromJS(otherCustomerSet))

            let isInven = achivalRuleDto.inventorySet ? true : false
            state = this.metaReducer.sf(state, 'data.form.inventorySet', fromJS(isInven))
            state = this.metaReducer.sf(state, 'data.form.id', fromJS(achivalRuleDto.id))
            state = this.metaReducer.sf(state, 'data.form.ts', fromJS(achivalRuleDto.ts))
        }
        if (option.res) state = this.metaReducer.sf(state, 'data.form.details', fromJS(option.res.invoiceInventoryList))
        
        if (option.inventory) state = this.metaReducer.sf(state, 'data.other.inventory', fromJS(option.inventory))
        if (option.account) state = this.metaReducer.sf(state, 'data.other.account', fromJS(option.account))
        return state
    }
    upDate = (state, option) => {
        return state = this.metaReducer.sf(state, option.path, fromJS(option.value))
    }
    upDateSfs = (state, value) => {
        return this.metaReducer.sfs(state, value);
    }
    selectRow = (state, rowIndex, checked) => {
		state = this.metaReducer.sf(state, `data.form.details.${rowIndex}.selected`, checked);
		return state;
    };
    selectAll = (state, checked, gridName) => {
		state = this.extendReducer.gridReducer.selectAll(state, checked, gridName);
		return state;
	};
}

// export default function creator(option) {
//     const metaReducer = new MetaReducer(option),
//         o = new reducer({ ...option, metaReducer })

//     return { ...metaReducer, ...o }
// }

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer }),
		ret = { ...metaReducer, ...extendReducer.gridReducer, ...o };
	return { ...ret };
}