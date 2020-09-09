import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
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

    load = (state, res) => {
        const { bankAccountDtoList, keepAccountDto: { accountDateSet, id, orgId, settlement, bankAccountId } } = res;
        return this.metaReducer.sfs(state, {
            'data.loading': false,
            'data.form.accountDateSet': accountDateSet,
            'data.form.settlement': settlement,
            'data.form.bankAccountId': bankAccountId,
            'data.form.id': id,
            'data.bankAccount': fromJS(bankAccountDtoList)
        }
        )
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}