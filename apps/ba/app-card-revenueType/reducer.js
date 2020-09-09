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
		if (value && value.revenueType) {
			state = this.metaReducer.sf(state, 'data.other.revenueType', fromJS(value.revenueType));
		}
		if (value && value.inventory) {
			value.inventory.forEach((inventoryData) => {
				if (inventoryData.name == '原材料') {
					inventoryData.disabled = true
				}
			});
			state = this.metaReducer.sf(state, 'data.other.inventory', fromJS(value.inventory));
		}
		if (value && value.revenueType && value.inventory) {
			let inventory,
				revenue;
			value.inventory.forEach((inventoryData) => {
				if (inventoryData.name == '原材料') {
					inventoryData.disabled = true
					inventory = inventoryData;
				}
			});
			value.revenueType.forEach((revenueData) => {
				if (revenueData.id == inventory.revenueType) {
					revenue = revenueData.name;
				}
			});
			state = this.metaReducer.sf(state, 'data.form.details.0.id', inventory.id);
			state = this.metaReducer.sf(state, 'data.form.details.0.name', inventory.name);
			state = this.metaReducer.sf(state, 'data.form.details.0.defaultRevenueType', fromJS(revenue));
		}
		return state;
	};

	dataChange = (state, data) => {
		return state = this.metaReducer.sf(state, 'data', fromJS(data));
	};

	addRowBefore = (state, gridName, rowIndex) => {
		return state;
	};

	delRowBefore = (state, gridName, rowIndex) => {
		let data = this.metaReducer.gf(state, 'data').toJS()
		data.other.inventory.forEach((inventoryData) => {
			if(inventoryData.id == data.form.details[rowIndex].id){
				inventoryData.disabled = false
			}
		});
		return state = this.metaReducer.sf(state, 'data', fromJS(data));
	};
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer }),
		ret = { ...metaReducer, ...extendReducer.gridReducer, ...o };

	return { ...ret };
}
