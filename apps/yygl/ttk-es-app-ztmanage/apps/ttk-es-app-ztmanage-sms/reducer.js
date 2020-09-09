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

	load = (state, option) => {
		// if(option.response) {
		// 	state = this.metaReducer.sf(state, 'data.form', fromJS(option.response))
        // }
        // console.log(option.mobile);
		if(option.mobile) {
            // console.log("mobile:::"+option.mobile);
			state = this.metaReducer.sf(state, 'data.form.mobile', fromJS(option.mobile))
		}
		return state
    }
    
    update = (state, {path, value}) => {
		return this.metaReducer.sf(state, path, fromJS(value))
    }
    
    initImageCode = (state, option) => {
        state = this.metaReducer.sf(state, 'data.other.imgCode', fromJS(option.captcha))
        state = this.metaReducer.sf(state, 'data.other.sign', fromJS(option.sign))
        return state
    }

    // modifyContent = (state) => {
    //     const content = this.metaReducer.gf(state, 'data.content')
    //     return this.metaReducer.sf(state, 'data.content', content + '!')
    // }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}
