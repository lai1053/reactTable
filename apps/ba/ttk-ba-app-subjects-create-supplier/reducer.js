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
        return state = this.metaReducer.sfs(state, {
            'data.other': fromJS(value.other),
            'data.list': fromJS(value.glArr),
        })
	};

	dataChange = (state, data) => {
		return state = this.metaReducer.sf(state, 'data', fromJS(data));
	};

    subjectChange = (state, glArr, subjectChecked) => {
        state = this.metaReducer.sf(state, 'data.list', fromJS(glArr));
		return state = this.metaReducer.sf(state, 'data.form.specification', fromJS(subjectChecked));
	};

    selectRow = (state, indexArr, checked) => {
        indexArr.forEach(function (rowIndex) {
            state = this.metaReducer.sf(state, `data.list.${rowIndex}.selected`, checked);
        }.bind(this))
        return state;
    };
    unitChange = (state, indexArr, id) => {
        indexArr.forEach(function (rowIndex) {
            state = this.metaReducer.sf(state, `data.list.${rowIndex}.unitId`, id);
        }.bind(this))
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
