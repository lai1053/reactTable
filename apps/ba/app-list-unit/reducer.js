import { Map, fromJS } from 'immutable';
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
		const initState = getInitState();
		return this.metaReducer.init(state, initState);
	};

	load = (state, value) => {
		if (value && value.list) {
			state = this.metaReducer.sf(state, 'data.list', fromJS(value.list));
		}
		if (value && value.page) {
			let page = {
				current: value.page.currentPage,
				total: value.page.totalCount,
				pageSize: value.page.pageSize
			};
			state = this.metaReducer.sf(state, 'data.pagination', fromJS(page));
		}
		return state;
	};

	selectRow = (state, rowIndex, checked) => {
		state = this.metaReducer.sf(state, `data.list.${rowIndex}.selected`, checked);
		return state;
	};

	selectAll = (state, checked, gridName) => {
		state = this.extendReducer.gridReducer.selectAll(state, checked, gridName);
		return state;
	};
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer }),
		ret = { ...metaReducer, ...extendReducer.gridReducer, ...o };

	return { ...ret };
}
