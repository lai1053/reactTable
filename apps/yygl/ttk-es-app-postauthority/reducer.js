import { Map, fromJS, List } from 'immutable';
import { tree } from 'edf-utils';
import { reducer as MetaReducer } from 'edf-meta-engine';
import config from './config';
import extend from './extend';
import { getInitState } from './data';

class reducer {
	constructor(option) {
		this.metaReducer = option.metaReducer;
		this.extendReducer = option.extendReducer;
		this.config = config.current;
	}

	init = (state, option) => {
		return this.metaReducer.init(state, getInitState());
	};

	load = (state, response) => {
		// state = this.metaReducer.sf(state, 'data.other.gl', fromJS(response.menu.gl || []))
		// state = this.metaReducer.sf(state, 'data.other.dh', fromJS(response.menu.dh || []))
		// state = this.metaReducer.sf(state, 'data.other.plat', fromJS(response.menu.plat||[]))
		state = this.metaReducer.sfs(state, {
			'data.other.tree': response.tree || fromJS([]),
			'data.other.oldData': response.oldData || fromJS([]),
			'data.treeSelectedKey': response.treeSelectedKey || fromJS([]),
			'data.treeExpandedKeys': response.treeExpandedKeys || fromJS([]),
			'data.activeKey': response.activeKey || fromJS([]),
			'data.tabShadowVisible': !response.tabShadowVisible
		})
		return state;
	};

	update = (state, response) => {
		state = this.metaReducer.sfs(state, {
			'data.other.gl': fromJS(response.gl || []),
			'data.other.dh': fromJS(response.dh || []),
			'data.other.plat': fromJS(response.plat||[]),
			'data.other.glCopy': fromJS(response.gl || []),
			'data.other.dhCopy': fromJS(response.dh || []),
			'data.other.platCopy': fromJS(response.plat||[])
		})
		return state;
	}

	updateObj = (state,obj) => {
		return this.metaReducer.sfs(state,obj)
	}

	updateSingle = (state,path,value) => {
		return this.metaReducer.sf(state,path,value)
	}

}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer }),
		ret = { ...metaReducer, ...extendReducer.gridReducer, ...o };
	return { ...ret };
}
