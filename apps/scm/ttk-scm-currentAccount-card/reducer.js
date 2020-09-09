import { Map, List, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState, blankDetail } from './data'
import moment from 'moment'
import utils from 'edf-utils'
import extend from './extend'
import { consts, common } from 'edf-constant'
import { FormDecorator } from 'edf-component'
import index from './index'
import { EDEADLK } from 'constants';

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
        this.voucherReducer = option.voucherReducer
    }

    init = (state, option) => {
        return this.metaReducer.init(state, getInitState())
    }

    initLoad = (state, response) => {
        if (!response) {
            return this.metaReducer.sf(state, 'data', fromJS(getInitState().data))
        }
        return state
    }

    load = (state, option) => {
        option = option.filter(item => item.notSettleAmount != 0)

        option.map((item, index) => {
            // if(!item.notSettleAmount){
            //     option.splice(index,1)
            // }else{
            item.amount = item.notSettleAmount
            // }
        })

        state = this.metaReducer.sf(state, 'data.form.details', fromJS(option))
        state = this.metaReducer.sf(state, 'data.form.account', 4)
        return state
    }
    upDate = (state, option) => {
        return state = this.metaReducer.sf(state, option.path, fromJS(option.value))
    }

    addRowBefore = (state, gridName, rowIndex) => {
        return state
    }

    delRowBefore = (state, gridName, rowIndex) => {
        return state
    }

    updateState = (state, name, value) => {
        state = this.metaReducer.sf(state, name, value)
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
