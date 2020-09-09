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

	// load = (state, response) => {
	// 	state = this.metaReducer.sf(state, 'data.other.tree', response.tree)
	// 	state = this.metaReducer.sf(state, 'data.treeSelectedKey', response.treeSelectedKey)
	// 	return state;
	// };

	load = (state, data) => {
		if (data && data.list) {
			const {list, page} = data
			state = this.metaReducer.sf(state, 'data.list', fromJS(list))
			state = this.metaReducer.sf(state, 'data.pagination', fromJS(page))

			// if (skssq) {
			//     state = this.metaReducer.sf(state, 'data.nsqj', moment(skssq, 'YYYY-MM'))
			// }
		}

		return state
	}
	
    update = (state, { path, value }) => {
        return this.metaReducer.sf(state, path, fromJS(value))
	}
	tableLoading = (state, value) => {
		return this.metaReducer.sf(state, 'data.loading', value)
	}
	
	tableSettingVisible = (state, { value, data }) => {
        state = this.metaReducer.sf(state, 'data.showTableSetting', value)
        return state
    }

}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer }),
		ret = { ...metaReducer, ...extendReducer.gridReducer, ...o };
	return { ...ret };
}
