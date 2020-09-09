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
		this.VatTaxpayer.id = 'genid';//初始化ID
		injections.reduce('init');
		let addEventListener = this.component.props.addEventListener;
		if (addEventListener) {
			addEventListener('onTabFocus', :: this.load);
		}
 
		this.load(this.metaAction.gf('data.pagination')
			.toJS());
	};

	load = async (page, filter) => {
		//console.log('.....',filter)
		let response,
			deptResponse,
			deptListResponse,
			isReloadTree = true,
			isCreater;
		this.injections.reduce('updateLoading', true)
		if (filter && !filter.id) return;
		if (filter) isReloadTree = filter.isReloadTree;
		//if (isReloadTree) deptResponse = await this.webapi.dept.departList();//部门树

		//-------------左侧部门树形菜单begin----------------------
		let department = await this.webapi.dept.departList();//部门树

		if(department.list.length == 0) {
			this.metaAction.toast('warning', '对不起，您无查看部门管理的相关信息，请与您的系统管理员联系')
		}

		for(var i = 0;i<department.list.length;i++) {
			department.list[i].key = department.list[i].id
			department.list[i].title = department.list[i].name
		}

		//let departments = this.getTreeNode(department.list,'0');
		let departments = this.getTreeNode(department.list,department.list[0].pid);
		
		let arr = [], a = {
			code: '',
			id: this.metaAction.context.get("currentOrg").id,
			key: "genid",
			name: this.metaAction.context.get("currentOrg").name,
			title: this.metaAction.context.get("currentOrg").name,
		}
		arr.push(a)
		a.children = departments
		this.injections.reduce('updateSingle', 'data.other.tree',fromJS(departments))
        //----------------------左侧部门树形菜单end----------------------

		if (!(page && page['currentPage'])) {
			page = this.metaAction.gf('data.pagination').toJS();
		}
		let option = {
			page: {
				'currentPage': page.currentPage || page.current,
				'pageSize': page.pageSize
			}
		};
		if (filter && filter.parentId) {
			option.entity = { hierarchyCode: filter.code };
		} else if (!filter || !filter.grade) {
			filter = {
				type: 0,
				isEndNode: false,
				parentId: this.VatTaxpayer.id,
				id: this.VatTaxpayer.id,
				grade: 0
			};
		}
		let entity = {
			fuzzyCondition:this.metaAction.gf('data.entity.fuzzyCondition')
		}
		if (filter.grade === 0) {
			let departCode = this.metaAction.gf('data.departCode')
			let departmentId = this.metaAction.gf('data.departId')
			let optionPage = {
				page: {
					'currentPage': page.currentPage || page.current,
					'pageSize': page.pageSize
				},
				entity
			};
			if(departmentId && departmentId != 'genid') optionPage.entity.hierarchyCode = departCode
			// console.log("111111>>>>>>>>>>>>>>>>begin");
			// console.table(optionPage);
			// console.log("departCode:::"+departCode);
			// console.log("111111>>>>>>>>>>>>>>>>end");
			deptListResponse = await this.webapi.dept.queryList(optionPage);
			isCreater = true;
		} else {
			//option.fuzzyCondition = entity.fuzzyCondition
			option.departmentCode=filter.code;
			console.log("222222>>>>>>>>>>>>>>>>begin");
			console.table(option);
			console.log("222222>>>>>>>>>>>>>>>>end");
			deptListResponse = await this.webapi.dept.queryList(option);
			isCreater = false;
		}

		let isDeptCreater = await this.webapi.dept.isCreater();
		let isDeptCreaterStatus = { status: isDeptCreater };
		let VatTaxpayer = this.VatTaxpayer;
		let user = this.metaAction.context.get('currentUser');
		response = {
			deptResponse,
			deptListResponse,
			filter,
			VatTaxpayer,
			isCreater,
			isDeptCreaterStatus,
			user
		};
		this.injections.reduce('load', response);
		this.injections.reduce('updateLoading', false)
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

	search = () => this.load()

	refresh = (isReloadTree, id, isEndNode) => {
		const pagination = this.metaAction.gf('data.pagination')
			.toJS();
		const filter = this.metaAction.gf('data.filter')
			.toJS();
		let option = filter;
		if (isReloadTree) option.isReloadTree = isReloadTree;
		if (isEndNode !== undefined) option.isEndNode = isEndNode;
		if (id) option = false;
		this.load(pagination, option);
	};

	heightCount = () => {
		let name = 'ttk-es-app-department-manage ttk-es-app-department-manageNoBorder';
		if (this.component.props.modelStatus && (this.component.props.modelStatus == 1)) {
			name = 'ttk-es-app-department-manage';
		}
		return name;
	};

	//展示树
	renderTreeNodes = (data) => {
		if(typeof(data) == 'object') {
			return data.map((item) => {
				if (item.children) {
					return (
						<Tree.TreeNode title={item.title} key={item.key} dataRef={item}>
							{this.renderTreeNodes(item.children)}
						</Tree.TreeNode>
					);
				}
				return <Tree.TreeNode {...item} key={item.key} dataRef={item}/>;
			});
		}else {
			return <div></div>;
		}
		
	};

	//选择部门
	selectType = (selectedKeys, info) => {
		// let parentId = selectedKeys[0] || 0,
		let key = info.selectedNodes[0] && info.selectedNodes[0].key || 'genid';
		this.injections.reduce('updateObj', {
			'data.treeSelectedKey': fromJS([key]),
			'data.departId': info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.id,
			'data.departCode': info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.code
		})
		if (info.selected == false) {
			return false;
		}
		let parentId = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.id,
			pid = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.pid,
			grade = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.grade,
			isEndNode = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.isEndNode,
			id = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.id,
			code = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.code,
			name = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.name,
			propertyName = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.propertyName,
			property = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.property,
			ts = info.selectedNodes[0] && info.selectedNodes[0].props.dataRef.ts;
		let pagination = this.metaAction.gf('data.pagination')
				.toJS(),
			filter = {
				parentId: Number(parentId),
				//grade: grade || 0,
				isEndNode: isEndNode,
				isReloadTree: false,
				id: id,
				code: code,
				name: name,
				propertyName: propertyName,
				property: property,
				pid: pid,
				ts: ts
			};
		// console.log("选择部门begin:::");
		// console.table(filter);
		// console.log("选择部门end:::");
		this.load(pagination, filter);
	};

	//分页修改
	pageChanged = (currentPage, pageSize) => {
		const filter = this.metaAction.gf('data.filter')
			.toJS();
		filter.isReloadTree = false;
		if (pageSize == null || pageSize == undefined) {
			pageSize = this.metaAction.gf('data.pagination')
				.toJS().pageSize;
		}
		this.load({ currentPage, pageSize }, filter);
	};

	getListRowsCount = () => {
		return this.metaAction.gf('data.list').size;
	};

	selectRow = (rowIndex) => (e) => {
		this.injections.reduce('selectRow', rowIndex, e.target.checked);
	};

	//新增部门
	addDept = async () => {
		const filter = this.metaAction.gf('data.filter').toJS();
		console.log("新增部门begin");
		console.table(filter.parentId);
		console.log("新增部门end");
		//genid是默认的
		if (filter.parentId=="genid") {
			this.metaAction.toast('warning', '请先在左侧树形菜单中选择对应的父部门。');
			return;
		}
		
		const ret = await this.metaAction.modal('show', {
			title: '部门',
			className: 'ttk-es-app-department-manage-deptModal',
			wrapClassName: 'card-archive',
			width: 400,
			height: 290,
			children: this.metaAction.loadApp('ttk-es-app-card-department', {
				store: this.component.props.store,
				parentId: filter ? filter.parentId : '',
				id: filter ? filter.id : '',
				//grade: filter.grade,
				sjbmmc: filter ? filter.name : '',
				//property: filter ? filter.property : ''
			})
		});
		if (ret) {
			this.refresh(true, undefined, false);
		}
	};

	//删除部门
	delDeptClick = (obj) => (e) => {
		this.del(obj.id);//传入需要删除的部门ID
	};


	//删除部门
	del = async (list) => {
		const ret = await this.metaAction.modal('confirm', {
			title: '删除部门',
			content: '确定要删除该部门吗?'
		});
		if (ret) {
			let response = await this.webapi.dept.delete(list);
			if(!response.success){
				this.metaAction.toast('warn', response.message);
				return false;
			}else {
				this.metaAction.toast('success', '部门删除成功');
			}
			this.load();
		}
	};

	//编辑部门
	editDept = (id) => (e) => {
		console.log("部门ID："+id);
		this.editDeptInfo(id);
	};

	editDeptInfo = async (id) => {
		const filter = this.metaAction.gf('data.filter').toJS();
		const ret = await this.metaAction.modal('show', {
			title: '部门',
			className: 'ttk-es-app-department-manage-deptModal',
			wrapClassName: 'card-archive',
			width: 400,
			height: 290,
			children: this.metaAction.loadApp('ttk-es-app-card-department', {
				store: this.component.props.store,
				parentId: filter ? filter.parentId : '',
				id:id,
				name: filter ? filter.name : '',
				property: filter ? filter.property : '',
				type:'edit'
			})
		});
		
		if (ret) {
			this.refresh();
			if(ret.refreshMenu) {
				this.component.props.onPortalReload('noReloadTplus')
			}
		}
	};

    pageTotal = () => {
        return `共 ` + this.metaAction.gf('data.pagination.total') + ` 条 `
    }
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...o };
	metaAction.config({ metaHandlers: ret });
	return ret;
}
