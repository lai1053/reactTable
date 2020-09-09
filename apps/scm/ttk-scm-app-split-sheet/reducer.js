import { Map, List, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState, blankDetail } from './data'
import moment from 'moment'
import utils from 'edf-utils'
import extend from './extend'
import { consts, common } from 'edf-constant'
import {FormDecorator} from 'edf-component'
import index from './index'
import { EDEADLK } from 'constants';

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
        this.voucherReducer = option.voucherReducer
    }

    init = (state) => {    
        return this.metaReducer.init(state, getInitState())
    }

    initLoad = (state, result) => {

        result.businessType.forEach(function (data) {
			data.label = data.name
			data.value = data.id
			data.children && data.children.forEach(function (childrenData) {
				childrenData.label = childrenData.name
				childrenData.value = childrenData.id
				childrenData.fatherName = data.name;
				childrenData.fatherId = data.id;
			});
        });
        state = this.metaReducer.sf(state, 'data.other.SystemDate', fromJS(result.SystemDate))
        state = this.metaReducer.sf(state, 'data.other.bankAccount', fromJS(result.bankAccount))
        state = this.metaReducer.sf(state, 'data.other.businessTypes', fromJS(result.businessType))
        state = this.metaReducer.sf(state, 'data.other.getCalcObject', fromJS(result.getCalcObject))
        state = this.metaReducer.sf(state, 'data.other.getCalcObjects', fromJS(result.getCalcObjects))
        state = this.metaReducer.sf(state, 'data.other.total', fromJS(result.bankReconciliatio.inAmount || result.bankReconciliatio.outAmount))
        state = this.metaReducer.sf(state, 'data.other.difference', fromJS(0))
        state = this.metaReducer.sf(state, 'data.other.defaultLength', fromJS(1))
        
        state = this.load(state, result.bankReconciliatio)
        return state
    }

    addRowBefore = (state, gridName, rowIndex) => {

		return state
    }
    
    delRowBefore = (state, gridName, rowIndex) => {
    
		return state
    }
    load = (state, bankReconciliatio) => {
        state = this.metaReducer.sf(state, 'data.other.bankReconciliatio', fromJS(bankReconciliatio))
        return state
    }
    updatefile = (state, item) => {
        state = this.metaReducer.sf(state, item.path, fromJS(item.value))
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        extendReducer = extend.reducerCreator({ ...option, metaReducer }),
        voucherReducer = FormDecorator.reducerCreator({ ...option, metaReducer }),
        o = new reducer({ ...option, metaReducer, extendReducer, voucherReducer })

    return { ...metaReducer, ...extendReducer.gridReducer, ...o }
}
