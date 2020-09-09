import {Map, List, fromJS} from 'immutable'
import {reducer as MetaReducer} from 'edf-meta-engine'
import config from './config'
import moment from 'moment'
import {getInitState} from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state) => {
        return this.metaReducer.init(state, getInitState())
    }

    load = (state, option) => {
        if (option.response) {
           
            if (Object.keys(option.response).length == 0) {
                option.response.isEnable = true
                state = this.metaReducer.sf(state, 'data.form', fromJS(option.response))
            } else {
                state = this.metaReducer.sf(state, 'data.form', fromJS(option.response))
            }
            
            //岗位类型
            if (option.response.property) {
                let propertyName;
                option.roleAttr.forEach(dep => { if (dep.id == option.response.property) { propertyName = dep.name; return }})

                option.response.postType = {
                    id: option.response.property,
                    name: propertyName
                }
            }
            state = this.metaReducer.sf(state, 'data.form', fromJS(option.response))
        }
        if (option.roleAttr) {
            state = this.metaReducer.sf(state, 'data.other.postTypes', fromJS(option.roleAttr))
        }
        return state
    }

    setproject = (state, project) => {
        state = this.metaReducer.sf(state, 'data.form', fromJS(project))
        return state
    }


}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({...option, metaReducer})

    return {...metaReducer, ...o}
}