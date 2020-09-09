import React from 'react';
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
import debounce from 'lodash.debounce'
import { fromJS } from 'immutable';
import config from './config';
import extend from './extend';
import { Tree } from 'edf-component';

class action {
	constructor(option) {
		this.metaAction = option.metaAction;
		this.extendAction = option.extendAction;
		this.config = config.current;
		this.webapi = this.config.webapi;
		this.search = debounce(this.search, 800);
	}

	onInit = ({ component, injections }) => {
		this.extendAction.gridAction.onInit({ component, injections });
		this.component = component;
		this.injections = injections;
		this.VatTaxpayer = Object.assign({},this.metaAction.context.get('currentOrg') || {});
		this.VatTaxpayer.id = 'genid';
		injections.reduce('init');
		let addEventListener = this.component.props.addEventListener;
		if (addEventListener) {
			addEventListener('onTabFocus', :: this.load);
		}
		//获取appVersion
		let appVersion = this.component.props.appVersion
		if (!!appVersion) {
			this.metaAction.sf('data.appVersion', this.component.props.appVersion)
		}
		if (this.component.props.baseArchiveType){
			this.metaAction.sf('data.baseArchiveType',this.component.props.baseArchiveType)
		}
		this.load()
	};

	load = async (filter) => {
		let response,
			catResponse,
			isReloadTree = true;
		this.metaAction.sf('data.other.loading', true);
		let baseArchiveType = this.metaAction.gf('data.baseArchiveType')
		console.log(this.component.props.baseArchiveType,baseArchiveType)
		if (filter && !filter.id) return;
		if (filter) isReloadTree = filter.isReloadTree;
		let request = {
			baseArchiveType: baseArchiveType
		}
		if (isReloadTree) catResponse = await this.webapi.cat.query(request)
		if (!filter) {
			filter = {
				title:'全部',
				id: 'genid',
				key: "genid",
				name: "全部",
				baseArchiveType: baseArchiveType,
				isEnable: false,
				isLeaf: false,
				isReloadTree: false,
				level: 1,
			};
		}
		response = {
			catResponse,
			filter,
		};
		this.injections.reduce('load', response);
		this.metaAction.sf('data.other.loading', false);
	};

	search = () => this.load()

	refresh = (isReloadTree, id, isEndNode) => {
		const filter = this.metaAction.gf('data.filter')
			.toJS();
		console.log(filter)
		let option = filter;
		if (isReloadTree) option.isReloadTree = isReloadTree;
		if (isEndNode !== undefined) option.isEndNode = isEndNode;
		if (id) option = false;
		this.load(option);
	};

	heightCount = () => {
		let name = 'edfx-deptPers edfx-deptPersNoBorder';
		if (this.component.props.modelStatus && (this.component.props.modelStatus == 1)) {
			name = 'edfx-deptPers';
		}
		return name;
	};

	//展示树
	renderTreeNodes = (data) => {
		if (!data) return <div></div>;
		return data.map((item) => {
			if (item.children) {
				return (
					<Tree.TreeNode title={item.title} key={item.key} dataRef={item}>
						{this.renderTreeNodes(item.children)}
					</Tree.TreeNode>
				);
			}
			return <Tree.TreeNode {...item} dataRef={item}/>;
		});
	};

