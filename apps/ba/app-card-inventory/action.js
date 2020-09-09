import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import config from './config'
import {FormDecorator} from 'edf-component'
import debounce from 'lodash.debounce'
import {Spin} from 'edf-component'
import { fromJS } from 'immutable'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.config = config.current
		this.voucherAction = option.voucherAction
		this.webapi = this.config.webapi
		this.fetchUser = debounce(this.fetchUser, 400);
		this.lastFetchId = 0
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
		this.glAccounts()
	}

	load = async () => {
		let data = {}, response = {}, code, inventoryIsUsed,queryByparamKeys, paramKey = {}
		if (this.component.props.personId || this.component.props.personId === 0) {
			response = await this.webapi.inventory.query(this.component.props.personId)
			// inventoryIsUsed = await this.webapi.inventory.inventoryIsUsed({ inventoryId: this.component.props.personId, orgId: this.metaAction.context.get("currentOrg").id })
			// if(inventoryIsUsed){
			// 	this.metaAction.sf('data.other.inventoryCopy',fromJS(response))
			// }
		} else {
			code = await this.webapi.inventory.getCode()
		}
		//获取生成凭证设置
		await this.webapi.queryByparamKeys({"paramKeys":["CertificationGeneration_InventoryAccount","CertificationGeneration_SalesCostAccount"]})
			.then((res) => queryByparamKeys = res)
		queryByparamKeys.forEach(function (data) {
			paramKey[data.paramKey] = data.paramValue
		})
		if (code) data.code = code
		if (response) data.response = response
		let queryData = await this.webapi.inventory.queryData()
		let revenueType = await this.webapi.inventory.revenueType()
		if (queryData) data.queryData = queryData
		if (revenueType) data.queryData.revenueType = revenueType
		if (inventoryIsUsed) data.inventoryIsUsed = inventoryIsUsed
		if(paramKey) data.queryByparamKeys = paramKey
		this.injections.reduce('load', data)
		this.fetchUser()

	}

	fetchUser = async (value) => {
		if(value) value = value.trim();
		// if(value == '') return
		this.lastFetchId += 1;
		const fetchId = this.lastFetchId,form = this.metaAction.gf('data.form').toJS()
		this.injections.reduce('taxCodeLoad', {data: [], fetching: true})
		let response = await this.webapi.inventory.taxClassification({key: value, propertyId: form.property && form.property.id, propertyDetail:form.propertyDetail && !!form.propertyDetail.id ? form.propertyDetail.id : null})
		if (response) {
			if (fetchId !== this.lastFetchId) { // for fetch callback order
				return;
			}
			const data = response.map(taxData => ({
				text: taxData.key + "-" + taxData.label,
				value: taxData.label + ',' + taxData.key,
			}));
			this.injections.reduce('taxCodeLoad', {data, fetching: false}, value)
		}
	}

	glAccounts = async () => {
		let account = await this.webapi.inventory.account()
		this.injections.reduce('glAccounts', fromJS(account && account.glAccounts))
	}

	taxOption = () => {
		const data = this.metaAction.gf('data.taxCode.data') && this.metaAction.gf('data.taxCode.data').toJS()
		if (data) {
			return data.map(d => <Option title={d.text} key={d.value}>{d.text}</Option>)
		}
	}
	taxNotFound = () => {
		const fetching = this.metaAction.gf('data.taxCode.fetching')
		return fetching ? <Spin style={{marginTop: '0px'}} delay={10} size="small"/> : null
	}
	tacChange = (str) => {
		if (str) {
			this.injections.reduce('taxCodeLoad', {fetching: false})
			this.injections.reduce('taxCodeChange', str)
		} else {
            this.fetchUser()
			this.injections.reduce('taxCodeChange', str)
		}
	}

	onOk = async () => {
		return await this.save()
	}

	save = async () => {
		if (this.clickStatus) return
		this.clickStatus = true
		const form = this.metaAction.gf('data.form').toJS(),
            formCopy = this.metaAction.gf('data.formCopy').toJS(),
			isProperty = this.metaAction.gf('data.isProperty'),
			other = this.metaAction.gf('data.other').toJS()
        let response, data = {},
		    checkArr = [{
			path: 'data.form.code', value: form.code
		}, {
			path: 'data.form.name', value: form.name
		}, {
			path: 'data.form.unit', value: form.unit
		}, {
			path: 'data.form.property', value: form.property
		}, {
			path: 'data.form.rate', value: form.rate
		}]
		if (isProperty) {
			checkArr.push({
				path: 'data.form.propertyDetail', value: form.propertyDetail
			})
		}
		const ok = await this.voucherAction.check(checkArr, this.check)
		if (!ok) {
			this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
			this.clickStatus = false
			return false
		}
        if ((this.component.props.personId || this.component.props.personId === 0) && (formCopy.unit && formCopy.unit.id)  != (form.unit && form.unit.id)) {
            let isApplied2Fin = await this.webapi.inventory.isApplied2Fin({id:this.component.props.personId})
            if(isApplied2Fin == 1){
                const res = await this.metaAction.modal('confirm', {
                    content: (`此存货原计量单位：${form.unit && form.unit.name}，确认是否修改历史凭证中含有此存货辅助核算的计量单位`),
                })
                if (res) {
                    data.targetUnitId = formCopy.unit.id
                }
            }

        }
		// if(other.inventoryIsUsed){
		// 	if(other.inventoryCopy.propertyId != form.property.id || other.inventoryCopy.propertyDetail != form.propertyDetail.id){
		// 		let propertyCheck = () => {return {errorPath: 'data.other.error.property', message: '存货期初/库存单据已使用,无法修改存货分类'}}
		// 		this.voucherAction.check([{ path: 'data.form.property', value: form.property }], propertyCheck)
		// 		this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
		// 		return false
		// 	}
		// }
		
		data.taxClassificationId = form.taxClassificationId ? form.taxClassificationId : ''
		data.taxClassificationName = form.taxClassificationName ? form.taxClassificationName : ''
		data.code = form.code ? form.code.trim() : ''
		data.name = form.name ? form.name.trim() : ''
		data.specification = form.specification ? form.specification.trim() : ''
		data.unitId = form.unit ? form.unit.id : ''
		data.propertyId = form.property ? form.property.id : ''
		data.propertyDetail = form.propertyDetail ? form.propertyDetail.id : ''
		data.rate = form.rate ? form.rate.id : '';
		data.isEnable = (form.isEnable || form.isEnable === false) ? form.isEnable : ''
		data.revenueType = form.revenueType ? form.revenueType.id : ''
		data.inventoryRelatedAccountId = form.inventoryRelatedAccountId ? form.inventoryRelatedAccountId : ''
		data.salesCostAccountId = form.salesCostAccountId ? form.salesCostAccountId : ''
		data.ts = form.ts ? form.ts : ''
		data.isReturnValue = true
		data.isLoadingDefaultAccount = false
		if (this.component.props.personId || this.component.props.personId === 0) {
			data.id = this.component.props.personId
			response = await this.webapi.inventory.update(data)
		} else {
			response = await this.webapi.inventory.create(data)
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
			case 'specification':
				this.voucherAction.check([{
					path: 'data.form.specification', value: form.specification
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
		else if (option.path == 'data.form.specification') {
			return {errorPath: 'data.other.error.specification', message: option.value && option.value.trim().length > 50 ? '规格型号最大长度为50个字符' : ""}
		}
		else if (option.path == 'data.form.unit') {
			return {errorPath: 'data.other.error.unit', message: option.value ? '' : '请选择计量单位'}
		}
		else if (option.path == 'data.form.property') {
			return {errorPath: 'data.other.error.property', message: option.value ? '' : '请选择存货及服务分类'}
		}
		else if (option.path == 'data.form.rate') {
			return {errorPath: 'data.other.error.rate', message: option.value ? '' : '请选择税率'}
		}
		else if (option.path == 'data.form.propertyDetail') {
			return {errorPath: 'data.other.error.propertyDetail', message: option.value ? '' : '请选择明细分类'}
		}
	}

	fieldChange = (path, value) => {
		this.voucherAction.fieldChange(path, value, this.check)
	}

	addUnit = async () => {
		const ret = await this.metaAction.modal('show', {
			title: '新增计量单位',
			width: 350,
			height: 280,
			children: this.metaAction.loadApp(
				'app-card-unit', {
					store: this.component.props.store
				}
			)
		})

		if (ret) {
			let response = await this.webapi.unit.query()
			if (response) {
				this.injections.reduce('unit', response.list, ret)
			}
		}
	}

	addRevenueType = async () => {
		const ret = await this.metaAction.modal('show', {
			title: '新增收入类型',
			wrapClassName: 'income-expenses-card',
			width: 450,
			height: 280,
            className: 'app-card-inventory-revenueTypeAndInventory',
			footer:null,
			children: this.metaAction.loadApp(
				'scm-incomeexpenses-setting-card', {
					store: this.component.props.store,
					incomeexpensesTabId: 2001003
				}
			)
		})

		if (ret) {
			let response = await this.webapi.inventory.revenueType()
			if (response) {
				this.injections.reduce('revenueType', response, ret)
			}
		}
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
			let account = await this.webapi.inventory.account(),arg = {}
			arg.glAccounts = account.glAccounts
			arg.addItem = ret
			arg.str = str
			this.injections.reduce('glAccountsChange', arg)
		}
	}

	propertyChange = (v) => {
		v = JSON.parse(v)
		let arr = this.metaAction.gf('data.other.propertyDetail').toJS().filter((data) => {
			return v.id == data.propertyId
		})
		this.injections.reduce('propertyChange', v, arr, !this.component.props.personId)
		const form = this.metaAction.gf('data.form').toJS(),
			checkArr = [{
				path: 'data.form.property', value: form.property
			}]
		this.voucherAction.check(checkArr, this.check)
		this.fetchUser()
	}
	propertyDetailChange = (v) => {
		v = JSON.parse(v)
		let arr = this.metaAction.gf('data.other.propertyDetail').toJS().filter((data) => {
			return v.id == data.propertyId
		})
		this.injections.reduce('propertyChange', v, arr)
		const form = this.metaAction.gf('data.form').toJS(),
			checkArr = [{
				path: 'data.form.propertyDetail', value: form.propertyDetail
			}]
		this.voucherAction.check(checkArr, this.check)
		this.fetchUser()
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
