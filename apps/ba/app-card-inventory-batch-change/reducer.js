import { Map, List, fromJS } from 'immutable';
import { reducer as MetaReducer } from 'edf-meta-engine';
import { getInitState } from './data';

class reducer {
	constructor(option) {
		this.metaReducer = option.metaReducer;
	}

	init = (state) => {
		return this.metaReducer.init(state, getInitState());
	};

	load = (state, option) => {
		if (option.response) {
			if (option.response.dataList) {
				state = this.metaReducer.sf(state, 'data.other.property', fromJS(option.response.dataList));
			}
			if (option.response.detailList) {
				state = this.metaReducer.sf(state, 'data.other.propertyDetail', fromJS(option.response.detailList));
			}
		}
		return state;
	};

	propertyChange = (state, v, a) => {
		let propertyDetail = this.metaReducer.gf(state, 'data.other.propertyDetail')
				.toJS(),
			name,
			propertyArr = [];
		if (v.vatTaxpayer) {
			propertyDetail.forEach((data) => {
				if (propertyArr.filter((propertyArrData) => {return propertyArrData == data.propertyId;}).length == 0) {
					propertyArr.push(data.propertyId);
				}
			});
			if (propertyArr.filter((data) => {return data == v.id;}).length > 0) {
				let dataArr = a;
				state = this.metaReducer.sf(state, 'data.other.propertyDetailFilter', fromJS(a));
				state = this.metaReducer.sf(state, 'data.isProperty', fromJS(true));
			} else {
				state = this.metaReducer.sf(state, 'data.isProperty', fromJS(false));
			}
		}
		if (v.vatTaxpayer) {
			state = this.metaReducer.sf(state, 'data.form.property', fromJS(v));
			state = this.metaReducer.sf(state, 'data.form.propertyDetail', '');
		} else {
			state = this.metaReducer.sf(state, 'data.form.propertyDetail', fromJS(v));
		}
		return state;
	};
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		o = new reducer({ ...option, metaReducer });
	return { ...metaReducer, ...o };
}