	//选择分类
	selectType = (selectedKeys, info) => {
		let key = info.selectedNodes[0] && info.selectedNodes[0].key || 'genid';
		this.metaAction.sfs({
			'data.treeSelectedKey': fromJS([key]),
			'data.catId': info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.id,
		})
		if (info.selected == false) {
			return false;
		}
		let parentId = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.parentId,
			baseArchiveType = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.baseArchiveType,
			isLeaf = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.isLeaf,
			isEnable = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.isEnable,
			id = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.id,
			code = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.code,
			name = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.name,
			level = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.level,
			ts = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.ts;
		
			let filter = {
				parentId: parentId,
				isEnable: isEnable,
				isReloadTree: false,
				id: id,
				baseArchiveType:baseArchiveType,
				isLeaf:isLeaf,
				level:level,
				code: code,
				name: name,
				ts: ts
			};
		this.load(filter);
	};

	
	//新增分类
	addCat = async () => {
		//埋点
		_hmt && _hmt.push(['_trackEvent', '基础档案', '分类设置', '右上角(+)']);
		const filter = this.metaAction.gf('data.filter')
			.toJS();
		let baseArchiveType = this.metaAction.gf('data.baseArchiveType')	 
		if (filter.id == 1) {
			this.metaAction.toast('warning', '该分类不能新增下级');
			return;
		}		
		let request = {
			baseArchiveType: filter.baseArchiveType ? filter.baseArchiveType : baseArchiveType,
			id: filter.id, 
			orgId:6960576031465472
		}
		let isUsed = await this.webapi.cat.isUsed(request)
		if (isUsed) {
			this.metaAction.toast('warning', '分类已被档案使用，无法新增下级');
			return;
		}

		const ret = await this.metaAction.modal('show', {
			title: '分类',
			className: 'edfx-deptPers-deptModal',
			wrapClassName: 'card-archive',
			width: 395,
			height: 290,
			children: this.metaAction.loadApp('app-card-customer-category-handle', {
				store: this.component.props.store,
				parentId: filter ? filter.id : '',
				baseArchiveType:filter.baseArchiveType ? filter.baseArchiveType : baseArchiveType
			})
		});
		if (ret) {
			this.refresh(true, undefined, false);
		}
	};

	//修改分类
	editCat = async () => {
		const filter = this.metaAction.gf('data.filter')
			.toJS();
		if (!filter.id) {
			this.metaAction.toast('warning', '请选择分类');
			return;
		}
		if (filter.id == 1 || filter.id =='genid') {
			this.metaAction.toast('warning', '该分类不能修改');
			return;
		}
		const ret = await this.metaAction.modal('show', {
			title: '分类',
			className: 'edfx-deptPers-deptModal',
			wrapClassName: 'card-archive',
			width: 395,
			height: 290,
			children: this.metaAction.loadApp('app-card-customer-category-handle', {
				store: this.component.props.store,
				id: filter ? filter.id : '',
				catName:filter ? filter.name : '',
				filter:filter ? filter : {},
				baseArchiveType: filter ? filter.baseArchiveType : '',
			})
		});
		if (ret) {
			this.metaAction.sf('data.filter.ts', fromJS(ret.ts));
			this.refresh(true);
		}
	};

	//删除分类
	delCat = async () => {
		//埋点
		_hmt && _hmt.push(['_trackEvent', '基础档案', '分类设置', '右上角(X)']);
		const filter = this.metaAction.gf('data.filter')
				.toJS();
		if (filter.id == 1 || filter.id =='genid') {
			this.metaAction.toast('warning', '该分类不能删除');
			return;
		}
		if (!filter.isLeaf) {
			this.metaAction.toast('warning', '已存在下级分类，无法删除');
			return;
		}
		if (filter && !filter.id) {
			this.metaAction.toast('warning', '请选择分类');
			return;
		}
		let request = {
			baseArchiveType: filter.baseArchiveType,
			id: filter.id, 
			orgId:6960576031465472
		}
		let isUsed = await this.webapi.cat.isUsed(request)
		if (isUsed) {
			this.metaAction.toast('warning', '该分类下已被档案使用，无法删除');
			return;
		}
		const ret = await this.metaAction.modal('confirm', {
			title: '删除',
			content: '确认删除？'
		});
		if (ret) {
			let response;
			response = await this.webapi.cat.delete({ 
				id: filter.id, 
				parentId:filter.parentId,
				baseArchiveType: filter.baseArchiveType 
			});
			if (response) {
				this.metaAction.toast('success', '删除成功');
				this.refresh(true, filter.id);
			}
		}
	};

}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...o };
	metaAction.config({ metaHandlers: ret });
	return ret;
}
