import {Map, List, fromJS} from 'immutable'
import {reducer as MetaReducer} from 'edf-meta-engine'
import config from './config'
import {getInitState} from './data'

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
    }

    init = (state) => {
        return this.metaReducer.init(state, getInitState())
    }

    load = (state, option, props) => {
        console.log("////////////////////////////////");
        //console.table(option.response);
        //console.log("1111111111::::"+option.response);
        console.table(props);
        console.log("////////////////////////////////");
        if (option.response) {
           
            if (option.response.property) {
                let propertyName;
                option.response.attribute = {
                    //id: option.response.property,
                    id: option.response.id,
                    name: propertyName
                }
            }
            state = this.metaReducer.sf(state, 'data.form', fromJS(option.response))
        }else {
            let obj = {}
            if(props.propertyName){
                obj.attribute = {
                    //id: props.property,
                    id: props.id,
                    name: props.propertyName
                }
             }
            state = this.metaReducer.sf(state, 'data.form', fromJS(obj))
        }

        return state
    }
    
    //更新状态
    update = (state, path, value) => {
		state = this.metaReducer.sf(state, path, value);
		return state;
	};

    updateObj = (state,obj) => {
        return this.metaReducer.sfs(state,obj)
    }

    updateSingle = (state,path,value) => {
        return this.metaReducer.sf(state,path,value)
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({...option, metaReducer})

    return {...metaReducer, ...o}
}