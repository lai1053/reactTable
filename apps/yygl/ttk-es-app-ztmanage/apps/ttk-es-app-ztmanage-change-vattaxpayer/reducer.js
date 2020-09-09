import {Map, fromJS} from 'immutable'
import {reducer as MetaReducer} from 'edf-meta-engine'
import config from './config'
import {getInitState} from './data'
import { moment as momentUtil } from 'edf-utils'
import { consts } from 'edf-consts'
import moment from 'moment'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        initState.data.vattaxpayer = option.vattaxpayer
        // initState.data.nsrsf = option.vattaxpayer
        return this.metaReducer.init(state, initState)
    }

    upload = (state, value) => {
        if (value){ state = this.metaReducer.sf(state, 'data.file', fromJS(value)) }
        state = this.metaReducer.sf(state, 'data.url', fromJS(''))
        return state
    }

    update = (state, {path, value}) => {
		return this.metaReducer.sf(state, path, fromJS(value))
	}
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({...option, metaReducer})

    return {...metaReducer, ...o}
}