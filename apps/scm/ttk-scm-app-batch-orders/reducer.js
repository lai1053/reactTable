import { Map, List, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state) => {
        return this.metaReducer.init(state, getInitState())
    }

    load = (state, option) => {
        state = this.metaReducer.sf(state, 'data.bankReconciliatios', fromJS(option))
        return state
    }

	updatefile = (state, item) => {
        state = this.metaReducer.sf(state, item.path, fromJS(item.value))
        return state
    }

    addArchives = (state, type, rowIndex, ret, isSupplierCustomer) => {
        let bankReconciliatios = this.metaReducer.gf(state, 'data.bankReconciliatios').toJS()

        if(isSupplierCustomer){
            bankReconciliatios[rowIndex].supplierCustomerList.push(ret)
            bankReconciliatios[rowIndex]['supplierCustomerId'] = ret.id
        }else{
            let list = this.metaReducer.gf(state, `data.other.${type}`).toJS()
            list.push(ret)
            state = this.metaReducer.sf(state, `data.other.${type}`, fromJS(list))
            bankReconciliatios[rowIndex][type+'Id'] = ret.id
        }
        state = this.metaReducer.sf(state, `data.bankReconciliatios`, fromJS(bankReconciliatios))
        return state
    }

    accountDateChange = (state, option) => {
        let bankReconciliatios = this.metaReducer.gf(state, 'data.bankReconciliatios').toJS()
        bankReconciliatios[option.index].accountDate = option.e
        state = this.metaReducer.sf(state, `data.bankReconciliatios`, fromJS(bankReconciliatios))
        return state
    }

    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}