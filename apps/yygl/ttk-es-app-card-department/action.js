import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {List, fromJS} from 'immutable'
import moment from 'moment'
import config from './config'

import {FormDecorator,TreeSelect } from 'edf-component'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.voucherAction = option.voucherAction
		this.config = config.current
		this.webapi = this.config.webapi
	}

	onInit = ({component, injections}) => {
		this.voucherAction.onInit({component, injections})
		this.component = component
		this.injections = injections
		this.clickStatus = false
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}
		injections.reduce('init', {
			isPop: this.component.props.isPop
		})
		this.load()
	}

	load = async () => {
		let data = {}, response,sjbmmc,type,curentID
		//console.log("parentId:::::"+this.component.props.parentId);

		//--------------------树形菜单begin--------------------
		curentID=this.component.props.id//当前菜单ID
		let department = await this.webapi.department.selDepartList(curentID)//根据所选部门查询其他对应的部门，本部门不能移动

		for(var i = 0;i<department.list.length;i++) {
			department.list[i].key = department.list[i].id
			department.list[i].title = department.list[i].name
		}

		//let departments = this.getTreeNode(department.list,'0');
		let departments = department.list.length>0?this.getTreeNode(department.list,department.list[0].pid):[];

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
        //--------------------树形菜单end--------------------

		//编辑部门
		type=this.component.props.type;
		if (type == "edit") {
			this.injections.reduce('updateObj', {
				'data.other.listsjbm1':false,
				'data.other.listsjbm2':true
			})
			response = await this.webapi.department.query(curentID)
			if (response) {
				data.response = response
				this.injections.reduce('updateSingle', 'data.other.selectDepart',response.parentId+'')
			}
		}
	 
		this.injections.reduce('load', data, this.component.props)
		
		/***上级部门名称begin***/
		sjbmmc=this.component.props.sjbmmc;
		this.injections.reduce('updateSingle', 'data.form.sjbmmc',sjbmmc);//赋值
		/***上级部门名称end***/
	}

	//保存
	onOk = async () => {
		return await this.save()
	}
	
	//保存、编辑
	save = async () => {
		if (this.clickStatus) return
		this.clickStatus = true

		const form = this.metaAction.gf('data.form').toJS()

		const ok = await this.voucherAction.check([ {
			path: 'data.form.name', value: form.name
		}], this.check)

		let response, option = {}

		if (!ok) {
			this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
			this.clickStatus = false
			return false
		}

		option.name = form.name.trim()
		//console.log("菜单ID:"+form.id);
		option.parentId = this.component.props.parentId
		option.pid = form.pid
		option.ts = form.ts
		option.isReturnValue = true
		option.isLoadingDefaultAccount = false

		let type=this.component.props.type;
		if (type == "edit") { //编辑部门
			option.id = this.component.props.id
			
			//console.log("父ID"+this.component.props.parentId);

			//测试选择部门
			const selectDepart = this.metaAction.gf('data.other.selectDepart');//当前选择的部门	
			console.log("所选菜单ID"+selectDepart)
			
           if(selectDepart>0){
			    option.parentId=selectDepart//父菜单设置为可选菜单ID
			    response = await this.webapi.department.update(option);
		   } 
		   else{
				this.metaAction.toast('warning', '请选对应的上级部门')
				this.clickStatus = false
				return false
		   }

		} else{
			response = await this.webapi.department.create(option);//添加部门
		}

	
		this.clickStatus = false
    
		if (!response.success) {
			this.metaAction.toast('error', response.message)
			return false
		} else {
			this.metaAction.toast('success', '保存成功')
			return response
		}
	}

	changeCheck = () => {
		const form = this.metaAction.gf('data.form').toJS()
		this.voucherAction.check([{
			path: 'data.form.name', value: form.name
		}], this.check)
	}

	check = async (option) => {
		if (!option || !option.path)
			return
        if (option.path == 'data.form.name') {
			return {errorPath: 'data.other.error.name', message: option.value && option.value.trim() ? (option.value.trim().length > 100 ? '名称最大长度为100个字符' : "") : '请录入名称'}
		}
	}

	fieldChange = (path, value) => {
		this.voucherAction.fieldChange(path, value, this.check)
	}

	//部门选择树形菜单
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

	//选择部门后改变的值
	handleChange = (e) => {
        console.log(e);
		this.injections.reduce('update', 'data.other.selectDepart', e);
	}
	
	//树形菜单结构
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
	const metaAction = new MetaAction(option),
		voucherAction = FormDecorator.actionCreator({...option, metaAction}),
		o = new action({...option, metaAction, voucherAction}),
		ret = {...metaAction, ...voucherAction, ...o}

	metaAction.config({metaHandlers: ret})

	return ret
}
