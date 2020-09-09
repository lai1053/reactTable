import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Map, fromJS } from 'immutable'
import { Checkbox, Select } from 'edf-component'
import { FormDecorator } from 'edf-component'
import { consts } from 'edf-consts'

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
		if (this.component.props.setOkListener) { this.component.props.setOkListener(this.onOk) }
		if (this.component.props.setCancelLister) {
			this.component.props.setCancelLister(this.onCancel)
		}
		injections.reduce('init')
		this.load()
	}

	load = async () => {
		const unitList = await this.webapi.queryunit(),
			currencyList = await this.webapi.currency({ entity: { isEnable: true } }),
			accountRule = await this.webapi.getAccountGrade()
		let newData = this.metaAction.gf('data').toJS(),
			{ data, active } = this.component.props,
			canModifyAccountType = true
		// accountingStandards = this.metaAction.context.get("currentOrg").accountingStandards,
		let propertyList = await this.webapi.getAccountTypeList()
		if (data) {
			canModifyAccountType = await this.webapi.canModifyAccountType({ id: data.id })
		}
		// if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2007) {//会计准则
		// 	propertyList = [{ name: '资产', id: consts.ACCOUNTTYPE_assets }, { name: '负债', id: consts.ACCOUNTTYPE_liabilities }, { name: '共同', id: consts.ACCOUNTTYPE_common }, { name: '权益', id: consts.ACCOUNTTYPE_rightsAndInterests }, { name: '成本', id: consts.ACCOUNTTYPE_cost }, { name: '损益', id: consts.ACCOUNTTYPE_profitAndLoss }]
		// } else if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2013) {
		// 	propertyList = [{ name: '资产', id: consts.ACCOUNTTYPE_assets }, { name: '负债', id: consts.ACCOUNTTYPE_liabilities }, { name: '权益', id: consts.ACCOUNTTYPE_rightsAndInterests }, { name: '成本', id: consts.ACCOUNTTYPE_cost }, { name: '损益', id: consts.ACCOUNTTYPE_profitAndLoss }]
		// } else if ((accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization)) {
		// 	propertyList = [{ name: '资产', id: consts.ACCOUNTTYPE_assets }, { name: '负债', id: consts.ACCOUNTTYPE_liabilities }, { name: '净资产', id: consts.ACCOUNTTYPE_netAssets }, { name: '收入', id: consts.ACCOUNTTYPE_income }, { name: '费用', id: consts.ACCOUNTTYPE_expenses }]
		// }		
		newData.other.canModifyAccountType = canModifyAccountType
		newData.other.unitList = unitList.list
		newData.other.currencyList = currencyList.list
		newData.other.propertyList = propertyList
		//本界面是由新增凭证打开
		if (active === 'certificate' || active == 'archives' || active == "addPrimarySubject") {
			let value,
				sonListByPidList = this.component.props.initData && this.component.props.initData.sonListByPidList,
				sonListByPcodeList = this.component.props.initData && this.component.props.initData.sonListByPcodeList,
				onlyEndNode = this.component.props.initData && this.component.props.initData.isOnlyEndNode,
				isEnable = this.component.props.initData && this.component.props.initData.isEnable,
				gradeOneCode
			if (sonListByPidList) {
				value = await this.webapi.getSonListByPidList(sonListByPidList)
			} else if (sonListByPcodeList) {
				value = await this.webapi.findSonListByPCodeList({ pCodeList: sonListByPcodeList, paramDto: { onlyEndNode, isEnable } })
			} else {
				value = await this.webapi.quertSubjects({})
			}
			gradeOneCode = await this.webapi.findGradeOneCode()
			if (active == "addPrimarySubject") { //一级科目
				newData.form.code = gradeOneCode
			}
			newData.other.subjectList = value.glAccounts
			newData.other.calcDict = { ...value.calcDict }
			newData.other.active = active
			newData.other.codeAndName = ''
			newData.form.name = this.component.props.initData && this.component.props.initData.subjectName ? this.component.props.initData.subjectName : ''

		} else if (active !== 'addPrimarySubject') {
			let oldSubject = await this.webapi.find({ id: data.id })
			let isUsed = await this.webapi.used({ id: data.id })
			newData.form = { ...oldSubject.glAccount }
			newData.other.oldSubject = { ...oldSubject.glAccount }
			newData.other.calcDict = { ...oldSubject.calcDict }
			let { code, codeAndName, isCalcMulti, isCalcQuantity, cashTypeId, grade, currencyId } = newData.form,
				isDisplayAuxAcc = !(cashTypeId == consts.CASHTYPE_001
					|| cashTypeId == consts.CASHTYPE_003), isDisplayBankAccountAux = false//【现金】【银行存款】的科目不显示辅助核算
			if (active === 'edit') {
				newData.form.code = code.length > 4 ? oldSubject['glAccount'][`codeGrade${oldSubject.glAccount.grade}`] : code
				newData.other.addonBefore = code.length > 4 ? code.slice(0, oldSubject.glAccount.code.length - oldSubject['glAccount'][`codeGrade${oldSubject.glAccount.grade}`].length) : ''
				newData.other.isUsed = isUsed
				newData.other.active = active
				newData.other.codeAndName = this.component.props.parentSubject.codeAndName
				newData.other.isDisplayBankAccountAux = isDisplayBankAccountAux
				// newData.other.isDisplayBankAccountAux = isDisplayBankAccountAux && grade > 1
				if (!data.isEndNode) {
					newData.form.canDisabledMulti = true
					newData.form.canDisabledQuantity = true
				}
			}
			else if (active === 'add') {
				//code初始值
				newData.form.code = this.component.props.newCode
				newData.form.isSystem = false
				newData.form.isEndNode = true
				newData.form.gradeName = ''
				newData.form.name = ''
				newData.other.codeAndName = codeAndName
				newData.other.addonBefore = code
				newData.other.isUsed = isUsed
				newData.other.isDisplayBankAccountAux = isDisplayBankAccountAux
				if (data.isEndNode) {
					if (isUsed) {
						//如果科目已使用，新增时辅助核算项、外币、数量全部置灰，不可修改
						newData.form.canDisabledMulti = false
						newData.form.canDisabledQuantity = false
					} else {
						newData.form.canDisabledMulti = true
						newData.form.canDisabledQuantity = true
					}
				} else {
					newData.form.canDisabledMulti = true
					newData.form.canDisabledQuantity = true
				}

			}

			//外币有选中值时判断当前选择外币是否停用，如选中值停用默认显示第一个
			if (isCalcMulti && currencyId) {
				let item = newData.other.currencyList.filter(o => o && o.id == currencyId)
				if (item.length == 0) {
					newData.form.currencyName = newData.other.currencyList[0].name
					newData.form.currencyId = newData.other.currencyList[0].id
				}
			}

			let isExist = grade > 1 ? (newData.other.addonBefore != '' ? newData.other.addonBefore.indexOf('2221') : null) : (code ? code.indexOf('2221') : null),
				multiUnit = cashTypeId == consts.CASHTYPE_005 //是否显示外币核算、计量单位

			newData.other.isExist = isExist == 0 && typeof (isExist) == 'number'
			newData.other.multiUnit = !(isExist == 0 && typeof (isExist) == 'number' || multiUnit)
			newData.other.isDisplayAuxAcc = isDisplayAuxAcc && !(isExist == 0 && typeof (isExist) == 'number')
		} else if (active == 'addPrimarySubject') {//新增一级科目
			// newData.other.active = active
			// let accountingStandards = this.metaAction.context.get("currentOrg").accountingStandards,
			// propertyList = []

			// if(accountingStandards == consts.ACCOUNTINGSTANDARDS_2013){//会计准则
			// 	propertyList = ['资产','负债','共同','权益','成本','损益']
			// }else{
			// 	propertyList = ['资产','负债','权益','成本','损益']
			// }
			// newData.other.propertyList = propertyList
			// this.metaAction.sf('data.other.propertyList', propertyList)
		}
		document.getElementById('subjectName').focus()
		newData.other.loading = false
		newData.other.accountRule = accountRule && fromJS(accountRule)
		this.injections.reduce('load', newData)
	}
	setFieldUnit = async (path, value, form) => {
		let unitList = this.metaAction.gf('data.other.unitList').toJS()
		let newUnitName = unitList.find(item => item.id == value)
		let tipMsgQuantity
		let { isUsed, oldSubject } = this.metaAction.gf('data.other').toJS()
		let newValue, isUpdateCertificateByUnit = false
		//修改了计量单位
		if (isUsed == true && oldSubject.isCalcQuantity == true) {
			//已生成凭证
			if (newUnitName && newUnitName.name !== oldSubject.unitName) {
				//启用了数量辅助核算
				tipMsgQuantity = `此科目原核算单位为${oldSubject.unitName},确认是否修改历史凭证中此科目的核算单位`
				const resultQuantity = await this.metaAction.modal('show', {
					title: '提示',
					closeModal: this.close,
					closeBack: (back) => { this.closeTip = back },
					children: (
						<div >
							{tipMsgQuantity}
						</div>
					),
					cancelText: '取消',
					okText: '确定',
					width: 400,
					height: 250
				})
				if (resultQuantity) {
					// newValue = value
					isUpdateCertificateByUnit = true
				} else {
					// newValue = oldSubject.unitId
				}
			} else {
				// newValue = oldSubject.unitId
			}

		} else {
			// newValue = value
		}
		this.metaAction.sf(path, value)
		this.metaAction.sf('data.form.isUpdateCertificateByUnit', isUpdateCertificateByUnit)
		// }
	}
	onCancel = () => {
		return
	}
	renderAddonBefore = () => {
		let addonBefore = this.metaAction.gf('data.other.addonBefore')
		let active = this.component.props.active
		if (active == 'addPrimarySubject') {
			return null
		} else {
			return (<span title={addonBefore}>{addonBefore} </span>)
		}
	}
	//新增数量、外币核算
	addCalcList = async (name) => {
		let option = { name: name }
		if (name == 'app-card-currency') {
			option.title = '币种'
		} else {
			option.title = '计量单位'
		}
		const ret = await this.metaAction.modal('show', {
			title: option.title,
			width: 400,
			children: this.metaAction.loadApp(option.name, {
				store: this.component.props.store
			}),
		})
		if (ret) {
			let newData = this.metaAction.gf('data').toJS()
			if (name == 'app-card-currency') {
				const currencyList = await this.webapi.currency({ entity: { isEnable: true } })
				newData.other.currencyList = currencyList.list.filter((o) => o.isEnable)
				newData.form.currencyId = ret.id
				let data = [], currencyId = ret.id
				newData.other.currencyList = currencyList.list
				data = currencyList.list.filter((o) => o.id == currencyId)
				if (data.length == 0) {
					newData.form.currencyId = newData.other.currencyList[0].id
				}
			} else {
				const unitList = await this.webapi.queryunit()
				newData.other.unitList = unitList.list
				newData.form.unitId = ret.id
			}
			this.injections.reduce('load', newData)
		}
	}

	//显示辅助核算复选框
	showisCalc = (data) => {
		//当前配置的辅助核算项
		let isDisplayAuxAcc = this.metaAction.gf('data.other.isDisplayAuxAcc')
		if (!data.isCalc)
			return
		let calcDict = this.metaAction.gf('data.other.calcDict').toJS(),
			list = ['isCalcCustomer', 'isCalcSupplier', 'isCalcProject', 'isCalcDepartment', 'isCalcPerson', 'isCalcInventory', 'isExCalc1', 'isExCalc2', 'isExCalc3', 'isExCalc4', 'isExCalc5', 'isExCalc6', 'isExCalc7', 'isExCalc8', 'isExCalc9', 'isExCalc10'],
			newData = []
		for (let i in list) {
			if (calcDict[list[i]]) {
				newData.push({ name: list[i], title: calcDict[list[i]], check: data[list[i]] })
			}
		}
		return newData.map((item, index) => {
			if (getBLen(item.title) > 11) {
				return <Checkbox disabled={false}
					key={index}
					defaultChecked={item.check}
					disabled={this.disabledState(data.form, item.name)}
					onClick={(v) => { this.metaAction.sf(`data.form.${item.name}`, v.target.checked) }}
				>
					<span title={item.title}>{item.title}</span>
				</Checkbox>
			}
			return <Checkbox disabled={false}
				key={index}
				defaultChecked={item.check}
				disabled={this.disabledState(data.form, item.name)}
				onClick={(v) => { this.metaAction.sf(`data.form.${item.name}`, v.target.checked) }}
			>
				{item.title}
			</Checkbox>
		})
	}

	//显示上级科目
	parentSubjectNode = () => {
		let other = this.metaAction.gf('data.other').toJS(),
			{ subjectList, active, codeAndName } = other

		if (active == 'certificate' || active == 'archives') {
			let returnOption = subjectList && subjectList.map((item) => {
				let { code, grade, cashTypeId, codeAndName, id } = item,
					disabled = false
				++grade
				if ((code.slice(0, 4).indexOf('1012') != -1 && grade != 2 && grade != 3)
					|| (code == '22210401')
					// || (code.indexOf('1001') != -1 && grade != 1)
					|| (cashTypeId == consts.CASHTYPE_033 && grade != 2)
					|| ((cashTypeId == consts.CASHTYPE_034 || cashTypeId == consts.CASHTYPE_035 || cashTypeId == consts.CASHTYPE_036 || cashTypeId == consts.CASHTYPE_037) && grade != 2)
					|| (code == '22210109')
					|| (cashTypeId == consts.CASHTYPE_005) || grade > 5) {
					disabled = true
				}
				return <Option key={code} title={codeAndName} value={id} disabled={disabled}>{codeAndName}</Option>
			})
			return <Select style={{ width: 250 }}
				filterOption={this.filterSubject.bind(this)}
				// onFocus={this.onFocus.bind(this,item.name)}
				onChange={this.changeParentSubject.bind(this)}
			>
				{returnOption}
			</Select>
		} else {
			if (getBLen(codeAndName) > 38) {
				return <span className="parentName" title={codeAndName}>{codeAndName}</span>
			}
			return <span>{codeAndName}</span>
		}
	}

	//选中上级科目时筛选匹配
	filterSubject = (inputValue, option) => {
		if (option && option.props && option.props.value && !option.props.disabled) {
			let accountingSubjects = this.metaAction.gf('data.other.subjectList')
			let itemData = accountingSubjects.find(o => o.get('id') == option.props.value)

			if ((itemData.get('code') && itemData.get('code').indexOf(inputValue) == 0)  //code左匹配
				|| (itemData.get('gradeName') && itemData.get('gradeName').indexOf(inputValue) != -1)
				|| (itemData.get('codeAndName') && itemData.get('codeAndName').indexOf(inputValue) == 0)
				|| (itemData.get('helpCode') && itemData.get('helpCode').indexOf(inputValue.toUpperCase()) != -1)) {

				//将滚动条置顶
				let select = document.getElementsByClassName('ant-select-dropdown-menu')
				if (select.length > 0 && select[0].scrollTop > 0) {
					select[0].scrollTop = 0
				}

				return true
			}
			else {
				return false
			}
		}
		return true
	}

	//选择上级科目
	changeParentSubject = async (id) => {
		const isUsed = await this.webapi.used({ id: id })
		let newData = this.metaAction.gf('data').toJS(),
			subjectList = newData.other.subjectList,
			parentSubject = subjectList.filter(subItem => {
				return parseInt(subItem.id) == parseInt(id)
			}),
			name = newData.form.name
		newData.form = { ...parentSubject[0] }
		newData.form.name = name
		newData.other.oldSubject = { ...parentSubject[0] }
		let value = await this.webapi.findFirstUnusedCode({ id: newData.form.id, code: newData.form.code, grade: newData.form.grade }),
			gradeArr = Object.keys(newData.other.accountRule),
			item = gradeArr.find(item => `${item}`.charAt(item.length - 1) == newData.form.grade + 1)
		if (value && value.newCode == '') {
			const result = await this.metaAction.modal('show', {
				title: '设置',
				closeModal: this.close,
				closeBack: (back) => { this.closeTip = back },
				children: (
					<div >
						{newData.form.code}科目下级科目编码已经超过了{value.maxCodeSize9}位，请确认是否要增加对应科目级次的编码长度
						</div>
				),
				cancelText: '取消',
				okText: '确定',
				width: 400,
				height: 250
			})
			if (result) {
				let gradeResponse = await this.webapi.getAccountGrade()
				gradeResponse[item] += 1
				let parmas = {
					...gradeResponse,
					isReturnValue: true
				}
				const res = await this.webapi.setAccountGrade(parmas)
				if (res) {
					if (res.error && res.error.message) {
						this.metaAction.toast('error', res.error.message)
						return false
					} else {
						this.metaAction.toast('success', '科目编码设置成功')
						let newCodeData = await this.webapi.findFirstUnusedCode({ id: newData.form.id, code: newData.form.code, grade: newData.form.grade })
						let response = await this.webapi.quertSubjects({})
						newData.form.code = newCodeData.newCode
						newData.other.subjectList = response.glAccounts
						newData.other.calcDict = { ...response.calcDict }
					}
				}
				++newData.form.grade
			} else {
				// this.changeParentSubject(id)
				// return
			}
		} else {
			newData.form.code = value.newCode
			++newData.form.grade
		}

		let { code, codeAndName, isCalcMulti, isCalcQuantity, cashTypeId, grade, currencyId } = newData.form,
			isDisplayAuxAcc = !(cashTypeId == consts.CASHTYPE_001
				|| cashTypeId == consts.CASHTYPE_003), isDisplayBankAccountAux = false//【现金】【银行存款】的科目不显示辅助核算
		//数量或者外币有选中值时给默认可选列表
		// isDisplayBankAccountAux = cashTypeId == consts.CASHTYPE_003 && grade != 1//判断是否是银行相关的，显示
		// isDisplayBankAccountAux = /^1002/.test(code)
		// if (cashTypeId == consts.CASHTYPE_003) {
		// 	if (/^1002/.test(code)) {
		// 		isDisplayBankAccountAux = false
		// 	} else {
		// 		isDisplayBankAccountAux = true
		// 	}
		// }
		const accountRule = this.metaAction.gf('data.other.accountRule').toJS()

		// let value = newData.form.code + generateNewSubCode(newData.form.id, code, subjectList, grade, accountRule)
		// newData.form.code = value.newCode
		newData.form.isSystem = false
		newData.form.isEndNode = true
		newData.form.gradeName = ''
		newData.form.maxCodeSize9 = value.maxCodeSize9
		newData.form.parentId = newData.form.id
		newData.other.codeAndName = codeAndName
		newData.other.isUsed = isUsed
		newData.other.isDisplayBankAccountAux = isDisplayBankAccountAux
		let isExist = value ? value.newCode.indexOf('2221') : null,
			multiUnit = cashTypeId == consts.CASHTYPE_005 //是否显示外币核算、计量单位
		newData.other.isExist = isExist == 0 && typeof (isExist) == 'number'
		newData.other.multiUnit = !(isExist == 0 && typeof (isExist) == 'number' || multiUnit)
		newData.other.isDisplayAuxAcc = isDisplayAuxAcc && !(isExist == 0 && typeof (isExist) == 'number')
		newData.form.canDisabledMulti = true
		newData.form.canDisabledQuantity = true
		console.log(parentSubject)
		if (isUsed && parentSubject[0].isEndNode) {
			//如果科目已使用，新增时辅助核算项、外币、数量全部置灰，不可修改
			newData.form.canDisabledMulti = false
			newData.form.canDisabledQuantity = false
		}

		//外币有选中值时判断当前选择外币是否停用，如选中值停用默认显示第一个
		if (isCalcMulti && currencyId) {
			let item = newData.other.currencyList.filter(o => o && o.id == currencyId)
			if (item.length == 0) {
				newData.form.currencyName = newData.other.currencyList[0].name
				newData.form.currencyId = newData.other.currencyList[0].id
			}
		}

		this.fieldChange('data.form.code', newData.form.code)
		this.injections.reduce('load', newData)
	}

	//改变外币核算或数量核算
	changeAdjustAccounts = (title, value, list, check) => {
		let newData = this.metaAction.gf('data').toJS(),
			{ form, other } = newData
		newData.form[title] = check
		if (check && other[list].length != 0) {
			newData.form[value] = other[list][0].id
		} else {
			newData.form[value] = null
		}
		this.injections.reduce('load', newData)
	}

	disabledState = (subject, title) => {
		//判断当前节点是否为末级科目
		if (!subject)
			subject = this.metaAction.gf('data.form').toJS()
		let { isUsed, codeAndName, active, oldSubject } = this.metaAction.gf('data.other').toJS(),
			status = false
		if (active == 'edit') {
			if (!subject.isEndNode) {
				// 非末级科目：辅助核算不可修改；
				// let disabled = ['isCalc','isCalcDepartment','isCalcPerson','isCalcCustomer','isCalcSupplier','isCalcInventory','isCalcProject','isCalcBankAccount','isCalcQuantity','unitId','isCalcMulti','currencyId','isEnable','isExCalc1','isExCalc2','isExCalc3','isExCalc4','isExCalc5','isExCalc6','isExCalc7','isExCalc8','isExCalc9','isExCalc10']
				// if(disabled.indexOf(title) >= 0){
				// 	status = true
				// }

				//非末级科目-预置科目
				if (subject.isSystem) {
					// 	//6.3【预置】的科目：【科目名称】不允许修改；
					if (title == 'name') {
						// status = true 
						if ((codeAndName == '1002  银行存款' || codeAndName == '1002 银行存款')) {
							status = false
						}
					}
				}
				//末级科目
			} else if (subject.isEndNode) {
				//6.6 所有的末级科目，都可以修改【停用】标识；
				if (subject.isSystem) {//末级科目-预制科目
					//6.3【预置】的科目：【科目编码、科目名称、余额方向】不允许修改；
					let disabled = ['code', 'name', 'balanceDirection']

					if (title == 'name') {
						// status = true
						if ((codeAndName == '1002  银行存款' || codeAndName == '1002 银行存款')) {
							status = false
						}
					}
					//末级科目-预制科目-已经使用的科目
					if (isUsed) {
						// 6.2已经使用的科目：
						// 科目编码只能修改最后两位，即在同一个上级科目的情况下，可以修改编码，不能与已有的科目重复；
						// 科目名称：允许修改，同一上级的科目名称不能重复；
						// 【余额方向】不允许修改；
						// 【辅助核算】不允许取消，允许启用新的辅助核算项；
						// 【数量核算】属性不允许修改；允许修改计量单位；（前提是启用了数量核算）
						// 【外币核算】属性不允许修改；允许修改默认币种；（前提是启用了外币核算）

						let disabled = ['isCalc', 'isCalcDepartment', 'isCalcPerson', 'isCalcInventory', 'isCalcCustomer', 'isCalcSupplier', 'isCalcProject', 'isCalcBankAccount', 'isCalcQuantity', 'isCalcMulti', 'isExCalc1', 'isExCalc2', 'isExCalc3', 'isExCalc4', 'isExCalc5', 'isExCalc6', 'isExCalc7', 'isExCalc8', 'isExCalc9', 'isExCalc10']
						if (disabled.indexOf(title) >= 0) {
							status = oldSubject[title]
						}
						//

					} else {//末级科目-预制科目-未使用的科目
						//6.4【预置】并且【未使用】的【末级】科目：【辅助外币、数量核算、外币核算】允许修改；
					}

				} else {//末级科目-非预制科目

					//末级科目-非预制科目-已经使用的科目
					if (isUsed) {
						// 6.2已经使用的科目：
						// 科目编码只能修改最后两位，即在同一个上级科目的情况下，可以修改编码，不能与已有的科目重复；
						// 科目名称：允许修改，同一上级的科目名称不能重复；
						// 【余额方向】不允许修改；
						// 【辅助核算】不允许取消，允许启用新的辅助核算项；
						// 【数量核算】属性不允许修改；允许修改计量单位；（前提是启用了数量核算）
						// 【外币核算】属性不允许修改；允许修改默认币种；（前提是启用了外币核算）

						let disabled = ['isCalc', 'isCalcDepartment', 'isCalcPerson', 'isCalcInventory', 'isCalcCustomer', 'isCalcSupplier', 'isCalcProject', 'isCalcBankAccount', , 'isExCalc1', 'isExCalc2', 'isExCalc3', 'isExCalc4', 'isExCalc5', 'isExCalc6', 'isExCalc7', 'isExCalc8', 'isExCalc9', 'isExCalc10']
						if (disabled.indexOf(title) >= 0) {
							status = oldSubject[title]
						}

						//末级科目-非预制科目-未使用的科目
					} else {
						//6.5 【非预置】并且【未使用】的【末级】科目：
						//科目编码只能修改最后两位，即在同一个上级科目的情况下，可以修改编码，不能与已有的科目重复；
						//科目名称：允许修改，同一上级的科目名称不能重复；
						//其它数据项可以随意修改；

					}
				}
			}
		} else {
			// console.log(oldSubject)
			// debugger
			if (oldSubject) {
				if (isUsed && oldSubject.isEndNode) {
					let disabled = ['isCalc', 'isCalcDepartment', 'isCalcPerson', 'isCalcInventory', 'isCalcCustomer', 'isCalcSupplier', 'isCalcProject', 'isCalcBankAccount', , 'isExCalc1', 'isExCalc2', 'isExCalc3', 'isExCalc4', 'isExCalc5', 'isExCalc6', 'isExCalc7', 'isExCalc8', 'isExCalc9', 'isExCalc10']
					if (disabled.indexOf(title) >= 0) {
						status = true
					}
				} else if (!oldSubject.isEndNode) {
					status = false
				}
			} else {
				status = false
			}

		}
		return status
	}
	subjectDirectionDisabled = () => {
		let subject = this.metaAction.gf('data.form').toJS()
		let { isUsed, codeAndName, active, oldSubject } = this.metaAction.gf('data.other').toJS()
		let status = false
		if (active == 'edit') {

			if (!subject.isEndNode) {
				status = false
			} else {
				if (isUsed) {
					status = true
				}
			}
		} else {
			// status = false
			if (oldSubject) {
				if (isUsed && oldSubject.isEndNode) {
					status = true
				} else if (!oldSubject.isEndNode) {
					status = false
				}
			} else {
				status = false
			}
		}
		return status
	}
	//计量单位获取焦点
	measurementUnitFocus = async () => {
		const response = await this.webapi.queryunit()
		this.metaAction.sf('data.other.unitList', fromJS(response.list))
	}

	//默认币种获取焦点
	currencyFocus = async () => {
		const response = await this.webapi.currency({ entity: { isEnable: true } })
		this.metaAction.sf('data.other.currencyList', fromJS(response.list))
	}

	//数量管理
	numberAdminClick = () => {
		this.BussClick('unit', '计量单位')
	}

	//外币核算管理
	adjustAdminClick = () => {
		this.BussClick('currency', '币种')
	}

	BussClick = async (name, title) => {

		const ret = await this.metaAction.modal('show', {
			title: title,
			width: 840,
			style: { top: 40 },
			bodyStyle: { height: 500, paddingTop: 0, },
			footer: '',
			className: 'app-proof-of-charge-modal',
			children: this.metaAction.loadApp(`app-list-${name}?from=subjects`, {
				store: this.component.props.store,
				modelStatus: 1
			}),
		})

		let newData = this.metaAction.gf('data').toJS()
		if (name == 'currency') {
			const currencyList = await this.webapi.currency({ entity: { isEnable: true } })
			let currencyId = newData.form.currencyId, data = []
			newData.other.currencyList = currencyList.list
			data = currencyList.list.filter((o) => o.id == currencyId)
			if (currencyList.list.length == 0) {
				newData.form.currencyId = undefined
			} else if (data.length == 0) {
				newData.form.currencyId = newData.other.currencyList[0].id
			}
		} else {
			const unitList = await this.webapi.queryunit()
			let unitId = newData.form.unitId, data = []
			newData.other.unitList = unitList.list
			data = unitList.list.filter((o) => o.id == unitId)
			if (unitList.list.length == 0) {
				newData.form.unitId = undefined
			} else if (data.length == 0) {
				newData.form.unitId = newData.other.unitList[0].id
			}
		}
		this.injections.reduce('load', newData)


	}
	visibleAccountType = () => {//科目属性是否显示
		let form = this.metaAction.gf('data.form').toJS(),
			active = this.metaAction.gf('data.other.active')
		if (active == 'addPrimarySubject') {//新增一级科目
			return true
		} else {
			if (active == 'add' || active == 'certificate' || active == 'archives') {//新增下级科目
				return false
			} else {
				if (form.isSystem == false && form.grade == 1) {
					return true
				} else {
					return false
				}
			}
		}
	}

	//新建科目确认按钮
	onOk = async () => {
		return await this.save()
	}

	save = async () => {

		const { createRevenueAccount = false } = this.component.props;

		const other = this.metaAction.gf('data.other').toJS()
		let form = this.metaAction.gf('data.form').toJS(),
			{ isCalcQuantity, isCalcMulti, unitId, currencyId, isCalc } = form,
			{ unitList, currencyList, oldSubject, isUsed, calcDict, active } = other,
			result = {}

		//数量或者外币有选中值时改变对应name值
		if (isCalcQuantity && unitId) {
			let item = unitList.filter(o => o && o.id == unitId)
			form.unitName = item[0].name
		}
		if (isCalcMulti && currencyId) {
			let item = currencyList.filter(o => o && o.id == currencyId)
			form.currencyName = item[0].name
		}

		let pathList = [{
			path: 'data.form.name', value: form.name
		}, {
			path: 'data.form.code', value: form.code
		}]
		if (other.isDisplayBankAccountAux) {
			pathList = pathList.concat([{
				path: 'data.form.bankCode', value: form.bankCode
			}, {
				path: 'data.form.bankName', value: form.bankName
			}])
		}
		if (other.active == 'addPrimarySubject') {
			pathList = pathList.concat([
				{ path: 'data.form.accountTypeId', value: form.accountTypeId }
			])
		}

		const ok = await this.voucherAction.check(pathList, this.check)
		let checkCalc = undefined
		let checkStyle = { textAlign: 'left', display: 'inline-block', verticalAlign: 'top' }
		if (form.isCalc) {
			let isCalcList = Object.keys(calcDict),
				select = isCalcList.filter((i) => {
					if (form[i])
						return i
				})
			checkCalc = await this.checkCalc(select)
		}
		if (!ok && checkCalc == undefined) {
			this.metaAction.toast('warning',
				<div style={checkStyle}>
					<p style={{ marginBottom: '0' }}>请按页面提示信息修改信息后才可提交</p>
				</div>
			)
			return false
		} else if (checkCalc != undefined) {
			this.metaAction.toast('warning',
				<div style={checkStyle}>
					{checkCalc ? <p style={{ marginBottom: '0' }}>{checkCalc}</p> : null}
				</div>
			)
			return false
		} else if (isCalcQuantity && !unitId) {
			this.metaAction.toast('warning',
				<div style={checkStyle}>
					<p style={{ marginBottom: '0' }}>请选择计量单位</p>
				</div>
			)
			return false
		} else if (isCalcMulti && !currencyId) {
			this.metaAction.toast('warning',
				<div style={checkStyle}>
					<p style={{ marginBottom: '0' }}>请选择默认币种</p>
				</div>
			)
			return false
		}

		form.name = form.name.trim()
		form.code = form.code.trim()
		if (other.isDisplayBankAccountAux) {
			form.bankCode = form.bankCode.trim()
			form.bankName = form.bankName.trim()
		}
		// if (active === 'certificate' || active === 'add' || active === 'archives') {
		// let value = await this.webapi.findFirstUnusedCode({ id: form.id, code: form.code, grade: form.grade }),
		// gradeArr = Object.keys(other.accountRule),
		// item = gradeArr.find(item => `${item}`.charAt(item.length - 1) == form.grade + 1)
		// if (value && value.newCode == '') {
		// const result = await this.metaAction.modal('show', {
		// 	title: '设置',
		// 	children: (
		// 		<div >
		// 			{form.code}科目下级科目编码已经超过了{form.maxCodeSize9}位，请确认是否要增加对应科目级次的编码长度
		// 			</div>
		// 	),
		// 	cancelText: '取消',
		// 	okText: '确定',
		// 	width: 400,
		// 	height: 250
		// })
		// if (result) {
		// let gradeResponse = await this.webapi.getAccountGrade()
		// gradeResponse[item] += 1
		// let parmas = {
		// 	...gradeResponse,
		// 	isReturnValue: true
		// }
		// const res = await this.webapi.setAccountGrade(parmas)
		// if (res) {
		// 	if (res.error && res.error.message) {
		// 		this.metaAction.toast('error', res.error.message)
		// 		return false
		// 	} else {
		// 		this.metaAction.toast('success', '科目编码设置成功')
		// 		let value = await this.webapi.quertSubjects({}),
		// 			newData = {}
		// 			if(value){
		// 				newData.other.subjectList = value.glAccounts
		// 		newData.other.calcDict = { ...value.calcDict }
		// 			}

		// 		newData.other.active = active
		// 		newData.other.codeAndName = ''
		// 		this.injections.reduce('load', newData)
		// 		// this.changeSubjects()
		// 	}
		// 	// return true
		// }
		// } else {
		// 	return false
		// }
		// }
		// }
		if (active === 'certificate' || active === 'add' || active === 'archives' || active === 'addPrimarySubject') {
			delete form.ts
			delete form.orgId
			delete form.exchangeRate
			delete form.AuxAccCalcInfo
			delete form.helpCode
			delete form.gradeName
			delete form.id
			delete form.codeAndName
		}

		if (!form.isCalcMulti) {
			form.currencyId = null
		}
		if (!form.isCalcQuantity) {
			form.unitId = null
		}

		//判断辅助核算是否开启
		if (!oldSubject) {//
			if (form.isCalc == false) {
				let isCalcList = Object.keys(calcDict)
				for (let i in isCalcList) {
					form[isCalcList[i]] = false
				}
			}

		} else {
			if (oldSubject.isCalc != form.isCalc && form.isCalc == false) {
				let isCalcList = Object.keys(calcDict)
				for (let i in isCalcList) {
					form[isCalcList[i]] = false
				}
			}
			else if (isUsed) {
				if (active === 'edit') {
					let isCalcList = Object.keys(calcDict),
						newCalc = []
					if (!form.isCalc) {
						let isCalcList = Object.keys(calcDict)
						for (let i in isCalcList) {
							form[isCalcList[i]] = false
						}
					} else {
						for (let i in isCalcList) {
							if (oldSubject[isCalcList[i]] != form[isCalcList[i]] && form[isCalcList[i]]) {
								newCalc.push(isCalcList[i])
							}
						}
					}

					//已使用科目新增辅助核算
					if (newCalc.length != 0 && form.isEndNode) {
						result.auxAccMap = {}
						const auxAccMap = await this.metaAction.modal('show', {
							title: '档案明细选择',
							width: 400,
							// footer: null,
							bodyStyle: { padding: 16, fontSize: 12 },
							style: { top: 40 },
							// closable: false,
							children: this.metaAction.loadApp('app-account-subjects-accounting', {
								store: this.component.props.store,
								calcDict: calcDict,
								newCalc: newCalc
							})
						})
						if (auxAccMap) {
							result.auxAccMap = auxAccMap
							// this.updateSubject()
						}
						// this.BussClick('currency')
					}
				}

			}
			if (oldSubject.isEndNode && other.active !== 'edit' && isUsed) {
				const ret = await this.metaAction.modal('confirm', {
					title: '新增科目',
					content: '新增下级科目，原科目的历史数据将会结转至新增的下级科目。此操作不能恢复，是否继续？'
				})
				if (!ret) {
					return false
				}
			}
		}


		result.form = form
		if (!form.isCalc) {
			let isCalcList = Object.keys(calcDict)
			for (let i in isCalcList) {
				form[isCalcList[i]] = false
			}
		}
		if (active === 'edit') {
			let code = oldSubject.code.length > 4 ?
				oldSubject.code.slice(0, oldSubject['code'].length - this.metaAction.gf('data.form.code').length) + this.metaAction.gf('data.form.code')
				: oldSubject.code
			// ,isUpdateSelf = result.hasOwnProperty('isUpdateSelf') ? result.isUpdateSelf : 1
			form.code = code
			let isEndNode = form.isEndNode
			// let isEndNode = this.metaAction.gf('data.form').toJS().isEndNode
			let option = { 'glAccountDto': form, "purpose": 1, "isUpdateSelf": 1 }
			let aProps = Object.getOwnPropertyNames(oldSubject)
			let bProps = Object.getOwnPropertyNames(form)
			let isEqual = { name: true, otherProperty: true }
			if (oldSubject['name'] == form['name']) {
				isEqual.name = true
			} else {
				isEqual.name = false
			}
			for (let i = 0; i < aProps.length; i++) {
				let propName = aProps[i];
				if (propName != 'name') {
					if (oldSubject[propName] !== form[propName]) {
						isEqual.otherProperty = false
						break;
					}
				}

			}
			if (isEqual.name == false && isEqual.otherProperty == true) {
				//仅仅修改科目名称，只提示名称，不提示同步下级
				const isEqualRet = await this.metaAction.modal('confirm', {
					content: '此科目已存在历史数据，确认是否修改？',
					okText: '确定',
					cancelText: '取消'
				})
				if (isEqualRet == false) {
					form.name = oldSubject.name
					// this.component.props.closeModal()
				} else {
					// this.component.props.closeModal()
				}
			} else if (isEqual.name == true && isEqual.otherProperty == false || isEqual.name == true && isEqual.otherProperty == true) {
				if (!isEndNode) {
					const ret = await this.metaAction.modal('show', {
						height: 285,
						width: 320,
						title: '提示',
						cancelText: '取消',
						okText: '确定',
						// closeModal: this.close,
						closeBack: (back) => { this.closeTip = back },
						// closable: false,
						// wrapClassName: 'initcomplete-tip',
						children: <div>是否同步所有下级科目？</div>,
					})
					if (ret) {
						option.isUpdateSelf = 0
					}
				}
			} else if (isEqual.name == false && isEqual.otherProperty == false) {
				//名称和别的属性都做了修改
				const isEqualRet = await this.metaAction.modal('confirm', {
					content: '此科目已存在历史数据，确认是否修改？',
					okText: '确定',
					cancelText: '取消'
				})
				if (isEqualRet == false) {
					form.name = oldSubject.name
					// this.component.props.closeModal()
					if (!isEndNode) {
						const ret = await this.metaAction.modal('confirm', {
							content: '是否同步下级科目？',
							okText: '确定',
							cancelText: '取消'
						})
						if (ret) {
							option.isUpdateSelf = 0
						}
					}
				} else {
					// this.component.props.closeModal()
					if (!isEndNode) {
						const ret = await this.metaAction.modal('confirm', {
							content: '是否同步下级科目？',
							okText: '确定',
							cancelText: '取消'
						})
						if (ret) {
							option.isUpdateSelf = 0
						}
					}
				}

			}


			if (result.hasOwnProperty('auxAccMap') && Object.keys(result.auxAccMap).length != 0) {
				option.auxAccMap = result.auxAccMap
			}
			if (result.hasOwnProperty('auxAccMap') && Object.keys(result.auxAccMap).length == 0) {
				return false
			}
			let unitList = this.metaAction.gf('data.other.unitList').toJS()
			let newUnitName = unitList.find(item => item.id == unitId)
			let tipMsgQuantity
			let newValue, isUpdateCertificateByUnit = false
			//修改了计量单位
			if (isUsed == true && oldSubject.isCalcQuantity == true) {
				//已生成凭证
				if (newUnitName && newUnitName.name !== oldSubject.unitName) {
					//启用了数量辅助核算
					tipMsgQuantity = `此科目原核算单位为${oldSubject.unitName},确认是否修改历史凭证中此科目的核算单位`
					const resultQuantity = await this.metaAction.modal('show', {
						title: '提示',
						closeModal: this.close,
						closeBack: (back) => { this.closeTip = back },
						children: (
							<div >
								{tipMsgQuantity}
							</div>
						),
						cancelText: '取消',
						okText: '确定',
						width: 400,
						height: 250
					})
					if (resultQuantity) {
						// newValue = value
						isUpdateCertificateByUnit = true
					}
				}

			}
			option.glAccountDto.isUpdateCertificateByUnit = isUpdateCertificateByUnit
			const response = await this.webapi.update(option)
			if (response) {
				if (!!response.errMsgs && !!response.errMsgs[0]) {
					const ret = await this.metaAction.modal('warning', {
						content: getErrMSg(response.errMsgs),
						okText: '确定',
						className: 'subjectMesWarning'
					})
				}
				this.metaAction.toast('success', '更新会计科目成功')
				response.isUpdateSelf = option.isUpdateSelf
				return response
			}
		} else if (active === 'add') {
			let { code, accountTypeId, grade, id, cashTypeId } = oldSubject
			form.code = code + form.code
			form.accountTypeId = accountTypeId ? accountTypeId : null
			form.grade = grade + 1
			form.cashTypeId = cashTypeId ? cashTypeId : null
			form.parentId = id ? id : null
			form.isEndNode = true
			if (!form.isCalcMulti) {
				form.currencyId = null
			}
			if (!form.isCalcQuantity) {
				form.unitId = null
			}
			let tip = '', isSyncBaseArchive
			if (form.code.slice(0, 4) == '1122' || form.code.slice(0, 4) == '2202') {
				const res = await this.webapi.getSyncBA(form)
				if (res.isParentEndNode && res.hasRelationRecord) {
					tip = `注：原创建${form.code.slice(0, 4) == '1122' ? '客户档案' : '供应商档案'}内的${form.code.slice(0, 4) == '1122' ? '应收' : '应付'}科目变为非末级，请档案内对应科目。`
				}
				if (res.hasSameNameBaseArchive) {
					const ret = await this.metaAction.modal('confirm', {
						// title: '新增科目',
						content: `${form.code.slice(0, 4) == '1122' ? '客户档案' : '供应商档案'}有与此科目名称相同的档案，是否关联同名${form.code.slice(0, 4) == '1122' ? '客户档案' : '供应商档案'}内的${form.code.slice(0, 4) == '1122' ? '应收' : '应付'}科目?${tip}`
					})
					if (ret) {
						isSyncBaseArchive = true
					} else {
						isSyncBaseArchive = false
					}
				} else {
					const ret = await this.metaAction.modal('confirm', {
						// title: '新增科目',
						content: `是否生成同名${form.code.slice(0, 4) == '1122' ? '客户档案' : '供应商档案'}，并关联${form.code.slice(0, 4) == '1122' ? '应收' : '应付'}科目?${tip}`
					})
					if (ret) {
						isSyncBaseArchive = true
					} else {
						isSyncBaseArchive = false
					}
				}
				form.syncBaseArchiveDto = {
					hasSameNameBaseArchive: res.hasSameNameBaseArchive,
					isParentEndNode: res.isParentEndNode,
					hasRelationRecord: res.hasRelationRecord,
					isSyncBaseArchive: isSyncBaseArchive
				}
			}
			let response;
			if (createRevenueAccount === true) {
				response = await this.webapi.createRevenueAccount(form)
			} else if (createRevenueAccount === null) {
				response = await this.webapi.createRevenueAccountForArrival(form)
			} else {
				response = await this.webapi.add(form)
			}

			if (response) {
				if (this.component.props.item) {
					await this.afterOperateDataModal({ ...this.component.props.item, operateType: '0' })
					// let importdata = await this.webapi.afterOperateTargetGlAccount({ sourceCode: this.component.props.item.sourceCode, operateType: '0', targetIsEndNode: this.component.props.item.accountDto.isEndNode })
					// if (!importdata) {
					// 	return
					// }
				}

				this.metaAction.toast('success', '新增会计科目成功')
				return response
			}
		} else if (active == "addPrimarySubject") {
			form.accountTypeId = form.accountTypeId ? form.accountTypeId : null
			form.grade = 1
			form.cashTypeId = form.cashTypeId ? form.cashTypeId : '5000020004'
			form.parentId = form.id ? form.id : null
			form.isEndNode = true
			if (!form.isCalcMulti) {
				form.currencyId = null
			}
			if (!form.isCalcQuantity) {
				form.unitId = null
			}
			let response;
			if (createRevenueAccount === true) {
				response = await this.webapi.createRevenueAccount(form)
			} else if (createRevenueAccount === null) {
				response = await this.webapi.createRevenueAccountForArrival(form)
			} else {
				response = await this.webapi.add(form)
			}
			if (response) {
				if (this.component.props.item) {
					await this.afterOperateDataModal({ ...this.component.props.item, operateType: '0', isReturnValue: true })
					// let importdata = await this.webapi.afterOperateTargetGlAccount({ sourceCode: this.component.props.item.sourceCode, operateType: '0', targetIsEndNode: this.component.props.item.accountDto.isEndNode })
					// if (!importdata) {
					// 	return
					// }
				}
				this.metaAction.toast('success', '新增会计科目成功')
				if (this.component.props.type == 'importData') {
					let str = <div>
						<span style={{fontSize:'12px'}}>新增一级科目，请在导账完成后在【财务核算】-【报表】内报表自定义公式功能内调整对应科目的报表公式，避免报表出现错误</span>
					</div>

					const ret2 = await this.metaAction.modal('show', {
						height: 285,
						width: 320,
						title: '提示',
						okText: '关闭',
						closeModal: this.close,
						closeBack: (back) => { this.closeTip = back },
						// closable: false,
						wrapClassName: 'initcomplete-tip',
						children: str
					})
				} else {
					const ret2 = await this.metaAction.modal('show', {
						height: 285,
						width: 320,
						title: '提示',
						okText: '关闭',
						closeModal: this.close,
						closeBack: (back) => { this.closeTip = back },
						// closable: false,
						wrapClassName: 'initcomplete-tip',
						children: this.getContent(response),
					})
				}
				return response
			}
		} else if (active == 'certificate') {
			let tip = '', isSyncBaseArchive
			if (form.code.slice(0, 4) == '1122' || form.code.slice(0, 4) == '2202') {
				const res = await this.webapi.getSyncBA(form)
				if (res.isParentEndNode && res.hasRelationRecord) {
					tip = `注：原创建${form.code.slice(0, 4) == '1122' ? '客户档案' : '供应商档案'}内的${form.code.slice(0, 4) == '1122' ? '应收' : '应付'}科目变为非末级，请档案内对应科目。`
				}
				if (res.hasSameNameBaseArchive) {
					const ret = await this.metaAction.modal('confirm', {
						// title: '新增科目',
						content: `${form.code.slice(0, 4) == '1122' ? '客户档案' : '供应商档案'}有与此科目名称相同的档案，是否关联同名${form.code.slice(0, 4) == '1122' ? '客户档案' : '供应商档案'}内的${form.code.slice(0, 4) == '1122' ? '应收' : '应付'}科目?${tip}`
					})
					if (ret) {
						isSyncBaseArchive = true
					} else {
						isSyncBaseArchive = false
					}
				} else {
					const ret = await this.metaAction.modal('confirm', {
						// title: '新增科目',
						content: `是否生成同名${form.code.slice(0, 4) == '1122' ? '客户档案' : '供应商档案'}，并关联${form.code.slice(0, 4) == '1122' ? '应收' : '应付'}科目?${tip}`
					})
					if (ret) {
						isSyncBaseArchive = true
					} else {
						isSyncBaseArchive = false
					}
				}
				form.syncBaseArchiveDto = {
					hasSameNameBaseArchive: res.hasSameNameBaseArchive,
					isParentEndNode: res.isParentEndNode,
					hasRelationRecord: res.hasRelationRecord,
					isSyncBaseArchive: isSyncBaseArchive
				}
			}
			let response;
			if (createRevenueAccount === true) {
				response = await this.webapi.createRevenueAccount(form)
			} else if (createRevenueAccount === null) {
				response = await this.webapi.createRevenueAccountForArrival(form)
			} else {
				response = await this.webapi.add(form)
			}

			if (response) {
				if (this.component.props.item) {

					await this.afterOperateDataModal({ ...this.component.props.item, operateType: '0', isReturnValue: true })
					// let importdata = await this.webapi.afterOperateTargetGlAccount({ sourceCode: this.component.props.item.sourceCode, operateType: '0', targetIsEndNode: this.component.props.item.accountDto.isEndNode })
					// if (!importdata) {
					// 	return
					// }
				}
				this.metaAction.toast('success', '新增会计科目成功')
				return response
			}
		} else if (active == 'archives') {
			if (form.code.slice(0, 4) == '1122' || form.code.slice(0, 4) == '2202') {
				const res = await this.webapi.getSyncBA(form)
				form.syncBaseArchiveDto = {
					hasSameNameBaseArchive: false,
					isParentEndNode: false,
					hasRelationRecord: false,
					isSyncBaseArchive: false
				}
			}
			let response;
			if (createRevenueAccount === true) {
				response = await this.webapi.createRevenueAccount(form)
			} else if (createRevenueAccount === null) {
				response = await this.webapi.createRevenueAccountForArrival(form)
			} else {
				response = await this.webapi.add(form)
			}

			if (response) {
				if (this.component.props.item) {
					await this.afterOperateDataModal({ ...this.component.props.item, operateType: '0', isReturnValue: true })
					// let importdata = await this.webapi.afterOperateTargetGlAccount({ sourceCode: this.component.props.item.sourceCode, operateType: '0', targetIsEndNode: this.component.props.item.isEndNode })
					// if (!importdata) {
					// 	return
					// }
				}
				this.metaAction.toast('success', '新增会计科目成功')
				return response
			}
		}
		return false
	}
	afterOperateDataModal = async (param) => {
		let afterOperateData
		let importdata
		importdata = await this.webapi.afterOperateTargetGlAccount(param)
		if (importdata.error && importdata.error.message) {
			return
		}
		if (importdata && importdata.status == false) {
			const importRet = await this.metaAction.modal('show', {
				title: '设置',
				children: (
					<div >
						{importdata.errMessage}
					</div>
				),
				cancelText: '取消',
				okText: '确定',
				width: 400,
				height: 250
			})
			if (importRet) {

				// do {
				await this.afterOperateDataModal({ ...this.component.props.item, operateType: '0', newGradeSetting: importdata.newGradeSetting, isReturnValue: true })
				// } while (importdata && importdata.status == false)
			} else {

				// do {
				await this.afterOperateDataModal({ ...this.component.props.item, operateType: '0', isIgnoreNoEnoughCode: true, isReturnValue: true })
				// } while (importdata && importdata.status == false)
			}

		}
	}
	close = (ret) => {
		console.log(this.closeTip)
		this.closeTip()
		if (ret) {
			// this.refresh()
		}
	}
	getContent = (content) => {
		return (
			<div>
				<span>新增一级科目后，请在 </span>
				<a onClick={this.linkReport.bind(this, content)}>报表自定义公式功能</a>
				<span> 内调整对应科目的报表公式，避免报表出现错误</span>
			</div>
		)
	}
	linkReport = (content) => {
		//资产类、负债类、权益类、共同类、成本类默认资产负债表
		//损益类默认利润表
		//收入、费用默认为业务活动表（民间非营利组织会计制度）
		this.close()
		let accountTypeId = content.accountTypeId
		if (accountTypeId == consts.ACCOUNTTYPE_profitAndLoss) {
			this.component.props.setPortalContent('利润表', 'app-profitstatement-rpt', { accessType: 1, key: 'portalShow' })
		} else if (accountTypeId == consts.ACCOUNTTYPE_income || accountTypeId == consts.ACCOUNTTYPE_expenses) {
			this.component.props.setPortalContent('业务活动表', 'app-profitstatement-rpt', { accessType: 1, key: 'portalShow' })
		} else {
			this.component.props.setPortalContent('资产负债表', 'app-balancesheet-rpt', { accessType: 1, key: 'portalShow' })
		}
	}
	//必填项校验
	check = async (fieldPathAndValues) => {
		if (!fieldPathAndValues)
			return

		let r = { ...fieldPathAndValues }
		if (fieldPathAndValues.path === 'data.form.name') {
			Object.assign(r, await this.checkName(fieldPathAndValues.value))
		}
		else if (fieldPathAndValues.path === 'data.form.code') {
			Object.assign(r, await this.checkCode(fieldPathAndValues.value))
		}
		else if (fieldPathAndValues.path === 'data.form.bankCode') {
			Object.assign(r, await this.checkBankCode(fieldPathAndValues.value))
		}
		else if (fieldPathAndValues.path === 'data.form.bankName') {
			Object.assign(r, await this.checkBankName(fieldPathAndValues.value))
		} else if (fieldPathAndValues.path === 'data.form.accountTypeId') {
			Object.assign(r, await this.checkProperty(fieldPathAndValues.value))
		}

		return r
	}

	checkName = async (name) => {
		let message

		if (!name || !name.trim()) {
			message = '请录入科目名称'
		} else if (name.length > 100) {
			message = '科目名称长度不能超过100'
		}

		return { errorPath: 'data.other.error.name', message }
	}

	checkCalc = async (select) => {
		let message

		if (select.length == 0)
			message = '请选择辅助核算'
		return message
	}

	checkBankCode = async (name) => {
		let message

		if (!name || !name.trim()) {
			message = '请录入账号'
		} else if (name.length > 50) {
			message = '银行账号长度不能超过50'
		}

		return { errorPath: 'data.other.error.bankCode', message }
	}

	checkBankName = async (name) => {
		let message

		if (!name || !name.trim()) {
			message = '请录入开户银行'
		} else if (name.length > 100) {
			message = '银行名称长度不能超过100'
		}

		return { errorPath: 'data.other.error.bankName', message }
	}
	checkProperty = async (name) => {
		console.log(name)
		let message
		if (!name || !`${name}`.trim()) {
			message = '请选择科目属性'
		}
		return { errorPath: 'data.other.error.accountTypeId', message }
	}
	checkCode = async (code, active) => {
		let message,
			regex = /^[A-Za-z0-9]+$/
		if (!code || !code.trim()) {
			if (this.component.props.active === 'certificate' || this.component.props.active === 'archives') {
				message = '请选择上级科目'
			} else {
				message = '请输入科目编码'
			}
		}
		else if (!regex.test(code))
			message = '请输入字母或数字'
		else if (code.length == 1)
			message = '科目编码结构错误'
		return { errorPath: 'data.other.error.code', message }
	}

	fieldChange = (path, value) => {
		let accountingStandards = this.metaAction.context.get("currentOrg").accountingStandards
		if (path == 'data.form.accountTypeId') {
			if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2007) {//企业准则
				if (value == consts.ACCOUNTTYPE_assets || value == consts.ACCOUNTTYPE_common || value == consts.ACCOUNTTYPE_cost || value == consts.ACCOUNTTYPE_profitAndLoss) {
					this.metaAction.sf('data.form.balanceDirection', 0)
				} else if (value == consts.ACCOUNTTYPE_liabilities || value == consts.ACCOUNTTYPE_rightsAndInterests) {
					this.metaAction.sf('data.form.balanceDirection', 1)
				}
			} else if (accountingStandards == consts.ACCOUNTINGSTANDARDS_2013) {
				if (value == consts.ACCOUNTTYPE_assets || value == consts.ACCOUNTTYPE_cost || value == consts.ACCOUNTTYPE_profitAndLoss) {
					this.metaAction.sf('data.form.balanceDirection', 0)
				} else if (value == consts.ACCOUNTTYPE_liabilities || value == consts.ACCOUNTTYPE_rightsAndInterests) {
					this.metaAction.sf('data.form.balanceDirection', 1)
				}
			} else if (accountingStandards == consts.ACCOUNTINGSTANDARDS_nonProfitOrganization) {
				if (value == consts.ACCOUNTTYPE_assets || value == consts.ACCOUNTTYPE_expenses) {
					this.metaAction.sf('data.form.balanceDirection', 0)
				} else if (value == consts.ACCOUNTTYPE_liabilities || value == consts.ACCOUNTTYPE_netAssets || value == consts.ACCOUNTTYPE_income) {
					this.metaAction.sf('data.form.balanceDirection', 1)
				}
			}
		}
		this.voucherAction.fieldChange(path, value, this.check)
	}

	renderAccountRule = (accountRule) => {
		// let newArr = []
		// for (let key in accountRule) {
		// 	newArr.push(accountRule[key])
		// }
		return accountRule.gradeStr
	}

	renderMaxlength = () => {
		const grade = this.metaAction.gf('data.form.grade')
		const accountRule = this.metaAction.gf('data.other.accountRule').toJS()
		const active = this.component.props.active
		let newGrade = active == 'add' ? accountRule[`grade${grade + 1}`] : accountRule[`grade${grade}`]
		return newGrade
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
//num传入的数字，n需要的字符长度
function PrefixInteger(num, n) {
	return (Array(n).join(0) + num).slice(-n);
}
// //生成新的科目编码
// function generateNewSubCode(parentId, parentCode, subjectList, parentGrade, gradeList) {
// 	// debugger
// 	let newCode,
// 		grade = Object.keys(gradeList),
// 		newSubjectList = subjectList.filter(subItem => {
// 			return parseInt(subItem.parentId) == parseInt(parentId)
// 		}),
// 		item = grade.find(item => `${item}`.charAt(item.length - 1) == parentGrade)
// 	if (newSubjectList.length == 0) {
// 		newCode = PrefixInteger('1', gradeList[item])
// 	} else {
// 		let endGradeList = []
// 		for (var i = 0; i < newSubjectList.length; i++) {
// 			let code = newSubjectList[i].code
// 			endGradeList.push(code.substring(code.length - parentGrade - 1))
// 		}
// 		endGradeList = endGradeList.sort(sortNumber)
// 		let maxCode = endGradeList[endGradeList.length - 1]

// 		if (maxCode == (Array(maxCode.length).join(9) + '9') && endGradeList.length < Array(maxCode.length).join(9) + '9' - 1) {
// 			maxCode = endGradeList[endGradeList.length - 2]
// 			if (!isNaN(maxCode)) {
// 				newCode = PrefixInteger(parseInt(maxCode) + 1, gradeList[item])
// 				// newCode = '00' + (parseInt(maxCode) + 1).toString()
// 				// newCode = newCode.substring(newCode.length - 2)
// 			} else {
// 				newCode = PrefixInteger('0', gradeList[item])
// 			}
// 		} else if (maxCode != '99' && !isNaN(maxCode)) {
// 			newCode = PrefixInteger(parseInt(maxCode) + 1, gradeList[item])
// 			// newCode = '00' + (parseInt(maxCode) + 1).toString()
// 			// newCode = newCode.substring(newCode.length - 2)
// 		} else {
// 			newCode = PrefixInteger('0', gradeList[item])
// 			// newCode = '00'
// 		}
// 	}
// 	console.log(newCode)
// 	return newCode
// }
function generateNewSubCode(parentId, parentCode, subjectList, parentGrade, gradeList) {
	// debugger
	// gradeList = {grade1:4, grade2:2, grade3: 4, grade4:3, grade5:2}
	let newCode,
		grade = Object.keys(gradeList),
		newSubjectList = subjectList.filter(subItem => {
			return parseInt(subItem.parentId) == parseInt(parentId)
		}),
		item = grade.find(item => `${item}`.charAt(item.length - 1) == parentGrade + 1)
	if (newSubjectList.length == 0) {
		newCode = PrefixInteger('1', gradeList[item])
	} else {
		let endGradeList = []
		for (var i = 0; i < newSubjectList.length; i++) {
			let code = newSubjectList[i].code
			endGradeList.push(code.substr(-gradeList[item]))
		}
		endGradeList = endGradeList.sort(sortNumber)
		let maxCode = endGradeList[endGradeList.length - 1]

		if (endGradeList.length < Array(gradeList[item]).join(9) + '9') {

			for (let i = 0; i < endGradeList.length; i++) {
				if (endGradeList[i + 1] - endGradeList[i] > 1) {
					console.log(i + 1)
					maxCode = endGradeList[i]
					break;
				}
			}

			// if (!isNaN(maxCode)) {
			newCode = PrefixInteger(parseInt(maxCode) + 1, gradeList[item])
			// newCode = '00' + (parseInt(maxCode) + 1).toString()
			// newCode = newCode.substring(newCode.length - 2)
			// } 
		} else {
			return ''
		}
	}
	console.log(newCode)
	return newCode
}
function sortNumber(a, b) {
	return a - b
}

//显示提醒信息
function getErrMSg(errMsgs) {
	return <div>
		{
			errMsgs.map(o => {
				return <div style={{ lineHeight: '20px', padding: '10px 0 0' }}>{o}</div>
			})
		}
	</div>
}

//获取字符串长度
function getBLen(str) {
	if (str == null) return 0;
	if (typeof str != "string") {
		str += "";
	}
	return str.replace(/[^\x00-\xff]/g, "01").length;
}
