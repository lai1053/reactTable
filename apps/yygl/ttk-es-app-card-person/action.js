import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {List, fromJS} from 'immutable'
import debounce from 'lodash.debounce'
import moment from 'moment'
import config from './config'

import {FormDecorator} from 'edf-component'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.voucherAction = option.voucherAction
		this.config = config.current
		this.webapi = this.config.webapi
        // this.changeCheckEmail = debounce(this.changeCheckEmail, 400);
	}

	onInit = ({component, injections}) => {
		this.voucherAction.onInit({component, injections})
		this.component = component
		this.injections = injections
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}
		this.clickStatus = false
		injections.reduce('init', {
			isPop: this.component.props.isPop
		})

		this.load()
	}

	load = async () => {
		let getRoleList = await this.webapi.person.getRoleList()

		let roles1 = [],roles2 = [],roles3 = [], roles4 = []
		roles1 = getRoleList.body[`001`]
		roles2 = getRoleList.body[`002`]
		roles3 = getRoleList.body[`003`]?getRoleList.body[`003`]:[]
		roles4 = getRoleList.body[`004`] ? getRoleList.body[`004`] : []

		if (roles1 && roles1.length > 0) {
			roles1.forEach((data) => {
				data.label = data.name
				data.value = data.id
			})
		}

		if (roles2 && roles2.length > 0) {
			roles2.forEach((data) => {
				data.label = data.name
				data.value = data.id
			})
		}

		if (roles3 && roles3.length > 0) {
			roles3.forEach((data) => {
				data.label = data.name
				data.value = data.id
			})
		}else {
			// if(!this.component.props.sysUserId) {
			this.injections.reduce('updateSingle', 'data.visibleRoles3',false)
			// }
		}

		if (roles4 && roles4.length > 0) {
			roles4.forEach((data) => {
				data.label = data.name
				data.value = data.id
			})
		}

		this.injections.reduce('updateObj', {
			'data.other.roles1': fromJS(roles1),
			'data.other.roles2': fromJS(roles2),
			'data.other.roles3': fromJS(roles3),
			'data.other.userDefinedRole': fromJS(roles4),
		})

		let getUserDetail,roleDtoListCheck = [],dzRoles1 = [],dzRoles3= []
		if(this.component.props.sysUserId) {
			getUserDetail = await this.webapi.person.getUserDetail({"sysUserId":this.component.props.sysUserId})

			getUserDetail.person.range = getUserDetail.person.orgAuth
			getUserDetail.person.mobile = getUserDetail.person.account

			if(this.metaAction.context.get("currentUser").mobile == getUserDetail.person.account) {
				this.injections.reduce('updateSingle', 'data.systemDisabled',true)
			}
			let sysRole = getUserDetail.role
			if(sysRole && (sysRole.findIndex(item=>item.id===100000) !== -1 || sysRole.findIndex(item=>item.id===100001) !== -1)){
				this.injections.reduce('updateSingle', 'data.isSysRole',true)
			}

			for(var i = 0 ;i< getUserDetail.role.length;i++) {
				roleDtoListCheck.push(getUserDetail.role[i].id)
				if(getUserDetail.role[i].id != 100000) {
					dzRoles1.push(getUserDetail.role[i].id)
					dzRoles3.push(getUserDetail.role[i].id)
				}else {
					dzRoles3.push(getUserDetail.role[i].id)
				}
			}

			this.injections.reduce('updateObj', {
				'data.form': fromJS(getUserDetail.person),
				'data.form.roleDtoListCheck': fromJS(roleDtoListCheck),
				'data.form.dzRoles1': fromJS(dzRoles1),
				'data.form.dzRoles3': fromJS(dzRoles3),
				'data.ddt':fromJS(getUserDetail.person.range)
			})
		}
		if(this.component.props.sysUserId) {
			this.injections.reduce('updateSingle', 'data.mobileVisible',true)
		}
	}

	/**保存用户**/
	onOk = async () => {
		return await this.save()
	}

	save = async () => {
		if (this.clickStatus) return
		this.clickStatus = true
		let form = this.metaAction.gf('data.form').toJS()

		const ok = await this.voucherAction.check([
		// 	{
		// 	path: 'data.form.email', value: form.email
		// },
			{
			path: 'data.form.name', value: form.name
		}, {
			path: 'data.form.password', value: form.password
		}, {
			path: 'data.form.mobile', value: form.mobile
		}], this.check)
		if (!ok) {
			this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
			this.clickStatus = false
			return false
		}

		if(!form.dzRoles1 && !form.dzRoles3) {
			this.metaAction.toast('warning', '请至少选择一个岗位')
			this.clickStatus = false
			return false
		}

		if(form.dzRoles3.length == 0) {
			this.metaAction.toast('warning', '请至少选择一个岗位')
			this.clickStatus = false
			return false
		}

		
		let data = this.metaAction.gf('data').toJS()

		
		//选择了公司或部门
		if(form.range == '1' || form.range == '2'){
			let xtglyFlag = true
			for (const r of form.dzRoles3) {
				for (const o of data.other.roles1) {
					if(r == o.code){
						//console.log("选择了管理岗----",o.code);
						xtglyFlag = false;
						break
					}
				}
				for (const or of data.other.roles3) {
					if(r == or.code){
						//console.log("选择了系统管理员----",or.code);
						xtglyFlag = false;
						break
					}
				}
			}
			if(xtglyFlag){
				this.metaAction.toast('warning', '保存失败：仅担任业务岗位的人员，请将数据权限设置为【个人】')
				this.clickStatus = false
				return false
			}	 		
		}
		//选择了个人
		if(form.range == '0'){
			//let glgRoleFlag = false;
			for (const r of form.dzRoles3) {
				for (const o of data.other.roles1) {
					if(r == o.code){
						console.log("我是管理岗",o.code);
						//glgRoleFlag = true;
						this.metaAction.toast('warning', '保存失败：担任管理岗位的人员，请将数据权限设置为【公司】或【部门】')
						this.clickStatus = false
						return false
					}
				}
			}
			// if(glgRoleFlag){
			// 	this.metaAction.toast('warning', '保存失败：担任管理岗位的人员，请将数据权限设置为【公司】或【部门】')
			// 	this.clickStatus = false
			// 	return false
			// }
			
		}

		

		let response = {},addPerson,updataPerson

		response.email = form.email
		response.mobile = form.mobile
		response.name = form.name
		response.password = form.password
		response.range = form.range
		response.dzRoles = form.dzRoles3
		response.bmdm = this.component.props.bmdm
		response.departmentId = this.component.props.departmentId

		if(form.dzRoles1 == undefined || form.dzRoles3 == undefined) {
			response.glrole = 0
		}else {
			form.dzRoles1.length == form.dzRoles3.length ? response.glrole = 0 : response.glrole = 1
		}

		if(this.component.props.sysUserId) {
			response.sysUserId = this.component.props.sysUserId
			response.id = this.component.props.id
			response.departmentId = this.component.props.departmentId
			updataPerson = await this.webapi.person.updataPerson(response)
		}else {
			addPerson = await this.webapi.person.addPerson(response)
		}

		if(addPerson) {
			if(addPerson.errorCode == '0') {
				this.metaAction.toast('error', addPerson.message)
				this.clickStatus = false
				return false
			}
			if(addPerson.message == '添加员工失败') {
				this.metaAction.toast('error', '保存失败')
				return response
			}else {
				this.metaAction.toast('success', '保存成功')
				return response
			}
		}else if(updataPerson) {
			if(updataPerson.errorCode == '0') {
				this.metaAction.toast('error', updataPerson.message)
				this.clickStatus = false
				return false
			}else {
				this.metaAction.toast('success', '更新成功')
				return response
			}
		}
	}

	changeCheck = (str) => {
		const form = this.metaAction.gf('data.form').toJS()
		switch (str){
			case 'name':
				this.voucherAction.check([{
					path: 'data.form.name', value: form.name
				}], this.check);
				break;
			case 'password':
				this.voucherAction.check([{
					path: 'data.form.password', value: form.password
				}], this.check);
				break;
			// case 'email':
			// 	this.voucherAction.check([{
			// 		path: 'data.form.email', value: form.email
			// 	}], this.check);
			// 	break;
			case 'mobile':
				this.voucherAction.check([{
					path: 'data.form.mobile', value: form.mobile
				}], this.check);
				break;
		}
	}
	// changeCheckEmail = (str) => {
	// 	const form = this.metaAction.gf('data.form').toJS()
	// 	switch (str){
	// 		case 'email':
	// 			this.voucherAction.check([{
	// 				path: 'data.form.email', value: form.email
	// 			}], this.check);
	// 			break;
	// 	}
	// }

	//校验数据格式信息
	check = async (option) => {
		if (!option || !option.path)
			return
		let mobileReg = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
			emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
			identityReg = /^\d{17}(\d|x)$/i,
			response
		if (option.path == 'data.form.mobile') {
			if (option.value && !mobileReg.test(option.value)) {
				return { errorPath: 'data.other.error.mobile', message: (option.value && !(mobileReg.test(option.value))) ? '请输入11位的手机号' : '' }
			} else if(!option.value){
				return { errorPath: 'data.other.error.mobile', message: '请输入11位的手机号' }
			}else if (option.value && mobileReg.test(option.value)) {
				if (this.metaAction.gf('data.phoneStatus') == false) {
					response = await this.webapi.person.queryMobile({
						"loginName":option.value
					})
					if(response.data) {
						if (!this.clickStatus) {
							let newList = {}
							newList.name = response.data.nickname
							newList.email = response.data.email
							newList.mobile = response.data.mobile
							newList.password = response.data.password
							newList.range = '0'

							this.metaAction.sfs({
								'data.form': fromJS(newList),
								'data.flag': true,
							})
							this.metaAction.toast('success', '该手机号已经注册了用户，将为您直接带出其信息')
						}

					}else if(response.message == '手机号码重复'){
						return { errorPath: 'data.other.error.mobile', message: response ? '手机号已注册' : '' }
					}else {
						let flag = this.metaAction.gf('data.flag')
						if (flag) {
							let newList = {}
							newList.name = ''
							newList.email = ''
							newList.mobile = option.value
							newList.password = ''
							newList.range = '0'

							this.injections.reduce('updateObj', {
								'data.form': fromJS(newList),
								'data.flag': false
							})
						}

						return { errorPath: 'data.other.error.mobile', message: response ? '' : '' }
					}
				}
			}
		} else if (option.path == 'data.form.email') {
			return { errorPath: 'data.other.error.email', message: !option.value ? '请输入邮箱':(option.value && !(emailReg.test(option.value)) ? '请输入正确格式的邮箱' : '') }
		} else if (option.path == 'data.form.name') {
			return {errorPath: 'data.other.error.name', message: option.value && option.value.trim() ? (option.value.trim().length > 100 ? '姓名最大长度为100个字符' : "") : '请录入姓名'}
		}  else if (option.path == 'data.form.password') {
			if(!/(?=^.{6,20}$)((?=.*[A-Z]){1})((?=.*[a-z]){1})((?=.*[0-9]){1})/.test(option.value) && option.value != '******') {
				return { errorPath: 'data.other.error.password', message: '6-20位必须包含大写字母、小写字母和数字' }
			}else {
				return {errorPath: 'data.other.error.password', message: !option.value ? '请输入密码':option.value && option.value.trim() && option.value.trim().length > 50 ? '请输入正确的密码格式' : ''}
			}
		}
	}

	checkNoSave = async (option) => {
		if (!option || !option.path)
			return
		let mobileReg = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
			emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
			identityReg = /^\d{17}(\d|x)$/i,
			response

		if (option.path == 'data.form.mobile') {
			if (option.value) {
				if (mobileReg.test(option.value)) {
					//response = await this.webapi.user.existsMobile(option.value)
					response = await this.webapi.person.queryMobile(option.value)
					console.table(response);
					return { errorPath: 'data.other.error.mobile', message: response ? '手机号已注册' : '' }
				} else if (option.value.length > 11) {
					return { errorPath: 'data.other.error.mobile', message: '请输入正确位数的手机号' }
				} else if (option.value.length > 1 && option.value.length < 11 && !/^1[3|4|5|6|7|8|9]/.test(option.value)) {
					return { errorPath: 'data.other.error.mobile', message: '请输入正确的手机号' }
				} else if (option.value.length == 1 && option.value != '1') {
					return { errorPath: 'data.other.error.mobile', message: '请输入正确的手机号' }
				} else {
					return {errorPath: 'data.other.error.mobile', message: '' }
				}
			}
		} else if (option.path == 'data.form.email') {
			return { errorPath: 'data.other.error.email', message: '' }
		} else if (option.path == 'data.form.name') {
			return {errorPath: 'data.other.error.name', message: option.value && option.value.trim() ? (option.value.trim().length > 100 ? '姓名最大长度为100个字符' : "") : '请录入姓名'}
		} else if (option.path == 'data.form.password') {
			return { errorPath: 'data.other.error.password', message: (option.value && option.value.length > 18) ? '请输入正确的的手机号' : '' }
		}
	}

	//选择角色
	checkBoxChange = (data) => {
		this.injections.reduce('roleChange1', data,'dzRoles')
		let roles = this.metaAction.gf('data.form.roleDtoListCheck').toJS();
		let ddt = this.metaAction.gf('data.ddt')
		console.log('选中了谁：',roles)
		if(roles.length != 0){
			if(roles.includes(100000) || roles.includes(100001)){
				this.injections.reduce('updateObj', {
					'data.form.range':'1',
					'data.isVisible':false,
					'data.isSysRole': true//禁用数据权限下拉框
				})
			}else{
				this.injections.reduce('updateObj', {
					// 'data.form.range':ddt,
					'data.isVisible':true,
					'data.isSysRole': false//取消禁用数据权限下拉框
				})
			}
		}else {
			this.injections.reduce('updateObj', {
				'data.form.range':ddt,
				'data.isVisible':true,
				'data.isSysRole': false//取消禁用数据权限下拉框
			})
		}
	}

	//选择角色
	checkBoxChange3 = (data) => {
		// debugger
		this.injections.reduce('roleChange3', data,'glrole')
		let ss = this.metaAction.gf('data.form.roleDtoListCheck').toJS();//this.metaAction.gf('data.xtglRole').toJS();
		let ddt = this.metaAction.gf('data.ddt')
		console.log('我是谁，我要干啥',ss)
		if(ss.length != 0){//勾选了系统管理员
			ss.forEach((item) => {
				if(item == 100000 || item == 100001){
					this.injections.reduce('updateObj', {
						'data.form.range':'1',
						'data.isVisible':false,
						'data.isSysRole': true//禁用数据权限下拉框
					})
				}else {
					this.injections.reduce('updateObj', {
						'data.form.range':ddt,
						'data.isVisible':true,
						'data.isSysRole': false//取消禁用数据权限下拉框
					})
				}
			})
		}else {
			this.injections.reduce('updateObj', {
				'data.form.range':ddt,
				'data.isVisible':true,
				'data.isSysRole': false//取消禁用数据权限下拉框
			})
		}
	}

	//角色
	roleDisable = () => {
		let data = this.metaAction.gf('data').toJS();
		let form = data.form,
			roleStatus = data.roleStatus,
			status = false
		if (form && form.isOrgCreator == true) {
			status = true
		}
		return status
	}

	fieldChange = (path, value) => {
		this.voucherAction.fieldChange(path, value, this.checkNoSave)
	}


	roleMenuClick = (e) => {
		switch (e.key) {
			case 'viewrole':
				this.viewRole()
				break;
		}
	}

	viewRole = async () => {

	}

	//自定义添加岗位添加
	addRolesInputConfirm =()=>{
		let data = this.metaAction.gf('data').toJS();
		let value = data.addRolesValue,
			 roles = data.other.userDefinedRole,
			 key = data.roleKey;
		
		if(!value) return
		const index = roles.findIndex(item => value === item.label);
		console.log(value,roles,key,index)
		if(index >= 0) return
		const _role={
			label: value,
			value: key
		}
		roles = [...roles, _role];
		this.injections.reduce('updateObj', {
			'data.addRolesValue': fromJS(""),
			'data.other.userDefinedRole': fromJS(roles),
			'data.roleKey': fromJS(key+1)
		})
		
	}

	subjectListOption = () => {
			let data = this.metaAction.gf('data.other.glAccounts') && this.metaAction.gf('data.other.glAccounts').toJS()

			if (data) {
					return data.map(d => <Option title={d.codeAndName} key={d.id} value={d.id} style={{'font-size': '12px', 'height': '36px', 'line-height': '26px'}}>{d.codeAndName}</Option>)
			}
	}
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		voucherAction = FormDecorator.actionCreator({...option, metaAction}),
		o = new action({...option, metaAction, voucherAction}),
		ret = {...metaAction, ...voucherAction, ...o}

	metaAction.config({metaHandlers: ret})

	return ret
}
