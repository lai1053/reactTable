import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import { blankDetail } from './data'
import extend from './extend'
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
        this.voucherReducer = option.voucherReducer
    }

    init = (state, option) => {
        let initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    load = (state, res) => {
        state = this.metaReducer.sf(state, 'data.other.options', res.options)
        //  console.log(res.filter[0], 'res.filter[0]')
        if (res.filter[0].inAmount || res.filter[0].inMount) {
            state = this.metaReducer.sf(state, 'data.amount', res.filter[0].inAmount || res.filter[0].inMount)
        } else {
            state = this.metaReducer.sf(state, 'data.amount', res.filter[0].outAmount || res.filter[0].outMount)
        }
        // if(res.filter[0].inMount) {
        //     state = this.metaReducer.sf(state, 'data.amount', res.filter[0].inMount)
        //  }else {
        //     state = this.metaReducer.sf(state, 'data.amount', res.filter[0].outMount)
        //  }

        if (res.filter[0].required == "customer") {
            state = this.metaReducer.sf(state, 'data.other.inventoryTypes', fromJS(res.customer.list))
        } else if (res.filter[0].required == "supplier") {
            state = this.metaReducer.sf(state, 'data.other.inventoryTypes', fromJS(res.supplier.list))
        } else if (res.filter[0].required == "person") {
            state = this.metaReducer.sf(state, 'data.other.inventoryTypes', fromJS(res.person.list))
        }

        state = this.metaReducer.sfs(state, {
            'data.customer': fromJS(res.customer.list),
            'data.supplier': fromJS(res.supplier.list),
            'data.person': fromJS(res.person.list),
        })

        return state
    }

    // addBottomRow = (state, gridName, rowIndex) => {
    //     let deatils = this.metaReducer.gf(state, 'data.form.details').toJS()
    //     deatils.splice(rowIndex, 0, blankDetail)
    //     state = this.metaReducer.sf(state, 'data.form.details', fromJS(deatils))
    //     return state
    // }

    addRowBefore = (state, gridName, rowIndex) => {
        return state
    }

    delRowBefore = (state, gridName, rowIndex) => {
        return state
    }
    delRow = (state, gridName, rowIndex) => {
        let details = this.metaReducer.gf(state, 'data.form.details').toJS(),
            error = this.metaReducer.gf(state, 'data.other.error').toJS()

        if (rowIndex > 0) {
            details.splice(rowIndex, 1)
        } else {

            if (details.length > 1) {
                details.splice(rowIndex, 1)
            }
            // else {
            //     details.splice(rowIndex, 1, blankDetail)
            // }
        }

        if (details[rowIndex] && details[rowIndex].errorQuantity) {
            details[rowIndex].errorQuantity = false
        }

        state = this.metaReducer.sf(state, 'data.form.details', fromJS(details))
        return state
    }

    update = (state, { path, value }) => {
        state = this.metaReducer.sf(state, path, fromJS(value))
        return state
    }

    selectAll = (state, checked) => {
        let lst = this.metaReducer.gf(state, 'data.form.details')
        if (!lst || lst.size == 0)
            return state
        lst.map((element, index) => {
            lst = lst.update(index, item => item.set('selected', checked))
        })
        state = this.metaReducer.sf(state, 'data.form.details', lst)
        return state
    }

    selectRow = (state, rowIndex, checked) => {
        state = this.metaReducer.sf(state, `data.form.details.${rowIndex}.selected`, checked);
        return state;
    }
}

// export default function creator(option) {
//     const metaReducer = new MetaReducer(option),
//         o = new reducer({ ...option, metaReducer })

//     return { ...metaReducer, ...o }
// }

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        extendReducer = extend.reducerCreator({ ...option, metaReducer }),
        o = new reducer({ ...option, metaReducer, extendReducer })

    return { ...metaReducer, ...extendReducer.gridReducer, ...o }
}