import { Map, fromJS, is } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import { fetch, number, history, math } from 'edf-utils'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, data, date, swVatTaxpayer ) => {
        const initState = getInitState()
        // initState.data = data
        if( date ) {
            initState.data.date = date
        }
        initState.data.swVatTaxpayer = swVatTaxpayer

        return this.metaReducer.init(state, initState)
    }

}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}