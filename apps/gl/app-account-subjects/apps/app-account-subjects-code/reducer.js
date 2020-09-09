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
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }

    // modifyContent = (state) => {
    //     const content = this.metaReducer.gf(state, 'data.content')
    //     return this.metaReducer.sf(state, 'data.content', content + '!')
    // }

    updateDate = (state, name, value) => {
        return this.metaReducer.sf(state, name, value)
    }
    updateGrade = (state, option) => {
        let newOption = []
        for(let key in option){
            newOption.push({
                [key]: option[key]
            })
        }
        newOption.map(item => {
           state = this.metaReducer.sf(state,`data.form.${Object.keys(item)[0]}`, item[Object.keys(item)[0]])
        })
        return state
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}