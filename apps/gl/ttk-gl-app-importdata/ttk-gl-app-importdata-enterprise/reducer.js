import { Map, fromJS } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'
import { consts } from 'edf-consts'
import moment from 'moment'
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
        return state
    }
    setContent = (state, name, appName, appProps) => {   
        // debugger
        const currContent = this.metaReducer.gf(state, 'data.content')
        const appList = this.metaReducer.gf(state, 'data.other.appList')
        //判断当前显示appName和要新打开的是否一致
        // if (currContent && appName == currContent.get('appName')) {
        //     state = this.metaReducer.sf(state, 'data.content', currContent)
        //     return state
        // }        
        const res = appList.filter((element) => {
            let item = element.toJS()
            return item && item.appName == appName
        })
        let step
        if (res && res.size > 0) {
            step = res.first().get('step')           
        }       
        let content = fromJS({ name, appName, appProps, editing: false, step: step, stepstatu: status })
        state = this.metaReducer.sf(state, 'data.content', content)
        return state
    }
    reInitContent = (state, value) => {
        return this.metaReducer.sf(state, 'data.stepContent', fromJS(value))
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })
    return { ...metaReducer, ...o }
}