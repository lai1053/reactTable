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

	load = (state, option) => {
		if (option.category) {
			let genTreeNode = {
				title:'全部',
				id: '0',
				key: "genid",
				value:"",
				name: "全部",
				code:'',
				baseArchiveType: 3000160002,
				isEnable: false,
				isLeaf: false,
				isReloadTree: false,
				level: 1,
			}
			let cats = this.getTreeNode(option.category);
			if (cats && cats.length > 0) {
				genTreeNode.children = cats;
			} else {
				genTreeNode.children = [];
			}

            state = this.metaReducer.sf(state, 'data.other.category', fromJS(genTreeNode))
        }
		let value = option.data;
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
	glCats  = (state, option) => {
		let data = this.metaReducer.gf(state, 'data').toJS()
		if(!option.some((item)=> item.id == data.entity.categoryHierarchyCode)){
			state = this.metaReducer.sf(state, 'data.entity.categoryHierarchyCode', undefined)
		}
		let cats = this.getTreeNode(option);
		return state = this.metaReducer.sf(state, 'data.other.category', fromJS(cats))
	}

	selectRow = (state, rowIndex, checked) => {
		state = this.metaReducer.sf(state, `data.list.${rowIndex}.selected`, checked);
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
	getTreeNode = (list, pid=0, key) => {
		var tree = [];
		var temp;
		for (var i = 0; i < list.length; i++) {
			if (list[i].parentId == pid) {
				var obj = list[i];
				if (key != undefined && Number(key) != NaN) {
					obj.key = list[i].id;
				} else {
					obj.key = list[i].id;
				}
				temp = this.getTreeNode(list, list[i].id, i);
				if (temp.length > 0) {
					obj.children = temp;
				}
				obj.value = obj.code;
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
