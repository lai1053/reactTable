import { Map, fromJS, List } from 'immutable';
import { tree } from 'edf-utils';
import { reducer as MetaReducer } from 'edf-meta-engine';
import config from './config';
import extend from './extend';
import { getInitState } from './data';

class reducer {
    constructor(option) {
        this.metaReducer = option.metaReducer
        this.config = config.current
    }

    init = (state, option) => {
        const initState = getInitState()
        return this.metaReducer.init(state, initState)
    }
	load = (state,list,stockPeriod) => {
		if(list&&list.length>0){
			state = this.metaReducer.sf(state, 'data.list', fromJS(list));

		}else{
			state = this.metaReducer.sf(state, 'data.list', fromJS([]));

        }
        let name=this.metaReducer.context.get('currentOrg').name
		state = this.metaReducer.sf(state, 'data.form.enableDate',stockPeriod);
		return state;
    };
    reload= (state,list) => {
		if(list&&list.length>0){
			state = this.metaReducer.sf(state, 'data.list', fromJS(list));

		}else{
			state = this.metaReducer.sf(state, 'data.list', fromJS([]));

		}
		return state;
    };
    modifyContent = (state) => {
        const content = this.metaReducer.gf(state, 'data.content')
        return this.metaReducer.sf(state, 'data.content', content + '!')
    }
    updateSfs = (state,option)=>{
        return this.metaReducer.sfs(state, option)
    }
}

export default function creator(option) {
    const metaReducer = new MetaReducer(option),
        o = new reducer({ ...option, metaReducer })

    return { ...metaReducer, ...o }
}