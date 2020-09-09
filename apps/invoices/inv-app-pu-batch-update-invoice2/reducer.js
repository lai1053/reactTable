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

  //修改单条数据
  update = (state, path, v) => {
    return this.metaReducer.sf(state, path, fromJS(v))
  }

  updateSfs = (state, obj) => {
    return this.metaReducer.sfs(state, obj)
  }
}

export default function creator(option) {
  const metaReducer = new MetaReducer(option),
    o = new reducer({ ...option, metaReducer })

  return { ...metaReducer, ...o }
}
