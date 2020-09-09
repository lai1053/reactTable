import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {List, fromJS} from 'immutable'
import moment from 'moment'
import config from './config'

import {FormDecorator} from 'edf-component'

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
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}
		this.clickStatus = false
		injections.reduce('init', {
			isPop: this.component.props.isPop
		})
		//获取appVersion
        let appVersion = this.component.props.appVersion
        if (!!appVersion) {
            this.metaAction.sf('data.appVersion', this.component.props.appVersion)
        }

		this.load()
	}

	load = async () => {
		let payload = {}, response, roleResponse
		let queryData = await this.webapi.person.queryData()
		if (queryData) payload.queryData = queryData
		if (this.component.props.personId || this.component.props.personId == 0) {
			response = await this.webapi.person.query(this.component.props.personId)
			//判断是否修改当前用户
			if(response && response.userId == this.metaAction.context.get('currentUser').id) {
				this.metaAction.sf('data.other.oldRole', fromJS(response.roleDtoList))
			}
			if (response) payload.person = response
		} else if (this.component.props.deptId && this.component.props.deptName) {
			payload.parentPerson = {
				id: this.component.props.deptId,
				name: this.component.props.deptName
			}
		}
		roleResponse = await this.webapi.role.query()
		if (roleResponse && roleResponse.length > 0) {
			roleResponse.forEach((data) => {
				data.label = data.name
				data.value = data.id
			})
		}
		let account = await this.webapi.person.account()
		if (account && account.glAccounts) payload.glAccounts = account.glAccounts
		this.injections.reduce('load', payload, roleResponse)
		const form = this.metaAction.gf('data.form').toJS()
	}

	onOk = async () => {
		return await this.save()
	}

	save = async () => {
		if (this.clickStatus) return
		this.clickStatus = true
		const form = this.metaAction.gf('data.form').toJS()
		const ok = await this.voucherAction.check([{
			path: 'data.form.email', value: form.email
		}, {
			path: 'data.form.name', value: form.name
		}, {
			path: 'data.form.identityCard', value: form.identityCard
		}, {
			path: 'data.form.department', value: form.department
		}, {
			path: 'data.form.mobile', value: form.mobile
		}, {
			path: 'data.form.jobDuty', value: form.jobDuty
		}], this.check)
		if (!ok) {
			this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
			this.clickStatus = false
			return false
		}
		if (form.userId) {
			if (form.roleDtoList.length <= 0) {
				this.metaAction.toast('warning', '已经邀请的用户不允许清空角色')
				return false
			}
		}
		let response
		let VatTaxpayer = Object.assign({},this.metaAction.context.get("currentOrg"))|| {}
		VatTaxpayer.id = 'genid'
		form.creator = VatTaxpayer.creator
		if (form.department) {
			form.departmentId = form.department.id
			delete form.department
		}
		if (form.mobile) {
			form.mobile = form.mobile.toString()
		}
		form.name = form.name ? form.name.trim() : ''
		form.jobDuty = form.jobDuty ? form.jobDuty.trim() : ''
		form.otherReceivableAccountId = form.otherReceivableAccountId ? form.otherReceivableAccountId : ''
		form.otherPayableAccountId = form.otherPayableAccountId ? form.otherPayableAccountId : ''
		form.isReturnValue = true
		form.isLoadingDefaultAccount = false
		if (this.component.props.personId || this.component.props.personId == 0) {
			form.personId = this.component.props.personId
			response = await this.webapi.person.update(form)
		} else {
			form.isEnable = true
			response = await this.webapi.person.create(form)
		}
		this.clickStatus = false
		if (response && response.error) {
			this.metaAction.toast('error', response.error.message)
			return false
		} else {
			let oldRoleId = this.metaAction.gf('data.other.oldRole') && this.metaAction.gf('data.other.oldRole').toJS()
			if(oldRoleId) {
				if(response.roleDtoList.length != oldRoleId.length) {
					response.refreshMenu = true
				}else {
					let arr = new Array(oldRoleId.length)
					for(let i = 0 ; i < oldRoleId.length; i ++) {
						for(let j = 0 ; j < response.roleDtoList.length; j++) {
							if(oldRoleId[i].roleId == response.roleDtoList[j].roleId) {
								arr[i] = true
								break
							}else {
								arr[i] = false
							}
						}
					}
					for(let i = 0 ; i < arr.length ; i++) {
						if(arr[i]) {
							response.refreshMenu = false
						}else {
							response.refreshMenu = true
						}
					}
				}
			}else {
				response.refreshMenu = false
			}
			this.metaAction.toast('success', '保存成功')
			return response
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
			case 'jobDuty':
				this.voucherAction.check([{
					path: 'data.form.jobDuty', value: form.jobDuty
				}], this.check);
				break;
			case 'identityCard':
				this.voucherAction.check([{
					path: 'data.form.identityCard', value: form.identityCard
				}], this.check);
				break;
			case 'email':
				this.voucherAction.check([{
					path: 'data.form.email', value: form.email
				}], this.check);
				break;
			case 'mobile':
				this.voucherAction.check([{
					path: 'data.form.mobile', value: form.mobile
				}], this.check);
				break;
		}
	}

	check = async (option) => {
		if (!option || !option.path)
			return
		let mobileReg = /^1[3|4|5|6|7|8|9][0-9]\d{8}$/,
			emailReg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
			identityReg = /^\d{17}(\d|x)$/i,
			response
		if (option.path == 'data.form.mobile') {
			if (option.value && mobileReg.test(option.value)) {
				if (this.metaAction.gf('data.phoneStatus') == false) {
					response = await this.webapi.user.existsMobile(option.value)
					return { errorPath: 'data.other.error.mobile', message: response ? '手机号已注册' : '' }
				}
			} else if (option.value && !mobileReg.test(option.value)) {
				return { errorPath: 'data.other.error.mobile', message: (option.value && !(mobileReg.test(option.value))) ? '请输入11位的手机号' : '' }
			}
		} else if (option.path == 'data.form.email') {
			return { errorPath: 'data.other.error.email', message: option.value && !(emailReg.test(option.value)) ? '请输入正确格式的邮箱' : '' }
		} else if (option.path == 'data.form.name') {
			return {errorPath: 'data.other.error.name', message: option.value && option.value.trim() ? (option.value.trim().length > 100 ? '姓名最大长度为100个字符' : "") : '请录入姓名'}
		} else if (option.path == 'data.form.identityCard') {
			return { errorPath: 'data.other.error.identityCard', message: (option.value && !(identityReg.test(option.value))) ? '请输入正确的身份证号' : '' }
		} else if (option.path == 'data.form.department') {
			return {errorPath: 'data.other.error.department', message: option.value ? '' : '请录入所属部门'}
		} else if (option.path == 'data.form.jobDuty') {
			return {errorPath: 'data.other.error.jobDuty', message: option.value && option.value.trim() && option.value.trim().length > 50 ? '职位最大长度为50个字符' : ''}
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
					response = await this.webapi.user.existsMobile(option.value)
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
		} else if (option.path == 'data.form.identityCard') {
			return { errorPath: 'data.other.error.identityCard', message: (option.value && option.value.length > 18) ? '请输入正确的的身份证号' : '' }
		} else if (option.path == 'data.form.department') {
			return {errorPath: 'data.other.error.department', message: option.value ? '' : '请录入所属部门'}
		} else if (option.path == 'data.form.jobDuty') {
			console.log('输出',option.value && option.value.trim() && option.value.trim().length)
			return {errorPath: 'data.other.error.jobDuty', message: option.value && option.value.trim() && option.value.trim().length > 50 ? '职位最大长度为50个字符' : ''}
		}
	}

	checkBoxChange = (data) => {
		this.injections.reduce('roleChange', data)
	}

	roleDisable = () => {
		let appVersion = this.metaAction.gf('data.appVersion')
		if((appVersion == 107 && sessionStorage["dzSource"] == 1)) return true
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

	departmentChange = (path, value) => {
		let departments = this.metaAction.gf('data.other.departments').toJS(), _rowIndex
		departments.map((item, index) => {
			if (item.id == value) _rowIndex = index
		})
		this.metaAction.sf('data.form.deptName', fromJS(departments[_rowIndex].name))
		this.metaAction.sf('data.form.orgId', fromJS(departments[_rowIndex].orgId))
		this.voucherAction.fieldChange(path, value, this.check)
	}

	addDepartment = async () => {
		const ret = await this.metaAction.modal('show', {
			title: '新增部门',
			width: 400,
			children: this.metaAction.loadApp(
				'app-card-department', {
					store: this.component.props.store
				}
			)
		})

		if (ret) {
			let queryData = await this.webapi.person.queryData()
			this.injections.reduce('departmentList', queryData)
			this.metaAction.sf('data.form.departmentId', fromJS(ret.id))
			this.metaAction.sf('data.form.deptName', fromJS(ret.name))
			this.metaAction.sf('data.form.orgId', fromJS(ret.orgId))
		}
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

	//新增科目
	addSubject = async (str) => {
		const ret = await this.metaAction.modal('show', {
			title: '新增科目',
			width: 450,
			okText: '保存',
			bodyStyle: { padding: 24, fontSize: 12 },
			children: this.metaAction.loadApp('app-proof-of-charge-subjects-add', {
				store: this.component.props.store,
				columnCode: "subjects",
				active: 'archives'
			})
		})
		if (ret) {
			let account = await this.webapi.person.account(),arg = {}
			arg.glAccounts = account.glAccounts
			arg.addItem = ret
			arg.str = str
			this.injections.reduce('glAccounts', arg)
		}
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
