import {Map, fromJS} from 'immutable'
import {reducer as MetaReducer} from 'edf-meta-engine'
import config from './config'
import {getInitState} from './data'

class reducer {
	constructor(option) {
		this.metaReducer = option.metaReducer
		this.config = config.current
	}

	init = (state, option) => {
		const initState = getInitState()
		return this.metaReducer.init(state, initState)
	}

	load = (state, option) => {
		if (option.response) {
			if (option.response) {
				if (Object.keys(option.response).length == 0) {
					option.response.isEnable = true
					state = this.metaReducer.sf(state, 'data.form', fromJS(option.response))
					state = this.metaReducer.sf(state, 'data.form.bankAccountType.id', '')
				} else {
					state = this.metaReducer.sf(state, 'data.form', fromJS(option.response))
				}
			}
			// state = this.metaReducer.sf(state, 'data.form', fromJS(option.response))
			if (option.response.bankAccountTypeId) {
				state = this.metaReducer.sf(state, 'data.form.bankAccountType', fromJS({
					id: option.response.bankAccountTypeId,
					name: option.response.bankAccountTypeName
				}))
			}
		}
		state = this.metaReducer.sf(state, 'data.other.haveMonthlyClosing', fromJS(option.haveMonthlyClosing))
		if (option.code) {
			state = this.metaReducer.sf(state, 'data.form.code', fromJS(option.code))
		}
		if (option.accountAttr) {
			state = this.metaReducer.sf(state, 'data.other.bankAccountType', fromJS(option.accountAttr))
		}
		if (option.enabledTime) {
			state = this.metaReducer.sf(state, 'data.form.earlyMonths', fromJS(option.enabledTime))
		}
		if (option.glAccounts) {
			state = this.metaReducer.sf(state, 'data.other.glAccounts', fromJS(option.glAccounts))
		}
		return state
	}

    glAccounts = (state, option) => {
        let data = this.metaReducer.gf(state, 'data').toJS()
        state = this.metaReducer.sf(state, `data.form.${option.str}`, option.addItem.id)
        return state = this.metaReducer.sf(state, 'data.other.glAccounts', fromJS(option.glAccounts))
    }

    codeChange = (state, code) => {
        return state = this.metaReducer.sf(state, 'data.form.code', code)
    }
    beginningBalance = (state, code) => {
        return state = this.metaReducer.sf(state, 'data.form.beginningBalance', code)
    }
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		o = new reducer({...option, metaReducer})
	return {...metaReducer, ...o}
}
