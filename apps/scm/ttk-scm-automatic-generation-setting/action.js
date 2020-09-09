import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import { fromJS } from 'immutable'
import moment from 'moment'
import { Button } from 'edf-component'
import config from './config'
import { FormDecorator } from 'edf-component'
import { environment } from 'edf-utils'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.voucherAction = option.voucherAction
		this.config = config.current
		this.webapi = this.config.webapi
	}

	onInit = ({ component, injections }) => {
		this.voucherAction.onInit({ component, injections })
		this.component = component
		this.injections = injections
		injections.reduce('init')
		this.load()
	}

	load = async () => {
		let foreseeClientHost = this.metaAction.context.get('linkConfig').foreseeClientHost
		let baseUrl = `${document.location.protocol}//${foreseeClientHost}`
		const consumerClass = await this.webapi.common(`${baseUrl}/common/consumerClass/query`, {}, this.getOrgId()),
			supplierClass = await this.webapi.common(`${baseUrl}/common/supplierClass/query`, {}, this.getOrgId()),
			inventoryClass = await this.webapi.common(`${baseUrl}/common/inventoryClass/manualQuery`, {}, this.getOrgId()),
			account = await this.webapi.common(`${baseUrl}/common/account/queryNotEndNode`, { year: moment(this.metaAction.context.get('currentOrg').periodDate).format('YYYY') }, this.getOrgId()),
			isAux = await this.webapi.common(`${baseUrl}/common/account/queryIsAux`, {}, this.getOrgId()),//是否启用辅助核算
			accountEnable = await this.webapi.queryAccountEnable({ entranceFlag: "system" })//是否启用明细
		let res = await this.webapi.query()
		account.value ? account.value.forEach(o => o.codeAndName = o.code + " " + o.name) : account.value = []
		let accountEnableDto = {
			currentAccount: 0,
			inventoryAccount: 0,
			revenueAccount: 0,
			saleAccount: 0,
		}
		if (accountEnable.accountEnableDto) {
			accountEnableDto = accountEnable.accountEnableDto;
			this.metaAction.sf('data.other.accountEnableDto', fromJS(accountEnableDto));//
		}
		let AuxEnableDto = {
			consumer: false,
			supplier: false,
			inventory: false,
			department: false,
			item: false,
			person: false,
		}
		if (isAux && isAux.result && isAux.value) {
			AuxEnableDto = isAux.value
		}
		let option = {
			'data.form': fromJS(res),
			'data.other.customer': fromJS(consumerClass.value ? consumerClass.value : []),
			'data.other.supplier': fromJS(supplierClass.value ? supplierClass.value : []),
			'data.other.inventory': fromJS(inventoryClass.value ? inventoryClass.value : []),
			'data.other.account': fromJS(account.value),
			'data.other.isAux': fromJS(AuxEnableDto)
		}

		this.injections.reduce('load', option)
	}
	renderAccountSelectOption = (docName) => {

		let data = this.metaAction.gf(`data.other.${docName}`) && this.metaAction.gf(`data.other.${docName}`).toJS()
		if (data) {
			return data.map((d, index) => <Option title={d.codeAndName} key={index} value={d.code} style={{ 'font-size': '12px', 'height': '36px', 'line-height': '26px' }}>{d.codeAndName}</Option>)
		}
	}
	onFileChange = (path, value, name) => {
		let option = {}
		option[path] = value
		if (name) option[`data.other.${name}`] = false
		if (path == 'data.form.customerSet' && !value) {
			option[`data.other.customerClassCode`] = false;
			option[`data.other.customerStarCode`] = false;
		} else if (path == 'data.form.supplierSet' && !value) {
			option[`data.other.supplierClassCode`] = false;
			option[`data.other.supplierStarCode`] = false;
		} else if (path == 'data.form.inventorySet' && !value) {
			option[`data.other.inventoryClassCode`] = false;
			option[`data.other.inventoryStarCode`] = false;
		} else if (path == 'data.form.customerAccountSet') {
			option[`data.other.customerParentAccountCode`] = false;
		} else if (path == 'data.form.supplierAccountSet') {
			option[`data.other.supplierParentAccountCode`] = false;
		}
		this.injections.reduce('load', option)
	}

	oncancel = async () => {
		this.component.props.closeModal()
	}

	onconfirm = async () => {
		let form = this.metaAction.gf('data.form').toJS()
		let checked = this.getChecked(form)
		if (!checked) return false
		let option = {
			"customerSet": form.customerSet,
			"customerClassCode": form.customerClassCode || null,
			"customerCodeRule": form.customerCodeRule,
			"customerAccountSet": form.customerAccountSet,
			"customerParentAccountCode": form.customerParentAccountCode,

			"supplierSet": form.supplierSet,
			"supplierClassCode": form.supplierClassCode || null,
			"supplierCodeRule": form.supplierCodeRule,
			"supplierAccountSet": form.supplierAccountSet,
			"supplierParentAccountCode": form.supplierParentAccountCode,

			"inventorySet": form.inventorySet,
			"inventoryClassCode": form.inventoryClassCode || null,
			"inventoryCodeRule": form.inventoryCodeRule,
			//"inventoryAccountSet": form.inventoryAccountSet,
		}
		if (form.customerCodeRule == 1) option.customerStarCode = form.customerStarCode
		if (form.supplierCodeRule == 1) option.supplierStarCode = form.supplierStarCode
		if (form.inventoryCodeRule == 1) option.inventoryStarCode = form.inventoryStarCode
		if (form.id) option.id = form.id
		if (form.ts) option.ts = form.ts

		let res = await this.webapi.saveRule(option)
		this.metaAction.toast('success', '保存成功')
		this.component.props.closeModal()
	}

	getChecked = (form) => {
		let infoArr = []
		// if (form.customerSet && !form.customerClassCode) {
		// 	infoArr.push('客户分类')
		// 	this.injections.reduce('update', { path: 'data.other.customerClassCode', value: true })
		// }
		if (form.customerSet && form.customerCodeRule == 1 && !form.customerStarCode) {
			infoArr.push('客户起始编码')
			this.injections.reduce('update', { path: 'data.other.customerStarCode', value: true })
		}

		// if (form.supplierSet && !form.supplierClassCode) {
		// 	infoArr.push('供应商分类')
		// 	this.injections.reduce('update', { path: 'data.other.supplierClassCode', value: true })
		// }
		if (form.supplierSet && form.supplierCodeRule == 1 && !form.supplierStarCode) {
			infoArr.push('供应商起始编码')
			this.injections.reduce('update', { path: 'data.other.supplierStarCode', value: true })
		}
		// if (form.inventorySet && !form.inventoryClassCode) {
		// 	infoArr.push('存货分类')
		// 	this.injections.reduce('update', { path: 'data.other.inventoryClassCode', value: true })
		// }
		if (form.inventorySet && form.inventoryCodeRule == 1 && !form.inventoryStarCode) {
			infoArr.push('存货起始编码')
			this.injections.reduce('update', { path: 'data.other.inventoryStarCode', value: true })
		}
		if (form.customerAccountSet == 1 && !form.customerParentAccountCode) {
			infoArr.push('客户往来科目上级科目')
			this.injections.reduce('update', { path: 'data.other.customerParentAccountCode', value: true })
		}
		if (form.supplierAccountSet == 1 && !form.supplierParentAccountCode) {
			infoArr.push('供应商往来科目上级科目')
			this.injections.reduce('update', { path: 'data.other.supplierParentAccountCode', value: true })
		}
		if (infoArr.length) {
			this.metaAction.toast('warning', infoArr.join('、') + '不能为空')
			return false
		} else {
			return true
		}
	}

	filterOptionSubject = (input, option) => {
		if (option && option.props && option.props.children) {
			return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
		}
		return true
	}

	//获取orgID
	getOrgId = () => {
		const org = this.metaAction.context.get('currentOrg') || {}
		return {
			headers: {
				token: org.id || ''
			}
		}
	}
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, voucherAction }),
		ret = { ...metaAction, ...voucherAction, ...o }
	metaAction.config({ metaHandlers: ret })
	return ret
}