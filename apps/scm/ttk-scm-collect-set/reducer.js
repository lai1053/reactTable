import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state, option) => {
        let initState = getInitState()
        return this.metaReducer.init(state, initState)
    }


    load1 = (state, res) => {
        const { bankAccountDtoList, keepAccountDto: { accountDateSet, id, orgId, settlement, bankAccountId } } = res;
        return this.metaReducer.sfs(state, {
            'data.other.loading1': false,
            'data.form1.accountDateSet': accountDateSet,
            'data.form1.settlement': settlement,
            'data.form1.bankAccountId': bankAccountId,
            'data.form1.id': id,
            'data.bankAccount': fromJS(bankAccountDtoList),
            'data.form1.vatOrEntry': 1
        }
        )
    }



    load2 = (state, option) => {
        const { res: { achivalRuleDto: { id, ts, supplierAccountSet }, invoiceInventoryList, inventoryRelatedAccountEnable }, inventory, account } = option;
        state = this.metaReducer.sfs(state, {
            'data.form2.id': id,
            'data.form2.ts': ts,
            'data.form2.supplierAccountSet': supplierAccountSet,
            'data.form2.details': fromJS(invoiceInventoryList),
            'data.other.inventory': fromJS(inventory),
            'data.other.account': fromJS(account),
            'data.inventoryRelatedAccountEnable': inventoryRelatedAccountEnable
        })
        return state
    }

    load3 = (state, option) => {
        const { proper, ordinary, electron, id } = option;
        return this.metaReducer.sfs(state, {
            'data.other.loading3': false,
            'data.form3.proper': proper,
            'data.form3.ordinary': ordinary,
            'data.form3.electron': electron,
            'data.form3.id': id
        })
    }

    upDate = (state, option) => {
        return state = this.metaReducer.sf(state, option.path, fromJS(option.value))
    }

    upDateSfs = (state, value) => {
        return this.metaReducer.sfs(state, value);
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}