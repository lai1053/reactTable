import {fromJS} from 'immutable'
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
    load = (state, res) => {   
        // if(res.queryData.dots.length==0){
        //     res.queryData.dots.push({
        //         summaryNum:'',
		// 		summary: '',
		// 		accountId:'',
		// 		proportion:'0', 
        //     })
        // }
        // state = this.metaReducer.sf(state, 'data.isDisabled', fromJS(res.isDisabled))
        state = this.metaReducer.sf(state, 'data.list', fromJS(res.queryData.rateList))
        state = this.metaReducer.sf(state, 'data.calcMode', fromJS(Number(res.queryData.calcMode)))//计提方式
        state = this.metaReducer.sf(state, 'data.isAccountedMonth', fromJS(res.isAccountedMonth))
        return state
    }    
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({...option, metaReducer})
    return {...metaReducer, ...o}
}