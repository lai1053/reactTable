import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
var listeners = Map()
class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state, option) => {
        let initState = getInitState();
        initState.data.content = option
        if(!option.isVATTAXPAYER_generalTaxPayer){
            initState.data.other.incomeexpensesTab = [{
                "id": 2, "code": "3001002", "name": "进项发票明细", appName: 'ttk-scm-app-entry-invoice'
            },{
                "id": 3, "code": "4001001", "name": "销项发票明细", appName: 'ttk-scm-app-sales-invoice'
            }]
            initState.data.other.activeKey = 2 + ''
        }
        return this.metaReducer.init(state, initState)
    }

    handletabchange = (state, key) => {
        let listener = listeners.get(`onTabFocus_${key}`)
        if (listener) {
            setTimeout(() => listener(), 16)
        }
        return this.metaReducer.sf(state, 'data.other.activeKey', key);
    }

    addTabChangeListener = (state, eventName, handler) => {
        const activeKey = this.metaReducer.gf(state, 'data.other.activeKey')
        eventName = `${eventName}_${activeKey}`
        if (!listeners.get(eventName)) {
            listeners = listeners.set(eventName, handler)
        }
        return state
    }
    removeTabChangeListener = (state) => {
        listeners = Map()
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}