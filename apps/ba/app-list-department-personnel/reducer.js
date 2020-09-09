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
		let deptResponse = response.deptResponse,
			persResponse = response.persResponse,
			filter = response.filter,
			user = response.user,
			list = [],
			VatTaxpayer = Object.assign({},response.VatTaxpayer);
		state = this.metaReducer.sf(state, 'data.user', fromJS(user));
		if (response.roleResponse) {
			state = this.metaReducer.sf(state, 'data.roles', fromJS(response.roleResponse));
		}
		if (filter) {
			state = this.metaReducer.sf(state, 'data.filter', fromJS(filter));
			state = this.metaReducer.sf(state, 'data.expandedKeys', fromJS(filter.parentId));
		}
		if (deptResponse && deptResponse.list) {
			let departments = this.getTreeNode(deptResponse.list);
			VatTaxpayer.title = VatTaxpayer.name;
			VatTaxpayer.key = 'genid';
			if (departments && departments.length > 0) {
				VatTaxpayer.children = departments;
			} else {
				VatTaxpayer.children = [];
			}
			state = this.metaReducer.sf(state, 'data.other.tree', fromJS([VatTaxpayer]));
		}

		if (persResponse && persResponse.list) {
			state = this.metaReducer.sf(state, 'data.list', fromJS(persResponse.list));
			if (persResponse.list.length) {
				state = this.metaReducer.sf(state, 'data.isDelDept', fromJS(false));
			} else {
				state = this.metaReducer.sf(state, 'data.isDelDept', fromJS(true));
			}
			if (response.isCreater) {
				state = this.metaReducer.sf(state, 'data.isCreater', fromJS(response.isCreater));
			}
		}
		if (persResponse && persResponse.page) {
			let page = {
				current: persResponse.page.currentPage,
				total: persResponse.page.totalCount,
				pageSize: persResponse.page.pageSize
			};
			state = this.metaReducer.sf(state, 'data.pagination', fromJS(page));
		}
		if (response.isDeptCreaterStatus) {
			state = this.metaReducer.sf(state, 'data.status.isDeptCreater', fromJS(response.isDeptCreaterStatus.status));
		}

		return state;
	};

	treeKey = (state, data) => {
		state = this.metaReducer.sf(state, `data.expandedKeys`, data);
		return state;
	};

	selectAll = (state, checked, gridName) => {
		state = this.extendReducer.gridReducer.selectAll(state, checked, gridName);
		return state;
	};

	enable = (state, res, index) => {
		if (res) {
			state = this.metaReducer.sf(state, `data.list.${index}`, fromJS(res));
		}
		return state;
	};

	selectRow = (state, rowIndex, checked) => {
		state = this.metaReducer.sf(state, `data.list.${rowIndex}.selected`, checked);
		return state;
	};

	getTreeNode = (list, pid, key) => {
		var tree = [];
		var temp;
		for (var i = 0; i < list.length; i++) {
			if (list[i].pid == pid) {
				var obj = list[i];
				if (key != undefined && Number(key) != NaN) {
					obj.key = key + '-' + i;
				} else {
					obj.key = i;
				}
				temp = this.getTreeNode(list, list[i].id, i);
				if (temp.length > 0) {
					obj.children = temp;
				}
				obj.title = obj.name;
				tree.push(obj);
			}
		}
		return tree;
	};
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer }),
		ret = { ...metaReducer, ...extendReducer.gridReducer, ...o };
	return { ...ret };
}
