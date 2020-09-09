import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import extend from './extend'
import { FormDecorator } from 'edf-component'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.voucherReducer = option.voucherReducer
    }

    init = (state, option) => {
        let initState = getInitState()
        return this.metaReducer.init(state, initState)
    }
    load = (state, option) => {
        const { customer = [], inventory = [], property = [], supplier = [], detailList = [], taxRateTypes = [], impose = [], department = [], revenueType = [], project = [], inventoryTypes = [] } = option;
        state = this.metaReducer.sfs(state, {
            'data.other.customer': fromJS(customer),
            'data.other.inventory': fromJS(inventory),
            'data.other.inventoryfilter': fromJS(inventory),
            'data.other.property': fromJS(property),
            'data.other.supplier': fromJS(supplier),
            'data.other.detailList': fromJS(detailList),
            'data.other.taxRateTypes': fromJS(taxRateTypes),
            'data.other.impose': fromJS(impose),
            'data.other.department': fromJS(department),
            'data.other.revenueType': fromJS(revenueType),
            'data.other.project': fromJS(project),
            'data.other.inventoryTypes': fromJS(inventoryTypes),
        });
        return state
    }
    upDate = (state, option) => {
        return this.metaReducer.sf(state, option.path, fromJS(option.value))
    }
    // upDates = (state,value) => {
    //     return state = this.metaReducer.sfs(state, {
    //         'data.other.dateHabit': fromJS(value[0]),
    //         'data.form.dateHabitId': fromJS(value[1])
    //     })
    // }
    upDateSf = (state, arr) => {
        return this.metaReducer.sfs(state, arr);
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        extendReducer = extend.reducerCreator({ ...option, metaReducer }),
        voucherReducer = FormDecorator.reducerCreator({ ...option, metaReducer }),
        o = new reducer({ ...option, metaReducer, extendReducer, voucherReducer })

    return { ...metaReducer, ...extendReducer.gridReducer, ...o }
}