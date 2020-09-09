
import React from 'react';
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
import debounce from 'lodash.debounce'
import { fromJS } from 'immutable';
import config from './config';
import extend from './extend';
import { Tree,TreeSelect } from 'edf-component';

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
		this.load(this.metaAction.gf('data.pagination').toJS());

		var mobile = sessionStorage.getItem('mobile')
        this.metaAction.sf('data.mobile', mobile);
	};

	load = async (page, filter) => {
		let response,
			persResponse
		this.injections.reduce('updateLoading', true)

		if (!(page && page['currentPage'])) {
			page = this.metaAction.gf('data.pagination')
				.toJS();
		}

		let department = await this.webapi.dept.department()

		if(department.list.length == 0) {
			this.metaAction.toast('warning', '对不起，您无查看人员管理的相关信息，请与您的系统管理员联系')
		}

		for(var i = 0;i<department.list.length;i++) {
			department.list[i].key = department.list[i].id
			department.list[i].title = department.list[i].name
		}

		// let departments = this.getTreeNode(department.list,'0');
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
		let option = {
			page: {
				'currentPage': page.currentPage || page.current,
				'pageSize': page.pageSize
			}
		};

		let bmdm = this.metaAction.gf('data.bmdm')
		let name = this.metaAction.gf('data.name')
		let entity = {
			bmdm:bmdm,
			name:name
		}
		
		let optionPage = {
			page: {
				'currentPage': page.currentPage || page.current,
				'pageSize': page.pageSize
			},
			entity
		};
		persResponse = await this.webapi.person.queryList(optionPage);
		
		response = {
			persResponse,
		};
		this.injections.reduce('load', response);
		this.injections.reduce('updateLoading', false);
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

	nameChange = (e) => {
		this.injections.reduce('updateSingle', 'data.name',e)
		this.load()
	}

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
		let name = 'ttk-es-app-usermanage ttk-es-app-usermanageNoBorder';
		if (this.component.props.modelStatus && (this.component.props.modelStatus == 1)) {
			name = 'ttk-es-app-usermanage';
		}
		return name;
	};

	//左侧部门树
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

	//部门移动树形菜单
	renderTreeSelectNodes= (data) => {
		if (!data) return <div></div>;
		return data.map((item) => {
			if (item.children) {
				return (
					<TreeSelect.TreeNode title={item.title} value={item.id} key={item.key} dataRef={item} >
						{this.renderTreeSelectNodes(item.children)}
					</TreeSelect.TreeNode>
				);
			}
			return <TreeSelect.TreeNode {...item} key={item.key}  value={item.id} dataRef={item}/>;
		});
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
				grade: grade || 0,
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
		this.injections.reduce('updateObj', {
			'data.bmdm': filter.code,
			'data.departmentId': filter.id
		})
		this.load();
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


	//新增人员
	addPerson = async (option) => {
		const bmdm = this.metaAction.gf('data.bmdm')
		const departmentId = this.metaAction.gf('data.departmentId')
	
		const treeSelectedKey= this.metaAction.gf('data.treeSelectedKey').toJS()
		if(!treeSelectedKey.length) {
			this.metaAction.toast('warning', '请选择部门');
			return
		}
		const ret = await this.metaAction.modal('show', {
			title: '新增用户',
			width: 720,
			className: 'ttk-es-app-usermanage-personModal',
			height: 425,
			okText:'保存',
			children: this.metaAction.loadApp('ttk-es-app-card-person', {
				store: this.component.props.store,
				bmdm:bmdm,
				departmentId:departmentId,
			})
		});
		if (ret) {
			this.refresh();
		}
	};

	//批量删除人员
	delBatch = async () => {
		let ids = [],tel = []
		let list = this.metaAction.gf('data.list').toJS()
	
		list.forEach((item,index) => {
			if(item.selected) {
				ids.push(item.id)
				tel.push(item)
			}
		})

		if(!ids.length) {
			this.metaAction.toast('warning', '请选择人员')
			return false
		}

		for(var i = 0;i<tel.length;i++) {
			if(tel[i].mobile == this.metaAction.context.get("currentUser").mobile) {
				this.metaAction.toast('warning', '不能删除当前登录账号')
				return false
			}
		}

		let newList = list.find(v => v.mobile == this.metaAction.context.get("currentUser").mobile)
		if(newList) {
			if(!newList.sysrole) {
				for(var j = 0;j<tel.length;j++) {
					if(tel[j].sysrole == '系统管理岗') {
						this.metaAction.toast('warning', '普通用户不能删除系统管理员账号')
						return false
					}
				}
			}
		}
		
		let title = '删除', content = '确定要删除该人员吗'
       
        const ret = await this.metaAction.modal('confirm', { title, content })

        if (!ret) {
            return false
        }
		
		let delPerson = await this.webapi.dept.delPerson(ids)
		if(delPerson) {
			this.metaAction.toast('success', '删除成功');
			this.refresh();
		}
	};

	//编辑人员
	modifyDetail = (id,num) => (e) => {
		if(num != 1) {
			return
		}
		this.edit(id);
	};

	edit = async (id) => {
		let list = this.metaAction.gf('data.list').toJS()
		const bmdm = this.metaAction.gf('data.bmdm')
		let a = list.find(v => v.id == id)

		const ret = await this.metaAction.modal('show', {
			title: '编辑用户',
			width: 720,
			className: 'ttk-es-app-usermanage-personModal',
			height: 425,
			children: this.metaAction.loadApp('ttk-es-app-card-person', {
				store: this.component.props.store,
				sysUserId : a.sysUserId,
				id : a.id,
				bmdm:a.bmdm,
				departmentId : a.departmentId
			})
		});
		if (ret) {
			this.refresh();
			if(ret.refreshMenu) {
				this.component.props.onPortalReload('noReloadTplus')
			}
		}
	};

	//人员的停用状态
	personStatusClick = (name, index) => {
		let status = this.metaAction.gf('data.status');
		this.setStatus(name, index);
	};

	setStatus = async (option, index) => {
		if (option.isEnable) {
			const ret = await this.metaAction.modal('confirm', {
				title: '停用账号',
				content: '被停用后，该人员将不能再登录，确定要停用吗？'
			});
			if(ret){
				option.isEnable = false;
				let response = await this.webapi.person.update(option);
				if (response) {
					this.metaAction.toast('success', '停用人员成功');
					this.injections.reduce('enable', response, index);
				}
			}
		} else {
			const ret = await this.metaAction.modal('confirm', {
				title: '恢复账号',
				content: '确认要恢复该人员的账号吗？'
			});
            if(ret){
				option.isEnable = true;
				let response = await this.webapi.person.update(option);
				if (response) {
					this.metaAction.toast('success', '启用人员成功');
					this.injections.reduce('enable', response, index);
				}
			}
		}
	};
	
	//选择部门后改变的值
	handleChange = (e,a,b) => {
		
		this.injections.reduce('update', 'data.other.selectDepart', e)
		this.injections.reduce('update', 'data.other.triggerNode', b.triggerNode.props.code)
	}

	//更多下拉按钮:移动部门
	moveDepartMent = async (e) => {
		if (e.key == 'moveDepart') {
			let list = this.metaAction.gf('data.list').toJS(),dzMaps = [],lastArr = []

			list.forEach((item,index) => {
				if(item.selected) {
					dzMaps.push(item)
				}
			})

			if (!dzMaps.length) {
				this.metaAction.toast('warning', '请选择人员');
				return;
			}

			for(let i = 0;i<dzMaps.length;i++) {
				let s = {}
				s.id = dzMaps[i].id
				s.sysUserId = dzMaps[i].sysUserId
				s.range = dzMaps[i].orgAuth
				lastArr.push(s)
			}

			const tree = this.metaAction.gf('data.other.tree').toJS();//获取树形菜单注释
			const ret = await this.metaAction.modal('show', {
				title: '部门调动',
				width: 350,
				className: 'ttk-es-app-usermanage-deptModal',
				height: 150,
				okText:'保存',
				children: <div>
					<TreeSelect style={{width: 330}} 
					placeholder='请选择要调入的部门' 
					onChange={this.handleChange}
					>
						{this.renderTreeSelectNodes(tree)}
					</TreeSelect>
				</div>
			});
			
			//ret=true表示保存，反之表示取消
			if (ret) {
				const selectDepart = this.metaAction.gf('data.other.selectDepart');//当前选择的部门		
				const triggerNode = this.metaAction.gf('data.other.triggerNode');//当前选择的部门		
				let response = {}
				response.departmentId = selectDepart
				response.bmdm = triggerNode
				response.dzMaps = lastArr
	
				let a = await this.webapi.dept.movePersonDepartment(response);
				if (a) {
					this.metaAction.toast('success', '部门调动成功');
					this.refresh();
				}
			}
		}
	};
	
	roleShow = (data) => {
		let role = this.metaAction.gf('data.roles')
				.toJS(),
			str = '';
		if (data.roleDtoList && data.roleDtoList.length > 0) {
			data.roleDtoList.forEach((perData) => {
				return role.forEach((roleData) => {
					if (perData.roleId == roleData.id) {
						str += roleData.name + ',';
					}
				});
			});
			str = str.slice(0, length - 1);
		}
		if (data.isOrgCreator && data.isOrgCreator == true) {
			str = '创建者兼系统管理员';
		}
		return str;
	};

	tyztChange = async (value) => {
		let response = {},ids= []
		if(value.tyzt == 1) {
			let title = '停用', content = '被停用后，该人员将不能再登录，确定要停用吗？'
			const ret = await this.metaAction.modal('confirm', { title, content })
			if (!ret) {
				return
			}
		
			response.tyzt = 0
			ids.push(value.id)
			response.ids = ids
			let stopPerson = await this.webapi.dept.stopPerson(response)
			if (stopPerson) {
				this.metaAction.toast('success', '停用成功');
				this.refresh();
			}
		}else if(value.tyzt == 0) {
			let title = '启用', content = '确认要恢复该人员的账号吗？'
			const ret = await this.metaAction.modal('confirm', { title, content })
			if (!ret) {
				return
			}
			response.tyzt = 1
			ids.push(value.id)
			response.ids = ids
			let stopPerson = await this.webapi.dept.stopPerson(response)
			if (stopPerson) {
				this.metaAction.toast('success', '启用成功');
				this.refresh();
			}
		}
	}

	//停用行置灰
	isEnable = (tyzt) => tyzt == 1 ? '' : 'no-enable'

	clickCompent = (obj) => obj.tyzt == 1 ?  <a title={obj.name} onClick={this.modifyDetail(obj.id,obj.tyzt)}>{obj.name}</a> : <label className={'no-enable'}>{obj.name}</label>

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
