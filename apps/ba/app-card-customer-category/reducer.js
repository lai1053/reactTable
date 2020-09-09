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
		let catResponse = response.catResponse,
			filter = response.filter;
		if (filter) {
			state = this.metaReducer.sf(state, 'data.filter', fromJS(filter));
			state = this.metaReducer.sf(state, 'data.expandedKeys', fromJS(filter.parentId));
		}
		if (catResponse) {
			let genTreeNode = {
				title:'全部',
				id: 'genid',
				key: "genid",
				name: "全部",
				baseArchiveType: 3000160001,
				isEnable: false,
				isLeaf: false,
				isReloadTree: false,
				level: 1,
			}
			let cats = this.getTreeNode(catResponse);
			if (cats && cats.length > 0) {
				genTreeNode.children = cats;
			} else {
				genTreeNode.children = [];
			}
			state = this.metaReducer.sf(state, 'data.other.tree', fromJS([genTreeNode]));
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

	getTreeNode = (list, pid=0, key) => {
		var tree = [];
		var temp;
		for (var i = 0; i < list.length; i++) {
			if (list[i].parentId == pid) {
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
