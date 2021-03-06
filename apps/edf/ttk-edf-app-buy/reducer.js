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
		// state = this.metaReducer.sf(state, 'data.other.startTime', value.startTime);
		return state = this.metaReducer.sf(state, 'data.other.productList', value.list && fromJS(value.list));
	};

	packageSelect = (state, arr) => {
		state = this.metaReducer.sf(state, 'data.other.productPrice', arr.price);
		state = this.metaReducer.sf(state, 'data.other.productName', '金财管家-'+arr.name);
		return state = this.metaReducer.sf(state, 'data.form.productId', arr.id);
	};

	buyTimeChange = (state, key) => {
		return state = this.metaReducer.sf(state, 'data.form.timespan', key);
	};

	InvoiceChange = (state, key) => {
		let form = this.metaReducer.gf(state, 'data.form').toJS();
		form.orderInvoice.titleType = key;
		form.orderInvoice.title = '';
		form.orderInvoice.vatTaxpayerNum = '';
		return state = this.metaReducer.sf(state, 'data.form', fromJS(form));
	};

	invoiceSave = (state) => {
		return state = this.metaReducer.sf(state, 'data.other.invoiceType', !this.metaReducer.gf(state, 'data.other.invoiceType'));
	};
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer }),
		ret = { ...metaReducer, ...extendReducer.gridReducer, ...o };
	return { ...ret };
}
