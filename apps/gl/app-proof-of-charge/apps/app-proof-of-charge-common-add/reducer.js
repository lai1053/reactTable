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

  	load = (state, certificateData, form) => {
		  state = this.metaReducer.sf(state, 'data.other.certificateData', fromJS(certificateData))
    	return this.metaReducer.sf(state, 'data.form', fromJS(form))
  	}
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}
