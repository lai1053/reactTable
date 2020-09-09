import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import config from './config'
import {FormDecorator} from 'edf-component'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.config = config.current
		this.voucherAction = option.voucherAction
		this.webapi = this.config.webapi
	}

	onInit = ({component, injections}) => {
		this.voucherAction.onInit({component, injections})
		this.component = component
		this.injections = injections
		this.activeKey = ''
		this.clickStatus = false
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}
		let archivesName
		if (this.component.props.archivesName) {
			archivesName = this.component.props.archivesName
		}
		injections.reduce('init', archivesName)

		this.load()
	}

	load = async () => {
		let data = {}, code, response, listResponse = await this.webapi.basearchive.queryList()
		if (this.component.props.activeKey) {
			listResponse.list && listResponse.list.forEach((data) => {
				if (data.name == this.component.props.activeKey) {
					this.activeKey = data.id
				}
			})
			code = await this.webapi.basearchive.getCode({
				userDefineArchiveId: this.activeKey,
				archiveName: 'ba_userdefinearchive_data'
			})
		}
		if (this.component.props.archivesName) {
			data.archivesName = true
		} else if (this.component.props.parentId !== undefined) {
			response = await this.webapi.basearchive.queryData(this.component.props.parentId)
		} else if (this.component.props.id !== undefined) {
			code = await this.webapi.basearchive.getCode({
				userDefineArchiveId: this.component.props.id,
				archiveName: 'ba_userdefinearchive_data'
			})
		}
		if (code) data.code = code
		if (response) data = response
		this.injections.reduce('load', data)
	}

	onOk = async () => {
		return await this.save()
	}

	save = async () => {
		if (this.clickStatus) return
		this.clickStatus = true
		const form = this.metaAction.gf('data.form').toJS(), option = {}, ts = this.metaAction.gf('data.ts'),
			archiveId = this.metaAction.gf('data.archiveId')
		let archivesName = this.component.props.archivesName,
			checkedArr = [{
				path: 'data.form.name', value: form.name
			}]
		if (!archivesName) {
			checkedArr.push({
				path: 'data.form.code', value: form.code
			})
		}
		const ok = await this.voucherAction.check(checkedArr, this.check)
		if (!ok) {
			this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
			this.clickStatus = false
			return false
		}
		let response
		form.code = form.code ? form.code.trim() : ''
		form.name = form.name ? form.name.trim() : ''
		form.remark = form.remark ? form.remark.trim() : ''
		form.isReturnValue = true
		form.isLoadingDefaultAccount = false
		if (archivesName) {
			option.name = form.name.trim()
			option.isEnable = true
			option.isReturnValue = true
			option.isLoadingDefaultAccount = false
			response = await this.webapi.basearchive.queryName(option)
		} else if (this.component.props.parentId) {
			form.id = this.component.props.parentId
			form.archiveId = archiveId
			form.ts = ts
			response = await this.webapi.basearchive.update(form)
		} else if (this.component.props.id) {
			form.archiveId = this.component.props.id
			response = await this.webapi.basearchive.create(form)
		} else if (this.activeKey != '') {
			form.archiveId = this.activeKey
			response = await this.webapi.basearchive.create(form)
		}
		this.clickStatus = false
		if (response && response.error) {
			this.metaAction.toast('error', response.error.message)
			return false
		} else {
			this.metaAction.toast('success', '保存成功')
			return response
		}
	}

	changeCheck = (str) => {
		const form = this.metaAction.gf('data.form').toJS()
		switch (str){
			case 'code':
				this.voucherAction.check([{
					path: 'data.form.code', value: form.code
				}], this.check);
				break;
			case 'name':
				this.voucherAction.check([{
					path: 'data.form.name', value: form.name
				}], this.check);
				break;
			case 'remark':
				this.voucherAction.check([{
					path: 'data.form.remark', value: form.remark
				}], this.check);
				break;
		}
	}

	check = (option) => {
		if (!option || !option.path)
			return
		if (option.path == 'data.form.code') {
			return {errorPath: 'data.other.error.code', message: option.value && option.value.trim() ? (option.value.trim().length > 50 ? '编码最大长度为50个字符' : "") : '请录入编码'}
		}
		else if (option.path == 'data.form.name') {
			return {errorPath: 'data.other.error.name', message: option.value && option.value.trim() ? (option.value.trim().length > 100 ? '名称最大长度为100个字符' : "") : '请录入名称'}
		}
		else if (option.path == 'data.form.remark') {
			return {errorPath: 'data.other.error.remark', message: option.value && option.value.trim().length > 200 ? '备注最大长度为200个字符' : ""}
		}
	}

	fieldChange = (path, value) => {
		this.voucherAction.fieldChange(path, value, this.check)
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
