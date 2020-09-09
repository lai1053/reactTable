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
			deptListResponse = response.deptListResponse,
			filter = response.filter,
			user = response.user,
			list = [],
			VatTaxpayer = Object.assign({},response.VatTaxpayer);
			//console.log("VatTaxpayer:::"+VatTaxpayer);
			console.table(VatTaxpayer);
		state = this.metaReducer.sf(state, 'data.user', fromJS(user));
		console.log(".......................");
		console.table(filter);
		console.log(".......................");

		if (filter) {
			state = this.metaReducer.sfs(state, {
				'data.filter': fromJS(filter),
				'data.expandedKeys': fromJS(filter.parentId)
			});
		}
		if (deptResponse && deptResponse.list) {
			console.log(deptResponse.list+"listlist")
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

		if (deptListResponse && deptListResponse.list) {
			if (deptListResponse.list.length) {
				state = this.metaReducer.sfs(state, {
					'data.list': fromJS(deptListResponse.list),
					'data.isDelDept': fromJS(false)
				});
			} else {
				state = this.metaReducer.sfs(state, {
					'data.list': fromJS(deptListResponse.list),
					'data.isDelDept': fromJS(true)
				});
			}
			// if (response.isCreater) {
			// 	state = this.metaReducer.sf(state, 'data.isCreater', fromJS(response.isCreater));
			// }
		}
		if (deptListResponse && deptListResponse.page) {
			let page = {
				current: deptListResponse.page.currentPage,
				total: deptListResponse.page.totalCount,
				pageSize: deptListResponse.page.pageSize
			};
			state = this.metaReducer.sf(state, 'data.pagination', fromJS(page));
		}
		// if (response.isDeptCreaterStatus) {
		// 	state = this.metaReducer.sf(state, 'data.status.isDeptCreater', fromJS(response.isDeptCreaterStatus.status));
		// }

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

	updateObj = (state,obj) => {
		return this.metaReducer.sfs(state,obj)
	}

	updateSingle = (state,path,value) => {
		return this.metaReducer.sf(state,path,value)
	}

	updateLoading = (state,value) => {
		return this.metaReducer.sf(state,'data.other.loading',value)
	}
}

export default function creator(option) {
	const metaReducer = new MetaReducer(option),
		extendReducer = extend.reducerCreator({ ...option, metaReducer }),
		o = new reducer({ ...option, metaReducer, extendReducer }),
		ret = { ...metaReducer, ...extendReducer.gridReducer, ...o };
	return { ...ret };
}
