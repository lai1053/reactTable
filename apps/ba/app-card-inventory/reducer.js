import { Map, fromJS } from 'immutable';
import { reducer as MetaReducer } from 'edf-meta-engine';
import config from './config';
import { getInitState } from './data';
import { consts } from 'edf-consts';

class reducer {
	constructor(option) {
		this.metaReducer = option.metaReducer;
		this.config = config.current;
	}

	init = (state, option) => {
		const initState = getInitState();
		return this.metaReducer.init(state, initState);
	};

	load = (state, option) => {
		if (option.response) {
			let obj = Object.keys(option.response);
			if (obj.includes('propertyId')) {
				option.queryData.dataList.filter((data) => {
					if (data.id == option.response.propertyId) {
						option.response.property = data;
					}
				});
				if (option.queryData && option.queryData.detailList) {
					let a = option.queryData.detailList.filter((data) => {
						return option.response.propertyId == data.propertyId;
					});
					state = this.metaReducer.sf(state, 'data.other.propertyDetailFilter', fromJS(a));
				}
			}
			if (obj.includes('propertyDetail')) {
				option.queryData.detailList.filter((data) => {
					if (data.id == option.response.propertyDetail) {
						option.response.propertyDetail = data;
					}
				});
				state = this.metaReducer.sf(state, 'data.isProperty', fromJS(true));
			}
			if (obj.includes('unitId')) {
				option.response.unit = {
					id: option.response.unitId,
					name: option.response.unitName
				};
			}
			if (obj.includes('rate')) {
				option.response.rate = {
					id: option.response.rate,
					name: option.response.rateName
				};
			}
			if (obj.includes('revenueType')) {
				option.response.revenueType = {
					id: option.response.revenueType
					// name: option.response.revenueType
				};
			}
			if (Object.keys(option.response).length == 0) {
				option.response.isEnable = true;
				state = this.metaReducer.sf(state, 'data.form', fromJS(option.response));
			} else {
				state = this.metaReducer.sf(state, 'data.form', fromJS(option.response));
			}
            state = this.metaReducer.sf(state, 'data.formCopy', fromJS(option.response));
		}
		if (option.code) {
			state = this.metaReducer.sf(state, 'data.form.code', fromJS(option.code));
		}
		if (option.queryData) {
			if (option.queryData.dataList) {
				state = this.metaReducer.sf(state, 'data.other.property', fromJS(option.queryData.dataList));
			}
			if (option.queryData.detailList) {
				state = this.metaReducer.sf(state, 'data.other.propertyDetail', fromJS(option.queryData.detailList));
			}
			if (option.queryData.rateList) {
				state = this.metaReducer.sf(state, 'data.other.rate', fromJS(option.queryData.rateList));
			}
			if (option.queryData.unitList) {
				state = this.metaReducer.sf(state, 'data.other.unit', fromJS(option.queryData.unitList));
			}
			if (option.queryData.revenueType) {
				state = this.metaReducer.sf(state, 'data.other.revenueType', fromJS(option.queryData.revenueType));
			}
		}
		if (option.taxCode) {
			state = this.metaReducer.sf(state, 'data.taxCode', fromJS(option.taxCode));
		}
		if (option.inventoryIsUsed) {
			state = this.metaReducer.sf(state, 'data.other.inventoryIsUsed', option.inventoryIsUsed);
		}
		if (option.queryByparamKeys) {
			state = this.metaReducer.sf(state, 'data.queryByparamKeys', fromJS(option.queryByparamKeys));
		}
		return state;
	};

	glAccounts = (state, value) => {
		return state = this.metaReducer.sf(state, 'data.glAccounts', fromJS(value));
	};
	glAccountsChange = (state, arg) => {
		// if(arg.str == 'salesCostAccountId'){
		// 	state = this.metaReducer.sf(state, `data.form.inventoryRelatedAccountId`, '')
		// }else if(arg.str == 'inventoryRelatedAccountId'){
		// 	state = this.metaReducer.sf(state, `data.form.salesCostAccountId`, '')
		// }
        let data = this.metaReducer.gf(state, 'data').toJS()
        let status = {
            inventoryRelatedAccountStatus: true,
            salesCostAccountStatus: true,
        }
        arg.glAccounts.forEach(function(dataObj){
            if(dataObj.id == data.form.inventoryRelatedAccountId){
                status.inventoryRelatedAccountStatus = false
            }
            if(dataObj.id == data.form.salesCostAccountId){
                status.salesCostAccountStatus = false
            }
        })
        if(status.inventoryRelatedAccountStatus == true){
            state = this.metaReducer.sf(state, 'data.form.inventoryRelatedAccountId', '')
        }
        if(status.salesCostAccountStatus == true){
            state = this.metaReducer.sf(state, 'data.form.salesCostAccountId', '')
        }
		state = this.metaReducer.sf(state, `data.form.${arg.str}`, arg.addItem.id)
		return state = this.metaReducer.sf(state, 'data.glAccounts', fromJS(arg.glAccounts));
	};

