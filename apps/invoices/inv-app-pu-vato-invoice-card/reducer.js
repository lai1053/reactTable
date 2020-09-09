import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import extend from './extend'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }



    addRowBefore = (state, gridName, rowIndex) => {
        let lst = this.metaReducer.gf(state, 'data.error.mxDetailList')
        lst = lst.insert(rowIndex + 1, Map({}));
        state = this.metaReducer.sf(state, `data.error.mxDetailList`, lst)
        return state
    }
    delRowBefore = (state, gridName, rowIndex) => {
        state = this.metaReducer.sf(state, `data.error.mxDetailList.${rowIndex}`,fromJS({}))
        return state
    } 
    //修改单条数据
    update = (state, path, v) => {
        return this.metaReducer.sf(state, path, fromJS(v))
    }
    updateSfs = (state, options) => {
        return this.metaReducer.sfs(state, options)
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        extendReducer = extend.reducerCreator({ ...option, metaReducer }),
        o = new reducer({ ...option, metaReducer, extendReducer })

    return { ...metaReducer, ...extendReducer.gridReducer, ...o }
}