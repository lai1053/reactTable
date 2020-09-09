import { Map } from 'immutable'
import { reducer as MetaReducer } from 'edf-meta-engine'
import config from './config'
import { getInitState } from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()   // 初始化数据放在reducer这里初始化
        if(option){
            // 将app上的props,合并到state上
            initState.data = Object.assign(initState.data,option)
        }
        return this.metaReducer.init(state, initState)
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