	unit = (state, list, select) => {
		state = this.metaReducer.sf(state, 'data.other.unit', fromJS(list));
		state = this.metaReducer.sf(state, 'data.form.unit', fromJS(select));
		return state;
	};
	revenueType = (state, list, select) => {
		state = this.metaReducer.sf(state, 'data.other.revenueType', fromJS(list));
		state = this.metaReducer.sf(state, 'data.form.revenueType', fromJS(select));
		return state;
	};

	propertyChange = (state, v, a, revenueTypeChange) => {
		let rateList = this.metaReducer.gf(state, 'data.other.rate'),
			propertyDetail = this.metaReducer.gf(state, 'data.other.propertyDetail')
				.toJS(),
			revenueType = this.metaReducer.gf(state, 'data.other.revenueType')
				.toJS(),
			name,
			propertyArr = [];
		if (v.vatTaxpayer) {
			propertyDetail.forEach((data) => {
				if (propertyArr.filter((propertyArrData) => {
					return propertyArrData == data.propertyId;
				}).length == 0) {
					propertyArr.push(data.propertyId);
				}
			});
			if (propertyArr.filter((data) => {
				return data == v.id;
			}).length > 0) {
				let dataArr = a;
				state = this.metaReducer.sf(state, 'data.other.propertyDetailFilter', fromJS(a));
				state = this.metaReducer.sf(state, 'data.isProperty', fromJS(true));
			} else {
				state = this.metaReducer.sf(state, 'data.isProperty', fromJS(false));
			}
		}
		name = `${v.rate}%`;
		if (rateList) {
			rateList.toJS()
				.map(item => {
					if (item.name == name) {
						state = this.metaReducer.sf(state, 'data.form.rate', fromJS(item));
					}
				});
		}
		if (v.vatTaxpayer) {
			state = this.metaReducer.sf(state, 'data.form.property', fromJS(v));
			state = this.metaReducer.sf(state, 'data.form.propertyDetail', '');
		} else {
			state = this.metaReducer.sf(state, 'data.form.propertyDetail', fromJS(v));
		}
		if (revenueTypeChange) {
			let revenueTypeData = revenueType.filter(function (data) {
				return data.id == v.revenueType;
			})[0];
			state = this.metaReducer.sf(state, 'data.form.revenueType', fromJS(revenueTypeData));
		}
		state = this.metaReducer.sf(state, 'data.form.taxClassificationId', '');
		state = this.metaReducer.sf(state, 'data.form.taxClassificationName', '');
		return state;
	};
	taxCodeLoad = (state, taxCode, value) => {
		if (taxCode.data && value) {
			state = this.metaReducer.sf(state, 'data.taxCode.data', fromJS(taxCode.data));
		} else {
			if (taxCode.data) {
				if (taxCode.data.length > 500) {
					state = this.metaReducer.sf(state, 'data.taxCode.data', fromJS(taxCode.data.splice(0, 500)));
				} else {
					state = this.metaReducer.sf(state, 'data.taxCode.data', fromJS(taxCode.data));
				}
			}
		}
		state = this.metaReducer.sf(state, 'data.taxCode.fetching', fromJS(taxCode.fetching));
		return state;
	};
	taxCodeChange = (state, code) => {
		if (code) {
			let str = code.split(',');
			state = this.metaReducer.sf(state, 'data.form.taxClassificationId', fromJS(str[1]));
			state = this.metaReducer.sf(state, 'data.form.taxClassificationName', fromJS(str[0]));
		} else {
			state = this.metaReducer.sf(state, 'data.form.taxClassificationId', fromJS(''));
			state = this.metaReducer.sf(state, 'data.form.taxClassificationName', fromJS(''));
		}
		return state;
	};
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		o = new reducer({ ...option, metaReducer });

	return { ...metaReducer, ...o };
}
