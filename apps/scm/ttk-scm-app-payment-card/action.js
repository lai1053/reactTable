import React from 'react'
import ReactDOM from 'react-dom'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { Map, fromJS } from 'immutable'
import moment from 'moment'
import utils, { fetch } from 'edf-utils'
import extend from './extend'
import { consts, common } from 'edf-constant'
import { FormDecorator, Select, Checkbox, Form, DatePicker, Button, Popover, ShortKey, Input, Icon, ColumnsSetting } from 'edf-component'

import { blankDetail } from './data';

const Option = Select.Option
const FormItem = Form.Item

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.extendAction = option.extendAction
		this.voucherAction = option.voucherAction
		this.config = config.current
		this.webapi = this.config.webapi
	}

	onInit = ({ component, injections }) => {
		this.extendAction.gridAction.onInit({ component, injections })
		this.voucherAction.onInit({ component, injections })
		this.component = component
		this.injections = injections
		this.cascaderVisible = false
		this.editing = false
		let addEventListener = this.component.props.addEventListener
		let addTabsCloseListen = this.component.props.addTabsCloseListen
		if (addEventListener) {
			addEventListener('onTabFocus', :: this.onTabFocus)
			addEventListener('enlargeClick', () => this.getDom({}))
		}
		if (addTabsCloseListen) {
			addTabsCloseListen('ttk-scm-app-payment-card', () => this.editing)
		}
		injections.reduce('init')
		this.initLoad(this.component.props.id || null) //4445862265978880
	}

	initLoad = async (id) => {
		// id = 4574920094597120
		const response = await this.webapi.payment.init({ id: id })
		response.initId = id
		if (this.component.props.bankAccountId && !id) {
			response.bankAccountId = this.component.props.bankAccountId
		}
		let accounts = await this.webapi.payment.bankAccount({ entity: { isEnable: true }, status: true })
		response.accountList = accounts.list.filter(o => o.bankAccountTypeName !== '冲减预收款' && o.bankAccountTypeName !== '冲减预付款')
		this.injections.reduce('initLoad', response)
		if (!response.voucher) {
			this.metaAction.toast('error', '该单据已经不存在')
		}
		setTimeout(() => {
			const id = this.metaAction.gf('data.form.id')
			if (!id) {
				this.handleKeyDown({ key: 'Enter' }, 0)
			}
		}, 4)
	}

	load = (voucher) => {
		this.injections.reduce('load', voucher)
	}

	renderStyle = () => {
		const detailHeight = this.metaAction.gf('data.other.detailHeight')
		return { height: detailHeight }
	}

	getDom = (e) => {
		const dom = document.querySelector('.ttk-scm-app-payment-card-form-details')
		if (!dom) {
			if (e) {
				return
			}
			return setTimeout(() => {
				return this.getDom()
			}, 200)
		}
		const count = Math.ceil(dom.offsetHeight / 34) - 2
		const details = this.metaAction.gf('data.form.details').toJS()
		while (details.length < count) {
			details.push(blankDetail);
		}
		this.metaAction.sfs({
			'data.other.detailHeight': count,
			'data.form.details': fromJS(details)
		})

		// this.injections.reduce('setrowsCount', details, details.length)
	}

	componentDidMount = () => {
		this.getDom()
		const win = window
		if (win.addEventListener) {
			document.body.addEventListener('keydown', this.bodyKeydownEvent, false)
			window.addEventListener('resize', this.getDom, false)
		} else if (win.attachEvent) {
			document.body.attachEvent('onkeydown', this.bodyKeydownEvent)
			window.attachEvent('onresize', this.getDom)
		}

		let thisStub = this
		setTimeout(() => {
			let dom = document.getElementsByClassName('ttk-scm-app-payment-card-form-header')[0] //ReactDOM.findDOMNode(thisStub.refs.auxItem)
			if (dom) {
				if (dom.addEventListener) {
					dom.addEventListener('keydown', :: thisStub.handleKeyDown, false)
				} else if (dom.attachEvent) {
					dom.attachEvent('onkeydown', :: thisStub.handleKeyDown)
				} else {
					dom.onKeyDown = :: thisStub.handleKeyDown
				}
			}
		}, 0)
	}

	handleKeyDown(e, index) {
		if (!this.getVoucherVisible()) {
			return
		}
		if (e.key === 'Enter' || e.keyCode == 13 || e.keyCode == 108) {
			let dom = document.getElementsByClassName('ttk-scm-app-payment-card-form-header')[0]  //ReactDOM.findDOMNode(this.refs.auxItem)

			if (dom) {
				setTimeout(() => {
					let nextFocusIndex = this.getNextFocusIndex()
					if (index) {
						nextFocusIndex = index
					}
					if (nextFocusIndex > -1) {
						let c = dom.children[nextFocusIndex].children[1].getElementsByClassName('autoFocus_item')[0]
						if (c) {
							if (c.className && c.className.includes('ant-calendar-picker')) {
								c = $(c).find('input')[0]
							}
							c.tabIndex = 0
							c.focus()
							c.click()
						}
					}
				}, 0)
			}
		}
	}

	getNextFocusIndex() {
		let nextFocusIndex
		nextFocusIndex = $(document.activeElement).parents('.ant-row').index()
		const length = $(document.activeElement).parents('.ant-row').siblings().length

		nextFocusIndex++
		if (nextFocusIndex == length + 1) {
			let dom = document.getElementsByClassName('ttk-scm-app-payment-card-form-header')[0]
			// console.log(this.metaAction.gf('data.other.focusFieldPath'))
			if (dom) {
				try {
					let c = dom.children[nextFocusIndex - 1].children[1].getElementsByClassName('autoFocus_item')[0]
					if (c) {
						c.blur()
					}
				} catch (err) {
					console.log(err)
				}

			}

			setTimeout(() => {
				this.metaAction.sf('data.other.focusFieldPath', 'root.children.content.children.details.columns.proceedsType.cell.cell,0')
				setTimeout(() => {
					let a = $('.ttk-scm-app-payment-card-form-details').find('.ant-cascader-input')
					a.focus()
					a.click()
				}, 0)
			}, 16)
		}
		return nextFocusIndex > length ? -1 : nextFocusIndex
	}

	componetWillUnmount = () => {
		const win = window
		if (win.removeEventListener) {
			document.body.removeEventListener('keydown', this.bodyKeydownEvent, false)
			window.removeEventListener('onresize', this.getDom, false)
		} else if (win.detachEvent) {
			document.body.detachEvent('onkeydown', this.bodyKeydownEvent)
			window.detachEvent('onresize', this.getDom)
		}
	}

	bodyKeydownEvent = (e) => {
		const dom = document.getElementById('ttk-scm-app-payment-card')
		const modalBody = document.getElementsByClassName('ant-modal-body')
		if (dom && modalBody && modalBody.length < 1) {
			this.keyDownCickEvent({ event: e })
		}
	}

	//监听键盘事件
	keyDownCickEvent = (keydown) => {
		if (keydown && keydown.event) {
			let e = keydown.event
			if (e.ctrlKey && e.altKey && (e.key == 'n' || e.keyCode == 78)) { //新增
				this.add()
				if (e.preventDefault) {
					e.preventDefault()
				}
				if (e.stopPropagation) {
					e.stopPropagation()
				}
			}
			else if (e.ctrlKey && !e.altKey && (e.key == 's' || e.keyCode == 83)) { //保存
				this.save(false)
				if (e.preventDefault) {
					e.preventDefault()
				}
				if (e.stopPropagation) {
					e.stopPropagation()
				}
			}
			else if (e.ctrlKey && !e.altKey && (e.key == '/' || e.keyCode == 191)) {//保存并新增
				this.save(true)
				if (e.preventDefault) {
					e.preventDefault()
				}
				if (e.stopPropagation) {
					e.stopPropagation()
				}
			}
			else if (e.ctrlKey && !e.altKey && (e.key == 'y' || e.keyCode == 89)) {
				//审核
				this.audit()
				if (e.preventDefault) {
					e.preventDefault()
				}
				if (e.stopPropagation) {
					e.stopPropagation()
				}
			}
			//判断设备是否为mac
			else if (navigator.userAgent.indexOf('Mac OS X') !== -1) {
				if (e.ctrlKey && !e.altKey && (e.key == "[" || e.keyCode == 219)) {
					//上一张
					this.prev()
				}

				else if (e.ctrlKey && !e.altKey && (e.key == "]" || e.keyCode == 221)) {
					//下一张
					this.next()
				}
			} else {
				if (e.ctrlKey && !e.altKey && (e.key == "[" || e.keyCode == 37 || e.keyCode == 219)) {
					//219 win7 IE11下的keyCode
					//上一张
					this.prev()
				}
				else if (e.ctrlKey && !e.altKey && (e.key == "]" || e.keyCode == 39 || e.keyCode == 221)) {
					//221 win7 IE11下的keyCode
					//下一张
					this.next()
				}
			}
		}
	}

	onTabFocus = async (props) => {
		if(props.size) props = props.toJS()
		if (props.id && props.accessType != 0) {
			await this.initLoad(props.id)
		} else if (props.isNew) {
			await this.initLoad()
		} else if (props.accessType == 0) {
			// const id = this.metaAction.gf('data.form.id')
			// if( id ) {
			// 	await this.initLoad(id)
			// }else{
			// 	await this.initParams()
			// }
		}else{
			await this.initLoad()
		}
		this.initOption()
	}

	initOption = async () => {
		let obj = {}
		const list = [
			this.webapi.payment.customer({ entity: { isEnable: true } }),
			this.webapi.payment.supplier({ entity: { isEnable: true } }),
			this.webapi.payment.person({ entity: { isEnable: true } }),
			this.voucherAction.getBankAccount({ entity: { isEnable: true } }, 'data.other.bankAccountList'),
			this.voucherAction.getDepartment({ entity: { isEnable: true } }, 'data.other.department'),
			this.voucherAction.getProject({ entity: { isEnable: true } }, 'data.other.project'),
		]
		const [customerList, supplierList, personList] = await Promise.all(list)
		const assetClassesList = this.metaAction.gf('data.other.assetClassesList').toJS()
		const businessTypes = this.metaAction.gf('data.other.businessTypes').toJS()
		const { bankAccountList, department, project } = this.metaAction.gf('data.other').toJS(),
			form = this.metaAction.gf('data.form').toJS()
		const { details, bankAccountId, bankAccountName } = form
		const bankAccountFlag = bankAccountList.find(item => item.id == bankAccountId)
		const status = form.status
		const VOUCHERSTATUS_Approved = this.metaAction.gf('data.consts.VOUCHERSTATUS_Approved')
		if( status && status == VOUCHERSTATUS_Approved  ) {
			this.metaAction.sfs(obj)
			return
		}
		if (!bankAccountFlag) {
			obj['data.form.bankAccountId'] = null
			obj['data.form.bankAccountName'] = null
		} else {
			if (bankAccountName != bankAccountFlag.name) {
				obj['data.form.bankAccountName'] = null
			}
		}
		details.forEach((item, index) => {
			let {
				departmentId, departmentName, projectId, projectName,
				businessTypeFatherName, businessTypeArrName, businessTypeId, businessTypeName
			} = item
			this.checkDetailsOptionIsHave({
				arr: department,
				id: departmentId,
				name: departmentName,
				index: index,
				obj: obj,
				key: 'department'
			})
			this.checkDetailsOptionIsHave({
				arr: project,
				id: projectId,
				name: projectName,
				index: index,
				obj: obj,
				key: 'project'
			})
			// 判断付款类型是否存在
			if (businessTypeId) {
				const father = businessTypes.find(item => item.id == businessTypeArrName[0])
				let flag = false
				if (father) {
					if (father.children) {
						const child = father.children.find(item => item.id == businessTypeArrName[1])
						if (child) {
							if (child.name != businessTypeName) {
								obj[`data.form.details.${index}.businessTypeName`] = child.name
							}
							if (child.fatherName != businessTypeFatherName) {
								obj[`data.form.details.${index}.businessTypeFatherName`] = child.fatherName
							}
						} else {
							flag = true
						}
					} else {
						flag = true
					}
				} else {
					flag = true
				}
				if (flag) {
					obj[`data.form.details.${index}.calcObject`] = null
					obj[`data.form.details.${index}.businessTypeId`] = null
					obj[`data.form.details.${index}.businessTypeFatherName`] = null
					obj[`data.form.details.${index}.businessTypeArrName`] = fromJS([])
					obj[`data.form.details.${index}.businessTypeName`] = null
					const childKeyArr = ["customer", "person", "supplier", "assetClass"]
					childKeyArr.forEach(function (item) {
						obj[`data.form.details.${index}.${item}Id`] = null
					})
				} else {
					this.checkDetailsOptionPersonal({
						customerList, supplierList, personList,
						assetClassesList, index, value: item, obj: obj
					})
				}
			}
		})
		this.metaAction.sfs(obj)
	}



	checkDetailsOptionPersonal = ({ customerList, supplierList, personList, assetClassesList, value, obj, index }) => {
		let list
		switch (value.calcObject) {
			case "customer":
				list = customerList.list
				break
			case 'person':
				list = personList.list
				break
			case 'supplier':
				list = supplierList.list
				break
			case 'assetClass':
				list = assetClassesList
				break
			default:
				list = []
		}
		const child = list.find(item => item.id == value.personId || item.id == value.customerId || item.id == value.supplierId || item.id == value.assetClassId)
		if (child) {
			if (value.deptPersonName != child.name) {
				obj[`data.form.details.${index}.deptPersonName`] = child.name
			}
		} else {
			obj[`data.form.details.${index}.deptPersonName`] = null
			obj[`data.form.details.${index}.deptPersonId`] = null
		}
	}

	checkDetailsOptionIsHave = ({ arr, id, name, index, obj, key }) => {
		if (!arr || !id || !obj) return
		const flag = arr.find(item => item.id == id)
		if (flag) {
			if (flag.name != name) {
				obj[`data.form.details.${index}.${key}Name`] = flag.name
			}
		} else {
			obj[`data.form.details.${index}.${key}Id`] = null
			obj[`data.form.details.${index}.${key}Name`] = null
		}
	}

	editCloseTips = (istip) => {
		this.editing = istip
	}
	initParams = async (id) => {
		const response = await this.webapi.payment.init({ id: id })
		this.parseInitOption(response)
	}

	parseInitOption = (response) => {
		response.businessTypes.forEach(function (data) {
			data.label = data.name
			data.value = data.id
			data.children && data.children.forEach(function (childrenData) {
				childrenData.label = childrenData.name
				childrenData.value = childrenData.id
				childrenData.fatherName = data.name
				childrenData.fatherId = data.id
			})
		})
		this.metaAction.sf('data.other.businessTypes', fromJS(response.businessTypes))
	}

	prev = async () => {
		if (this.editing) {
			const ret = await this.metaAction.modal('confirm', {
				content: '当前单据尚未保存，还要离开吗？'
			})
			console.log(ret)
			if (!ret) return
		}
		const code = this.metaAction.gf('data.form.code')
		const response = await this.webapi.payment.previous({ code, isReturnValue: true })
		if (response) {
			if (response.result == false && response.error) {
				this.metaAction.sfs({
					'data.other.prevDisalbed': true,
					'data.other.nextDisalbed': false
				})
				this.metaAction.toast('error', response.error.message)
			} else {
				this.metaAction.sf('data.other.nextDisalbed', false)
				this.injections.reduce('setSaveStatus', true)
				this.load(response)
			}
		}
		this.editCloseTips(false)
	}

	next = async () => {
		if (this.editing) {
			const ret = await this.metaAction.modal('confirm', {
				content: '当前单据尚未保存，还要离开吗？'
			})
			console.log(ret)
			if (!ret) return
		}
		const code = this.metaAction.gf('data.form.code')
		const response = await this.webapi.payment.next({ code, isReturnValue: true })
		if (response) {
			if (response.result == false && response.error) {
				this.metaAction.sfs({
					'data.other.prevDisalbed': false,
					'data.other.nextDisalbed': true
				})
				this.metaAction.toast('error', response.error.message)
			} else {
				this.metaAction.sf('data.other.prevDisalbed', false)
				this.injections.reduce('setSaveStatus', true)
				this.load(response)
			}
		}
		this.editCloseTips(false)
	}

	renderPZZH = () => {
		const docCode = this.metaAction.gf('data.form.docCode')

		if (/已生成/.test(docCode)) {
			return docCode ? docCode : ''
		} else {
			return docCode ? `记-${docCode}` : ''
		}
	}
	docCode = () => {
		const docCode = this.metaAction.gf('data.form.docCode')
      
        if (/已生成/.test(docCode)) {
			const code = docCode.replace(/[已生成|凭证]/g, '');
            this.metaAction.toast('error', `请在${code}凭证管理查看生成的凭证`)
        }else {
			let form = this.metaAction.gf('data.form').toJS()
			this.component.props.setPortalContent &&
				this.component.props.setPortalContent('填制凭证', 'app-proof-of-charge', { accessType: 1, initData: { id: form.docId } })
		}
	}

	// 设置
	setting = async () => {
		// this.metaAction.toast('error', '请实现设置功能')
		let setting = this.metaAction.gf('data.other.columnSetting')
		let initOption = []
		setting = setting && setting.toJS()
		if (setting && setting.body) {
			let obj = {
				key: setting.code,
				name: setting.name
			}
			if (setting.header) {
				obj.option = setting.header.cards
			}
			let detailObj = {}
			const objItem = setting.body.tables[0]
			if (objItem) {
				detailObj.key = objItem.name
				detailObj.name = objItem.caption
				detailObj.option = objItem.details
			}
			initOption.push(obj)
			initOption.push(detailObj)
		}
		const res = await this.metaAction.modal('show', {
			title: '显示设置',
			width: 500,
			footer: null,
			iconType: null,
			bodyStyle: { fontFamily: 'Microsoft YaHei' },
			children: <ColumnsSetting
				option={initOption}
				singleKey='id'
				sort={false}
				editName={false}
				checkedKey='isVisible'
				labelKey="caption"
			/>
		})
		if (res && res.type == 'confirm') {
			this.handleConfirmSet(res.option)
		} else if (res && res.type == 'reset') {
			this.handleResetSet(setting.code)
		}
	}
	//设置 恢复默认设置
	handleResetSet = async (code) => {
		if (code) {
			const result = await this.webapi.payment.reInitByUser({ code: code })
			this.metaAction.sf('data.other.columnSetting', fromJS(result))
		}
	}
	//设置 确定
	handleConfirmSet = async (params) => {
		if (params) {
			const setting = this.metaAction.gf('data.other.columnSetting').toJS()
			const cards = params[0] && params[0].option
			const tables = params[1] && params[1].option
			if (setting) {
				setting.header.cards = cards
				setting.body.tables[0].details = tables
			}
			const result = await this.webapi.payment.updateWithDetail(setting)
			this.metaAction.sf('data.other.columnSetting', fromJS(result))
		}
	}

	add = () => {
		this.initLoad()
	}

	audit = async () => {
		const id = this.metaAction.gf('data.form.id'),
			ts = this.metaAction.gf('data.form.ts'),
			status = this.metaAction.gf('data.form.status')
		if (!id && !ts) {
			this.metaAction.toast('error', '请保存单据')
			return
		}

		let isAuditEdit = this.metaAction.gf('data.other.isAuditEdit')
		if (!isAuditEdit) return
		this.injections.reduce('update', { path: 'data.other.isAuditEdit', value: false })
		if (status == consts.consts.VOUCHERSTATUS_NotApprove || status == consts.consts.VOUCHERSTATUS_Rejected) {
			const response = await this.webapi.payment.audit({ id, ts })
			this.injections.reduce('update', { path: 'data.other.isAuditEdit', value: true })
			if (response) {
				this.metaAction.toast('success', '单据生成凭证成功')
				this.load(response)
			}
		} else {
			const response = await this.webapi.payment.unaudit({ id, ts })
			this.injections.reduce('update', { path: 'data.other.isAuditEdit', value: true })
			if (response) {
				this.metaAction.toast('success', '单据删除凭证成功')
				this.load(response)
				this.initOption()
			}
		}
	}

	getAuditBtnText = () => {
		const status = this.metaAction.gf('data.form.status')
		return status == consts.consts.VOUCHERSTATUS_Approved ? '删除凭证' : '生成凭证'
	}

	history = () => {
		this.component.props.setPortalContent('付款单列表', 'ttk-scm-app-payment-list', {})
	}

	moreMenuClick = (e) => {
		switch (e.key) {
			case 'del':
				this.del()
				break
			case 'pay':
				this.pay()
				break
			case 'antiAudit':
				this.audit()
				break
		}
	}

	del = async () => {
		const id = this.metaAction.gf('data.form.id'),
			ts = this.metaAction.gf('data.form.ts')
		const ret = await this.metaAction.modal('confirm', {
			title: '删除',
			content: '确认删除?'
		})
		if (ret) {
			const response = await this.webapi.payment.delete({ id, ts })
			this.metaAction.toast('success', '删除单据成功')
			this.initLoad()
		}
	}

	generateReturn = async () => {
		let id = this.metaAction.gf(`data.form.id`),
			ts = this.metaAction.gf(`data.form.ts`)
		if (!id && !ts) {
			this.metaAction.toast('error', '请保存单据!')
			return
		}
		this.metaAction.toast('error', 'TODO')
	}

	pay = () => {
		this.metaAction.toast('error', 'TODO')
	}

	// 认证状态 手工录入 采集 导入
	isShowAuthenticated = () => {
		const form = this.metaAction.gf('data.form') && this.metaAction.gf('data.form').toJS()
		if (form && (form.id || form.id == 0)) {
			if (form.voucherSource && form.voucherSource != "4000090001") {
				return true
			}
		} else {
			return false
		}
	}

	save = async (isNew) => {
		let form = this.metaAction.gf('data.form').toJS(), detailsArr = []

		if (!this.checkForSave(form.details)) return false
		form.details.map(item => {
			if (item.businessTypeId || item.remark || item.fees || item.amount || item.projectId || item.customerId || item.supplierId || item.departmentId || item.personId) {
				if (!item.personId) item.personId = ''
				if (!item.customerId) item.customerId = ''
				if (!item.supplierId) item.supplierId = ''
				detailsArr.push(item)
			}
		})
		form.details = detailsArr
		if (!form.details.length) {
			this.metaAction.toast('error', '明细不能为空')
			return
		}
		let { attachmentFiles, ...otherParmas } = form
		let params = {
			...otherParmas,
			attachments: attachmentFiles
		}
		if (form.id || form.id == 0) {
			params.isReturnValue = true
			const response = await this.webapi.payment.update(params)
			if (response && response.result == false) {
				this.metaAction.toast('error', response.error.message)
			} else {
				this.metaAction.toast('success', '保存更新成功')
				this.editCloseTips(false)
				if (!isNew) {
					this.load(response)
					this.injections.reduce('setSaveStatus', true)
				} else {
					this.initLoad()
				}
			}
		} else {
			params.isReturnValue = true
			const response = await this.webapi.payment.create(params)
			if (response && response.result == false) {
				this.metaAction.toast('error', response.error.message)
			} else {
				this.metaAction.toast('success', '保存单据成功')
				this.editCloseTips(false)
				if (!isNew) {
					this.load(response)
					this.injections.reduce('setSaveStatus', true)
				} else {
					this.initLoad()
				}
			}
		}
	}

	checkForSave = (details) => {
		let msg = []
		for (let i = 0; i < details.length; i++) {
			let str = ''
			if (details[i].businessTypeId || details[i].remark || details[i].fees || details[i].amount || details[i].projectId || details[i].customerId || details[i].supplierId || details[i].departmentId || details[i].personId) {
				if (details[i].businessTypeId == null) {
					str = `${str} 第${i + 1}行收款类型不能为空`
				}
				/*if (!details[i].personId && !details[i].customerId && !details[i].supplierId) {
					str = `${str} 第${i+1}行往来单位及个人不能为空！`
				}*/
				if (!details[i].amount) {
					str = `${str} 第${i + 1}行金额不能为空或0`
				}
				if (details[i].amount && details[i].fees && details[i].amount < details[i].fees) {
					if (details[i].amount > 0) str = `${str} 第${i + 1}行金额不能小于手续费`
				}
				if (str) msg.push(str)
			}
		}
		if (msg.length > 0) {
			this.metaAction.toast('error', this.getDisplayErrorMSg(msg))
			return false
		}
		return true
	}

	getDisplayErrorMSg = (msg) => {
		return <div style={{ display: 'inline-table', textAlign: 'left' }}>{msg.map(item => <div>{item}<br /></div>)}</div>
	}
	cancel = () => {
		this.injections.reduce('init')
	}

	onFieldChange = (field, storeField, rowIndex, rowData, index) => (id, selectedOptions) => {
		if (!field || !storeField) return
		this.injections.reduce('setSaveStatus', false)
		this.editCloseTips(true)
		let that = this, value
		if (storeField != 'data.other.businessTypes') {
			value = this.metaAction.gf(storeField).find(o => o.get('id') == id)
			if (value) {
				Object.keys(field).forEach(key => {
					this.metaAction.sf(field[key], value.get(key))
				})
			}
		} else {
			Object.keys(field).forEach(key => {
				if (key != 'arrName') {
					this.metaAction.sf(field[key], selectedOptions[1][key]);
				} else {
					this.metaAction.sf(field[key], id);
				}
			})
			let data = this.metaAction.gf('data').toJS()
			data.form.details[rowIndex].deptPersonId = undefined
			data.form.details[rowIndex].deptPersonName = undefined
			this.metaAction.sf('data.form.details', fromJS(data.form.details))
		}

		if (storeField == 'data.other.businessTypes') { //当改变存货名称或编码时以下数据也要发生更改
			if (id[1] == 3001001001003 || id[1] == 3001001001004) {
				this.metaAction.sf('data.form.codeDisplay', true)
			} else {
				this.metaAction.sf('data.form.codeDisplay', false)
			}
			let data = this.metaAction.gf('data').toJS(), str = ''
			data.form.details.forEach(function (data) {
				if (data.businessTypeFatherName != null) {
					str = str + data.businessTypeFatherName + '-' + data.businessTypeName + '；'
				}
			})
			this.metaAction.sfs({
				'data.form.summary': str,
			})
		}

		if (storeField == "data.other.businessTypes") {
			let details = this.metaAction.gf('data.form.details').toJS()
			if (details.length - 1 == rowIndex) {
				let details = this.metaAction.gf('data.form.details').toJS()
				details.push(blankDetail)
				this.metaAction.sf('data.form.details', fromJS(details))
			}
		}
		if (storeField == 'data.other.departmentList' && !id) {
			this.metaAction.sf(`data.form.details.${rowIndex}.departmentId`, '')
			this.metaAction.sf(`data.form.details.${rowIndex}.departmentName`, '')
		}
		if (storeField == 'data.other.projectList' && !id) {
			this.metaAction.sf(`data.form.details.${rowIndex}.projectId`, '')
			this.metaAction.sf(`data.form.details.${rowIndex}.projectName`, '')
		}
		if (storeField == 'data.other.deptPersonList') {
			value = value.toJS()
			if (rowData.calcObject == "customer") {
				this.metaAction.sf(`data.form.details.${rowIndex}.customerId`, value.id)
			} else if (rowData.calcObject == "person") {
				this.metaAction.sf(`data.form.details.${rowIndex}.personId`, value.id)
			} else if (rowData.calcObject == "supplier") {
				this.metaAction.sf(`data.form.details.${rowIndex}.supplierId`, value.id)
			} else if (rowData.calcObject == "assetClass") {
				this.metaAction.sf(`data.form.details.${rowIndex}.assetClassId`, value.id)
			}
			["customer", "person", "supplier", "assetClass"].forEach(function (data) {
				if (rowData.calcObject != data) {
					that.metaAction.sf(`data.form.details.${rowIndex}.${data}Id`, null)
				}
			})
			let data = this.metaAction.gf('data').toJS()
		}
		if (storeField == 'data.other.bankAccount') {
			if (value) {
				let settles = this.metaAction.gf('data.form.settles')
				settles = settles ? settles.toJS() : []
				const id = value.toJS().id, name = value.toJS().name,
					amount = this.metaAction.gf('data.form.paymentAmount')
				if (settles.length == 0) {
					const obj = {
						bankAccountId: id,
						amount: '',
						bankAccountName: name,
					}
					settles.push(obj)
				} else {
					settles[index].bankAccountId = id
					settles[index].bankAccountName = name
				}
				this.metaAction.sf('data.form.settles', fromJS(settles))
			}
		}
	}

	filterOptionArchives = (name, inputValue, option) => {
		const namePrmas = {
			currentPath: name
		}
		// inputValue = inputValue.replace(/\\/g, "\\\\")
		return this.filterOption(inputValue, option, namePrmas)
	}

	//支持搜索
	filterOption = (inputValue, option, name) => {
		try {
			inputValue = inputValue.replace(/\\/g, "\\\\")
			if (!option || !option.props || !option.props.children) {
				return false
			}
			//需要确定部门项目这些是否也需要支持助记码这些的搜索
			let parmasName = null, parmasNameCode = null
			if (name.currentPath) {
				parmasName = name.currentPath
			}
			if (parmasName.indexOf('supplier') != -1) {
				parmasName = 'supplier'
			} else if (parmasName.indexOf('inventoryCode') != -1) {
				parmasName = 'inventory'
				parmasNameCode = 'inventoryCode'
			} else if (parmasName.indexOf('inventory') != -1) {
				parmasName = 'inventory'
			} else if (parmasName.indexOf('departmentList') != -1) {
				parmasName = 'departmentList'
			} else if (parmasName.indexOf('project') != -1) {
				parmasName = 'projectList'
			} else if (parmasName.indexOf('purchasePerson') != -1) {
				parmasName = 'purchasePerson'
			}

			const paramsValues = this.metaAction.gf(`data.other.${parmasName}`),
				value = option.props.value
			// let paramsValue = paramsValues.find(item => item.get('id') == option.props.value)

			if (!paramsValues) {
				return true
			}
			let paramsValue = paramsValues.find(item => item.get('id') == value)

			if (!paramsValue) {
				return false
			}

			if (parmasNameCode && parmasNameCode.indexOf('inventoryCode') != -1) {
				let regExp = new RegExp(inputValue, 'i')
				return paramsValue.get('code').search(regExp) != -1
			}

			const codeDisplay = this.metaAction.gf('data.form.codeDisplay')
			let regExp = new RegExp(inputValue, 'i')
			if (parmasName.indexOf('departmentList') != -1 || (parmasName.indexOf('deptPersonList') != -1 && codeDisplay)) {
				return paramsValue.get('name').search(regExp) != -1
					|| (paramsValue.get('helpCode') && paramsValue.get('helpCode').search(regExp) != -1) // TODO 只支持助记码搜索，简拼
					|| (paramsValue.get('helpCodeFull') && paramsValue.get('helpCodeFull').search(regExp) != -1)
			}
			return paramsValue.get('name').search(regExp) != -1
				|| (paramsValue.get('code') && paramsValue.get('code').search(regExp) != -1)
				|| (paramsValue.get('helpCode') && paramsValue.get('helpCode').search(regExp) != -1) // TODO 只支持助记码搜索，简拼
				|| (paramsValue.get('helpCodeFull') && paramsValue.get('helpCodeFull').search(regExp) != -1)
		} catch (err) {
			return true
		}
	}
	//往来单位或个人
	deptPerson = async (value) => {
		let [customerList, supplierList, personList] = await Promise.all([
			this.webapi.payment.customer({ entity: { isEnable: true } }),
			this.webapi.payment.supplier({ entity: { isEnable: true } }),
			this.webapi.payment.person({ entity: { isEnable: true } })
		])
		let arr
		const data = this.metaAction.gf(`data`).toJS()
		// console.log(data)
		// console.log('果汁',data.form.details[value.rowIndex].calcObject)
		if (data.form.details[value.rowIndex].calcObject == "customer") {
			arr = [...customerList.list]
		} else if (data.form.details[value.rowIndex].calcObject == "person") {
			arr = [...personList.list]
		} else if (data.form.details[value.rowIndex].calcObject == "supplier") {
			arr = [...supplierList.list]
		} else if (data.form.details[value.rowIndex].calcObject == "assetClass") {
			arr = [...data.other.assetClassesList]
		} else {
			arr = []
		}
		this.metaAction.sfs({
			'data.other.customerList': customerList && fromJS(customerList.list),
			'data.other.supplierList': supplierList && fromJS(supplierList.list),
			'data.other.personList': personList && fromJS(personList.list),
			'data.other.deptPersonList': fromJS(arr)
		})
	}
	deptPersonReadonly = (value) => {
		const data = this.metaAction.gf(`data.form.details`).toJS()
		return !!data[value].calcObject
	}
	//存货编码
	filterOptionCode = (inputValue, option) => {
		if (!option || !option.props || !option.props.value) {
			return false
		}
		const paramsValues = this.metaAction.gf(`data.other.inventory`),
			value = option.props.value
		let paramsValue = paramsValues.find(item => item.get('id') == option.props.value)
		if (!paramsValue) {
			return false
		}
		let regExp = new RegExp(inputValue, 'i')
		return paramsValue.get('code').search(regExp) != -1
	}

	// //根据选择的供应商来得到对应的现结账户
	// supplierChange = async (value) => {
	// 	const supplierId = value && value.toJS().id
	// 	const response = await this.webapi.arrival.queryBySupplier({supplierId})
	// 	let settles = this.metaAction.gf('data.form.settles')
	// 	settles = settles && settles.toJS()
	// 	// 若在选择供应商之前添加了现结账户，将改动第一个
	// 	settles.splice(0, 1, {
	// 		bankAccountId: response.bankAccountId,
	// 		bankAccountName: response.bankAccountName,
	// 	})
	// 	if (response) {
	// 		this.metaAction.sf('data.form.settles', fromJS(settles))
	// 	}
	// }

	//计算
	calc = (col, rowIndex, rowData, params) => (v) => {
		this.injections.reduce('setSaveStatus', false)
		this.editCloseTips(true)
		params = Object.assign(params, {
			value: v
		})
		// //以下两个if 是为了区分 是否修改了价税合计
		// // 修改了价税合计之后在修改税率 算法是不一样的
		// if (col === 'taxInclusiveAmount') {
		// 	this.opertionTaxAmount = true
		// 	this.oldIndex = rowIndex
		// }
		// if (col === 'taxRateName' && rowIndex == this.oldIndex && this.opertionTaxAmount) {
		// 	params = Object.assign(params, {
		// 		hasChangeTaxAmount: true
		// 	})
		// }
		this.voucherAction.calc(col, rowIndex, rowData, params)
	}

	//计算剩余金额
	calcBalance = (data) => {
		const taxInclusiveAmount = this.voucherAction.sum(data.form.details, (a, b) => a + b.taxInclusiveAmount)
		let paymentAmount = this.metaAction.gf('data.form.paymentAmount')
		paymentAmount = utils.number.round(paymentAmount, 2) || 0
		let payAmount = 0,
			settles = this.metaAction.gf('data.form.settles')
		settles = settles ? settles.toJS() : []
		settles.forEach((item, index) => {
			payAmount = payAmount + item.amount
		})
		const chargeAmount = this.voucherAction.numberFormat(taxInclusiveAmount - payAmount, 2)
		this.metaAction.sf('data.other.chargeAmount', chargeAmount)
		return chargeAmount
	}

	quantityFormat = (quantity, decimals, isFocus) => {
		if (quantity || quantity === 0) {
			return this.voucherAction.numberFormat(quantity, decimals, isFocus)
		}
	}

	quantityChange = (path, value) => {
		this.injections.reduce('setSaveStatus', false)
		this.editCloseTips(true)
		this.metaAction.sf(path, value)
	}

	// 针对备注等有input输入框的先不调用这个方法，
	inputChange = (path, value) => {
		this.injections.reduce('setSaveStatus', false)
		this.editCloseTips(true)
		this.metaAction.sf(path, value)
	}

	isRowOperation = () => {
		return this.metaAction.gf('data.form.certificateStatus') == data.STATUS_VOUCHER_NOT_AUDITED
	}

	// 控制备注显隐
	getControlVisible = (num, params) => {
		let visible = false,
			invoiceTypeId = this.metaAction.gf('data.form.invoiceTypeId'),
			vatTaxpayer = this.metaAction.gf('data.other.vatTaxpayer')
		if (invoiceTypeId && vatTaxpayer != '2000010002') {
			switch (num) {
				case 0:
					const generalVATInvoice = consts.consts.INVOICETYPE_generalVATInvoice
					const otherInvoice = consts.consts.INVOICETYPE_otherInvoice
					const uninvoiced = consts.consts.INVOICETYPE_uninvoiced
					// visible = (invoiceTypeId != generalVATInvoice || invoiceTypeId != otherInvoice || invoiceTypeId != uninvoiced)
					visible = !(invoiceTypeId == generalVATInvoice || invoiceTypeId == otherInvoice || invoiceTypeId == uninvoiced)
					break;
				case 1:
					const specialVATInvoice = consts.consts.INVOICETYPE_specialVATInvoice
					const hgjkzzszyjks = consts.consts.INVOICETYPE_hgjkzzszyjks
					visible = invoiceTypeId == specialVATInvoice || invoiceTypeId == hgjkzzszyjks
					break;
				default:
					visible = false
			}
		}
		return visible
	}

	//控制单据条件和列显隐
	getColumnVisible = (params, header) => {
		let columnSetting = this.metaAction.gf('data.other.columnSetting'), visible = false
		columnSetting = columnSetting && columnSetting.toJS()
		if (header == 'header') {
			if (columnSetting && !!columnSetting.body && columnSetting.body.tables) {
				columnSetting.header.cards.forEach((item) => {
					visible = item.isVisible
				})
			}
		} else {
			if (columnSetting && !!columnSetting.body && columnSetting.body.tables) {
				columnSetting.body.tables.forEach((item) => {
					if (item.details.length != 0) {
						visible = item.details.filter(o => o.fieldName == params)[0].isVisible
					}
				})
			}
		}
		return visible
	}

	// 勾选认证
	authenticationChange = () => {
		const authenticated = this.metaAction.gf('data.form.authenticated')
		const date = new Date()
		const authMonth = date.getMonth() + 1 + '月'
		const authMonthList = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
		const year = date.getFullYear()
		let month = date.getMonth() + 1
		month = month < 10 ? '0' + month : month
		const authenticatedMonth = `${year}-${month}`
		if (!authenticated) {
			this.metaAction.sf('data.other.authMonth', authMonth)
			this.metaAction.sf('data.form.authenticatedMonth', authenticatedMonth)
			this.metaAction.sf('data.other.authMonthList', fromJS(authMonthList))
		} else {
			this.metaAction.sf('data.other.authMonth', '')
			this.metaAction.sf('data.form.deductible', false)
		}
		this.metaAction.sf('data.form.authenticated', !authenticated)
	}

	//认证
	rendeRauthentication = () => {
		let authenticated = '认证',
			invoiceTypeId = this.metaAction.gf('data.form.invoiceTypeId')
		if (invoiceTypeId) {
			if (invoiceTypeId == consts.consts.INVOICETYPE_specialVATInvoice) {
				authenticated = '认证'
			} else if (invoiceTypeId == consts.consts.INVOICETYPE_hgjkzzszyjks) {
				authenticated = '比对'
			}
		}
		return authenticated
	}

	// 勾选抵扣
	handleDeduction = () => {
		const deductible = this.metaAction.gf('data.form.deductible')
		this.metaAction.sf('data.form.deductible', !deductible)
	}

	//点击增加 现结账户
	addPaymentAmount = () => {
		let settles = this.metaAction.gf('data.form.settles')
		settles = settles ? settles.toJS() : []
		const obj = {
			bankAccountId: '',
			amount: '',
			bankAccountName: '',
		}
		if (settles.length == 0) settles.push(obj)
		settles.push(obj)
		this.metaAction.sf('data.form.settles', fromJS(settles))
	}

	//现结金额失去焦点 才改变剩余金额
	handlePayBlur = (v, index) => {
		// console.log(v, index, '456789 handlePayBlur')
		let settles = this.metaAction.gf('data.form.settles')
		settles = settles ? settles.toJS() : []
		if (settles.length == 0) {
			const obj = {
				bankAccountId: '',
				amount: v,
				bankAccountName: '',
			}
			settles.push(obj)
		} else {
			settles[index].amount = v
		}

		this.metaAction.sf("data.form.paymentAmount", v)
		this.metaAction.sf("data.form.settles", fromJS(settles))
	}

	//附件的下载操作
	download = (ps) => {
		const form = this.metaAction.gf('data.form').toJS()
		if (form.id) {
			ps = ps.file ? ps.file : ps
		}
		this.voucherAction.download(ps)
	}

	getAccessToken = () => {
		let token = fetch.getAccessToken()
		return { token: token }
	}

	delFile = (index) => {
		let form = this.metaAction.gf('data.form').toJS()
		this.voucherAction.delFile(index, 'vouchers', this.updateEnclosure)
	}

	updateEnclosure = async (res) => {
		const result = await this.webapi.payment.updateEnclosure(res)
		return result
	}

	attachmentChange = (info) => {
		this.voucherAction.attachmentChange(info, 'vouchers', this.updateEnclosure)
	}
	beforeUpload = (info, infoList) => {
		this.voucherAction.beforeUpload(info, infoList)
	}

	//即征即退
	signChange = (id) => {
		const signAndRetreat = this.metaAction.gf('data.other.signAndRetreat').toJS()
		signAndRetreat.map((obj) => {
			if (obj.id == id) {
				obj.visible = true
			} else {
				obj.visible = false
			}
		})
		this.metaAction.sf('data.other.signAndRetreat', fromJS(signAndRetreat))
	}

	renderSign = () => {
		const signAndRetreat = this.metaAction.gf('data.other.signAndRetreat').toJS()
		return signAndRetreat.map((item) => {
			if (item.visible == undefined) {
				if (item.name == '一般项目') {
					item.visible = true
				} else {
					item.visible = false
				}
			}

			return <Checkbox checked={item.visible} onChange={() => this.signChange(item.id)}>{item.name}</Checkbox>
		})
	}

	getDisable = () => {
		let pageStatus = this.metaAction.gf('data.other.pageStatus')
		let disabled = pageStatus == common.commonConst.PAGE_STATUS.READ_ONLY
		return disabled
	}

	//下拉选 票据类型 供应商
	handleSelect = (params) => {
		params = params && params.toJS()
		if (params) {
			return params.map((item, index) => {
				return <Option value={item && item.id}>{item && item.name}</Option>
			})
		}
	}

	addRecordClick = async (add, params, index, rowData) => {
		if (params == 'inventory') {
			// await this.voucherAction[add]({ id: `data.form.details.${index}.${params}Id`, name: `data.form.details.${index}.${params}Name`})
			await this.voucherAction[add]('data.other.inventoryItem')
			let inventory = this.metaAction.gf('data.other.inventory').toJS();
			const inventoryItem = this.metaAction.gf('data.other.inventoryItem').toJS()
			inventory.push(inventoryItem)
			this.metaAction.sf('data.other.inventory', fromJS(inventory))
			let filed = {
				id: `data.form.details.${index}.inventoryId`,
				name: `data.form.details.${index}.inventoryName`,
				code: `data.form.details.${index}.inventoryCode`,
				unitId: `data.form.details.${index}.unitId`,
				unitName: `data.form.details.${index}.unitName`,
				taxRateName: `data.form.details.${index}.taxRateName`,
				specification: `data.form.details.${index}.specification`
			}
			this.onFieldChange(filed, 'data.other.inventory', index, rowData)(inventoryItem.id)
		} else {
			await this.voucherAction[add]({ id: `data.form.${params}Id`, name: `data.form.${params}Name` })
		}
	}

	//新增档案
	handleAddRecord = (paramsU, params, index, rowData) => {
		const add = `add${paramsU}`
		return <Button type='primary'
			style={{ width: '100%', borderRadius: '0' }}
			// onClick={() => this.voucherAction[add]({ id: `data.form.${params}Id`, name: `data.form.${params}Name`})}
			onClick={this.addRecordClick.bind(null, add, params, index, rowData)}
		>新增</Button>
	}

	//控制显示
	handleVisible = (params) => {
		let columnSetting = this.metaAction.gf('data.other.columnSetting')
		columnSetting = columnSetting && columnSetting.toJS()
		if (columnSetting) {
			return !!columnSetting.cards && columnSetting.cards.filter(o => o.fieldName == params)[0].isVisible
		}
	}

	//单据日期控制
	handleDisabledDate = (current) => {
		if (!current) return
		// Can not select days before today and today
		let beginDate = this.metaAction.gf('data.other.beginDate'), currentDate = current.format('YYYY-MM-DD')
		beginDate = beginDate.replace(/-/g, '')
		currentDate = currentDate.replace(/-/g, '')
		return currentDate && currentDate < beginDate
	}

	renderArchives = () => {
		let columnSetting = this.metaAction.gf('data.other.columnSetting'),
			departmentName = this.metaAction.gf('data.form.departmentName') ? this.metaAction.gf('data.form.departmentName') : '',
			purchasePersonName = this.metaAction.gf('data.form.purchasePersonName') ? this.metaAction.gf('data.form.purchasePersonName') : '',
			projectName = this.metaAction.gf('data.form.projectName') ? this.metaAction.gf('data.form.projectName') : '',
			department = this.metaAction.gf('data.other.department') && this.metaAction.gf('data.other.department'),
			purchasePerson = this.metaAction.gf('data.other.purchasePerson') && this.metaAction.gf('data.other.purchasePerson'),
			project = this.metaAction.gf('data.other.project') && this.metaAction.gf('data.other.project')
		columnSetting = columnSetting && columnSetting.toJS()
		const archivesArr = [
			{ label: '部门', name: 'department', upName: 'Department', value: departmentName, optionArr: department },
			{
				label: '业务员',
				name: 'purchasePerson',
				upName: 'Person',
				value: purchasePersonName,
				optionArr: purchasePerson
			},
			{ label: '项目', name: 'project', upName: 'Project', value: projectName, optionArr: project },
		]
		if (columnSetting) {
			let domArr = archivesArr.map((item) => {
				let isVisible = !!columnSetting.cards && columnSetting.cards.filter(o => o.fieldName == item.name)[0].isVisible
				if (isVisible) {
					return (
						<FormItem label={item.label}>
							<Select
								showSearch={true}
								// placeholder='按名称/拼音搜索'
								disabled={this.getDisable()}
								value={item.value}
								onFocus={() => this.voucherAction[`get${item.upName}`]({}, `data.other.${item.name}`)}
								dropdownFooter={this.handleAddRecord(`${item.upName}`, `${item.name}`)}
								onChange={this.onFieldChange({
									id: `data.form.${item.name}Id`,
									name: `data.form.${item.name}Name`
								}, `data.other.${item.name}`)}
							>
								{this.handleSelect(item.optionArr)}
							</Select>
						</FormItem>
					)
				} else {
					return null
				}
			})
			return domArr
		}
	}

	//渲染表头
	renderFormContent = () => {
		const businessDate = this.metaAction.gf('data.form.businessDate'),
			bankAccountName = this.metaAction.gf('data.form.bankAccountName'),
			bankAccountList = this.metaAction.gf('data.other.bankAccountList'),
			data = this.metaAction.gf('data').toJS(), _this = this
		// supplierName = this.metaAction.gf('data.form.supplierName'),
		// supplier = this.metaAction.gf('data.other.supplier'),
		// invoiceCode = this.metaAction.gf('data.form.invoiceCode'),
		// invoiceNumber = this.metaAction.gf('data.form.invoiceNumber'),
		// invoiceDate = this.metaAction.gf('data.form.invoiceDate'),
		// remark = this.metaAction.gf('data.form.remark')
		const { bankAccountId } = this.metaAction.gf('data.form').toJS()
		let fillIdBankAccountId = bankAccountList.toJS().find(item => item.id == bankAccountId)
		let arr = [
			<FormItem label='账户' required={true} className='account'>
				<Select
					//className={this.getVoucherVisible() ? "autoFocus_item" : ""}
					disabled={this.getDisable() || !(this.getVoucherVisible())}
					//defaultActiveFirstOption={false}
					value={bankAccountId}
					optionFilterProp="children"
					filterOption={this.filterOptionSummary}
					onFocus={() => {
						//if(this.getVoucherVisible()){
						this.voucherAction.getBankAccount({ entity: { isEnable: true } }, `data.other.bankAccountList`)
					}
						//}
					}
					dropdownClassName="ttk-scm-app-payment-card-account"
					getPopupContainer={() => document.querySelector('.ttk-scm-app-payment-card')}
					onChange={this.onFieldChange({
						id: `data.form.bankAccountId`,
						name: `data.form.bankAccountName`
					}, `data.other.bankAccountList`)}
					dropdownFooter={
						<Button type='primary'
							style={{ width: '100%', borderRadius: '0' }}
							onClick={this.addAccount}>新增
						</Button>
					}
				>
					{this.handleSelect(bankAccountList)}
				</Select>
			</FormItem>,
			<FormItem className="ttk-scm-app-payment-card-businessDate" label='单据日期' required={true}>
				<DatePicker
					className="autoFocus_item"
					value={this.metaAction.stringToMoment(businessDate)}
					onChange={(d) => {
						this.injections.reduce('setSaveStatus', false)
						this.editCloseTips(true)
						this.metaAction.sf('data.form.businessDate', this.metaAction.momentToString(d, 'YYYY-MM-DD'))
					}}
					disabled={this.getDisable() || !(this.getVoucherVisible())}
					disabledDate={this.handleDisabledDate}
					getCalendarContainer={() => document.getElementsByClassName('ttk-scm-app-payment-card-businessDate')[0]}
				>
				</DatePicker>
			</FormItem>]
		if (this.getColumnVisible("remark", "header")) {
			arr.push(
				<FormItem className="settlement" label='备注'>
					<Input
						className="autoFocus_item"
						timeout={true}
						value={data.form.remark}
						disabled={!(this.getVoucherVisible())}
						onChange={function (e) { _this.inputChange('data.form.remark', e.target.value) }} />
				</FormItem>
			)
		}
		return arr
	}
	cardFocus = () => {
		this.extendAction.gridAction.cellAutoFocus()
	}

	filterOptionSummary = (input, option) => {
		if (option && option.props && option.props.children) {
			return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
		}
		return true
	}

	addAccount = async () => {
		const ret = await this.metaAction.modal('show', {
			title: '账户',
			width: 400,
			height: 500,
			children: this.metaAction.loadApp('app-card-bankaccount', {
				store: this.component.props.store
			}),
		})
		if (ret && ret.isEnable) {
			console.log(ret)
			let bankAccountList = this.metaAction.gf('data.other.bankAccountList').toJS()
			if (ret != true) {
				bankAccountList.push(ret)
			}
			this.metaAction.sfs({
				'data.form.bankAccountId': fromJS(ret.id),
				'data.form.bankAccountName': fromJS(ret.name),
				'data.other.bankAccountList': fromJS(bankAccountList),
			})
		}
	}

	//核算项目
	addUnitProject = async (name, path, title, index) => {
		const ret = await this.metaAction.modal('show', {
			title: title,
			width: 400,
			children: this.metaAction.loadApp(name, {
				store: this.component.props.store
			}),
		})
		if (ret && ret.isEnable) {
			this.injections.reduce('setSaveStatus', false)
			this.editCloseTips(true)
			this.injections.reduce("addUnitProject", path, ret, index)
		}
	}

	//新增往来单位及个人
	addDeptPerson = async (rowIndex) => {
		let name = 'app-card-customer',
			title = '客户',
			width = 700,
			data = this.metaAction.gf('data').toJS()

		if (data.form.details[rowIndex].calcObject == "person") {
			name = 'app-card-person'
			title = '人员'
			width = 720
		} else if (data.form.details[rowIndex].calcObject == "supplier") {
			name = 'app-card-vendor'
			title = '供应商'
		}

		const ret = await this.metaAction.modal('show', {
			title: title,
			width: width,
			children: this.metaAction.loadApp(name, {
				store: this.component.props.store
			}),
		})

		if (ret && ret.isEnable) {
			this.injections.reduce('setSaveStatus', false)
			this.editCloseTips(true)
			this.injections.reduce("addDeptPerson", ret, rowIndex, data.form.details[rowIndex].calcObject)
		}
	}

	//单据是否可修改
	getVoucherVisible = () => {
		let data = this.metaAction.gf('data').toJS(),
			consts = data.consts, other = data.other, form = data.form,
			isDocCode = form.status != consts.VOUCHERSTATUS_Approved,
			sourceVoucherType = (other.sourceVoucherTypeId != consts.VOUCHERTYPE_Delivery && other.sourceVoucherTypeId != '1000030013')
		if (isDocCode && sourceVoucherType) return true
		return false
	}


	disabledScroll = () => {
		if (!this.cascaderVisible) return

		const dom = document.querySelector('.ttk-scm-app-payment-card-Cascader')
		if (!dom) {
			return setTimeout(() => {
				this.disabledScroll()
			}, 300)
		}
		dom.addEventListener('mousewheel', function (event) {
			event.stopPropagation()
		}, false)
	}

	onPopupVisibleChange = (bol) => {
		this.cascaderVisible = bol
		if (bol) {
			setTimeout(() => {
				this.disabledScroll()
			}, 200)
		}

	}
	renderPopover = () => {
		return (
			<Popover content={(
				<ShortKey
					shortCuts={[
						{
							code: 1,
							name: 'Ctrl + Alt + n',
							keyCode: [17, 18, 78],
							className: 'show_style1',
							detail: '新增'
						}, {
							code: 2,
							name: 'Ctrl + s',
							keyCode: [17, 83],
							className: 'show_style2',
							detail: '保存'
						}, {
							code: 3,
							name: 'Ctrl + /',
							keyCode: [17, 191],
							className: 'show_style3',
							detail: '保存并新增'
						}, {
							code: 4,
							name: 'Ctrl + y',
							keyCode: [17, 89],
							className: 'show_style4',
							detail: '生成凭证/删除凭证'
						},
						{
							code: 6,
							name: 'Ctrl + 【',
							keyCode: [17, 219],
							className: 'show_style6',
							detail: '上一张发票'
						}, {
							code: 7,
							name: 'Ctrl + 】',
							keyCode: [17, 221],
							className: 'show_style7',
							detail: '下一张发票'
						}, {
							code: 8,
							name: 'Enter',
							keyCode: [13],
							className: 'show_style7',
							detail: '下一个/下一行'
						}
					]}
				/>
			)}>
				<Icon type='jianpan' fontFamily='edficon' className='ttk-scm-app-payment-card-header-left-iconbutton'></Icon>
			</Popover>
		)
	}
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction, voucherAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o }

	metaAction.config({ metaHandlers: ret })

	return ret
}

