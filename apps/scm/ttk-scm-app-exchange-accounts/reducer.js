import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { consts, common } from 'edf-constant';
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    load = (state, data) => {
        if(data.oldData && data.oldData.status == consts.consts.VOUCHERSTATUS_Approved){
            data.other.isEnable = true
        }
        return this.metaReducer.sf(state, 'data', fromJS(data))
    }

    addAccount = (state, ret, type) => {
        debugger
        let accountList = this.metaReducer.gf(state, 'data.other.accountList').toJS()
        accountList.push(ret)
        state = this.metaReducer.sf(state, 'data.other.accountList', fromJS(accountList))
        if(type=='in'){
            state = this.metaReducer.sf(state, 'data.form.inBankAccountId', fromJS(ret.id))
        }else{
            state = this.metaReducer.sf(state, 'data.form.bankAccountId', fromJS(ret.id))
        }
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}