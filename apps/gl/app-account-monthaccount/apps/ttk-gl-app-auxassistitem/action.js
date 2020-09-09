import React from 'react'
import ReactDOM from 'react-dom'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
import { fromJS } from 'immutable'
import { FormDecorator } from 'edf-component'
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
		let accountingSubject = this.component.props.initData ? this.component.props.initData.toJS() : {}

		injections.reduce('init', accountingSubject)
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}
		this.load(accountingSubject)
	}

	load = async (accountingSubject) => {
		const allArchiveDS = await this.webapi.query.allArchive({ isEnable: true })
		this.injections.reduce('load', accountingSubject, allArchiveDS)
	}
	//点击确定按钮
	onOk = async () => {
		const auxAccountSubjects = this.metaAction.gf('data.form.auxAccountSubjects')
		return await this.save(auxAccountSubjects)
	}

	getDisplayErrorMSg = (errorMsg) => {
		return <div style={{ display: 'inline-table' }}>
			{
				errorMsg.map((item, index) => <div>{(index + 1) + '.' + item}<br /></div>)
			}
		</div>
	}

	checkAuxItemEmpty = (auxAccountSubjects) => {
		let accountingSubject = this.metaAction.gf('data.form.accountingSubject'),
			errorMessage = []
		if (!!accountingSubject.get('isCalcCustomer') &&
			auxAccountSubjects.size < 1) {
			errorMessage.push('客户不能为空')
		}
		if (!!accountingSubject.get('isCalcSupplier') &&
			auxAccountSubjects.size < 1) {
			errorMessage.push('供应商不能为空')
		}
		if (!!accountingSubject.get('isCalcProject') &&
			auxAccountSubjects.size < 1) {
			errorMessage.push('项目不能为空')
		}
		if (!!accountingSubject.get('isCalcDepartment') &&
			auxAccountSubjects.size < 1) {
			errorMessage.push('部门不能为空')
		}
		if (!!accountingSubject.get('isCalcPerson') &&
			auxAccountSubjects.size < 1) {
			errorMessage.push('人员不能为空')
		}
		if (!!accountingSubject.get('isCalcInventory') &&
			auxAccountSubjects.size < 1) {
			errorMessage.push('存货不能为空')
		}

		//自定义档案
		let calcDict = this.metaAction.gf('data.form.accountingSubject.calcDict'),
			userDefineItemName
		for (var j = 1; j <= 10; j++) {
			if (!!accountingSubject.get(`isExCalc${j}`) &&
				auxAccountSubjects.size < 1) {
				userDefineItemName = calcDict.get(`isExCalc${j}`)
				errorMessage.push(`${userDefineItemName}不能为空`)
			}
		}
		return errorMessage
	}
	getSubjectWithAuxName = (accountingSubject, auxAccountSubjects = List()) => {
		if (!accountingSubject || (typeof accountingSubject != 'object')) return ''
		let subjectWithAuxName = '', auxId = ''
		if (accountingSubject.get('isCalcCustomer') && auxAccountSubjects.get('customer') && auxAccountSubjects.get('customer').get('name')) {
			subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get('customer').get('name')
			auxId = auxAccountSubjects.get('customer').get('id')
		}
		if (accountingSubject.get('isCalcSupplier') && auxAccountSubjects.get('supplier') && auxAccountSubjects.get('supplier').get('name')) {
			subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get('supplier').get('name')
			auxId = auxAccountSubjects.get('supplier').get('id')
		}
		if (accountingSubject.get('isCalcProject') && auxAccountSubjects.get('project') && auxAccountSubjects.get('project').get('name')) {
			subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get('project').get('name')
			auxId = auxAccountSubjects.get('project').get('id')
		}
		if (accountingSubject.get('isCalcDepartment') && auxAccountSubjects.get('department') && auxAccountSubjects.get('department').get('name')) {
			subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get('department').get('name')
			auxId = auxAccountSubjects.get('department').get('id')
		}
		if (accountingSubject.get('isCalcPerson') && auxAccountSubjects.get('person') && auxAccountSubjects.get('person').get('name')) {
			subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get('person').get('name')
			auxId = auxAccountSubjects.get('person').get('id')
		}
		if (accountingSubject.get('isCalcInventory') && auxAccountSubjects.get('inventory') && auxAccountSubjects.get('inventory').get('name')) {
			subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get('inventory').get('name')
			auxId = auxAccountSubjects.get('inventory').get('id')
		}
		for (var j = 1; j <= 10; j++) {
			if (accountingSubject.get(`isExCalc${j}`) && auxAccountSubjects.get(`exCalc${j}`) && auxAccountSubjects.get(`exCalc${j}`).get('name')) {
				subjectWithAuxName = subjectWithAuxName + "_" + auxAccountSubjects.get(`exCalc${j}`).get('name')
				auxId = auxAccountSubjects.get(`exCalc${j}`).get('id')
			}
		}
		return { subjectWithAuxName, auxId }
	}
	save = async (auxAccountSubjects) => {
		let errorMessage = this.checkAuxItemEmpty(auxAccountSubjects)
		if (errorMessage.length > 0) {
			this.metaAction.toast('warning', this.getDisplayErrorMSg(errorMessage), 10)
			return false
		}
		let accountingSubject = this.metaAction.gf('data.form.accountingSubject')
		return this.getSubjectWithAuxName(accountingSubject, auxAccountSubjects)
	}


	onFieldChange = (src, fieldName) => (v) => {
		const hit = src.find(o => o.id == v)
		if (hit)
			this.metaAction.sf(fieldName, fromJS(hit))
		else
			this.metaAction.sf(fieldName, v)
	}

	componentDidUpdate = () => {
		let dom = document.getElementsByClassName('ttk-gl-app-auxassistitem')[0]
		if (dom) {
			setTimeout(() => {
				let c = dom.children[0].children[1].getElementsByClassName('ant-select-selection')[0]
				if (c) {
					c.tabIndex = 0
					c.focus()
				}
			}, 0)
		}
	}

	getDisplayValue = (curArchiveObj, archiveList) => {
		if (!curArchiveObj) return ''
		let ret = '',
			filterResult = archiveList.filter(item => {
				return item.id == curArchiveObj.id
			})
		if (filterResult && filterResult.length > 0) {
			ret = curArchiveObj.id
		} else {
			ret = curArchiveObj.name
		}
		return ret
	}

	archiveFocus = async (archiveName) => {
		let params

		if (archiveName == 'department') {
			params = { entity: { isEnable: true, isEndNode: true } }
		} else {
			params = { entity: { isEnable: true } } //获取没有停用基础档案
		}

		if (archiveName.indexOf('exCalc') > -1) {
			let index = archiveName.substr(archiveName.length - 1, 1)
			const parmasObj = { entity: { calcName: `isExCalc${index}`, isEnable: true } }
			const response = await this.webapi.query.userDefineItem(parmasObj)

			this.metaAction.sf(`data.other.${archiveName}`, fromJS(response.list))
		} else {
			const response = await this.webapi.query.fixedArchive(params, archiveName)

			this.metaAction.sf(`data.other.${archiveName}`, fromJS(response.list))
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
