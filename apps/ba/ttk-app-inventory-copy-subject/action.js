import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import config from './config'
import {FormDecorator} from 'edf-component'
import extend from './extend'
import { fetch } from 'edf-utils'
import {Spin, Icon, Input } from 'edf-component'
import { fromJS } from 'immutable'
import UpdateUnit from './util/updateUnit'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.config = config.current
		this.voucherAction = option.voucherAction
		this.webapi = this.config.webapi
		this.extendAction = option.extendAction 
	}

	onInit = ({component, injections}) => {
		this.extendAction.gridAction.onInit({ component, injections }) 
		this.component = component
		this.injections = injections
		this.clickStatus = false
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}
		injections.reduce('init')
		this.load()
	}

	load = async () => {
		const option = {
			accountCodeList: ['1403', '1405', '1408', '1411']
		}
		this.metaAction.sf('data.other.loading', true)
		const queryAccount = await this.webapi.queryAccount(option)
		let {unitList} = this.component.props
		this.injections.reduce('load', unitList, queryAccount)
		this.metaAction.sf('data.other.loading', false)
	}

	selectRow = (rowIndex) => (e) => {
		this.injections.reduce('selectRow', rowIndex, e.target.checked)
	}

	changeUnit = (v, index) => {
		// let list = this.metaAction.gf('data.list').toJS()
		// list[index].unitId = v
		// console.log(v, 'afadf/////////////')
		this.metaAction.sf(`data.list.${index}.unitId`, v)
		// this.metaAction.sf('data.list', fromJS(list))
	}

	changeList = (index, name, e) => {
		// console.log(e, 'valie///////////')
		this.metaAction.sf(`data.list.${index}.${name}`, e.target.value)
	}

	updateUnit = async() => {
		let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid') 
		if(!selectedArrInfo.length){
			this.metaAction.toast('error', '请选择对应的存货档案记录！')
			return false
		}
		let unitList = this.metaAction.gf('data.other.unitList').toJS()
		const res = await this.metaAction.modal('show', {
			title: '批设计量单位组',
			width: '400px',   
			wrapClassName: 'ttk-app-inventory-copy-subject-update',
			children: <UpdateUnit 
						unitList={unitList}/>
		}) 
		if(res && res != 'noUnit') {
			this.injections.reduce('selectAll', false, 'dataGrid')
			let list = this.metaAction.gf('data.list').toJS()
			list.map((item, index) => {
				const op = selectedArrInfo.filter(o=>o.id == item.id)[0]
				if(op) list[index].unitId = res
			})
			this.metaAction.sf('data.list', fromJS(list))
		}
	}

	// pageChanged = async (currentPage, pageSize) => {
	// 	if (pageSize == null || pageSize == undefined) {
	// 		pageSize = this.metaAction.gf('data.pagination')
	// 			.toJS().pageSize 
	// 	}
	// 	let page = { currentPage, pageSize } 
	// 	// this.refresh(page) 
	// } 

	onCancel = () => {
		this.component.props.closeModal(false)
	}

	next = async () => {
		let tab = this.metaAction.gf('data.other.tab1'),
		form = this.metaAction.gf('data.form').toJS(),    
		glAccounts = this.metaAction.gf('data.glAccounts').toJS()

		let {accountId, inventoryName, specification, tongbu} = form
		if(tab){
			if(!accountId) {
				this.metaAction.toast('error','请选择科目')
				return false
			}

			const accountCode = glAccounts.filter(o=> o.id == accountId)[0].code
			const option = {
				accountCode,
				includeInventoryBalance: tongbu
			}
			const res = await this.webapi.queryInvAccountList(option)
			if(res){
				// 默认末级科目
				let isKong = false, newList = []
				res.forEach((item, index)=>{
					if(specification != 1 && inventoryName == 1) item.specification = ''
					if(!item.isGenerated) newList.push(item)
				})
				if(inventoryName == 2 || inventoryName == 3){
					newList.forEach((item, index)=>{
						// newList[index].name = (inventoryName == 2) ? item.upper1LevelName : item.upper2LevelName
						if(inventoryName == 2){
							if(item.upper1LevelName == ''){
								isKong = true
							}else{
								newList[index].name = item.upper1LevelName
							}
						}
						if(inventoryName == 3){
							if(item.upper2LevelName == ''){
								isKong = true
							}else{
								newList[index].name = item.upper2LevelName
							}
						}
					})
				}
				if(isKong){
					this.metaAction.toast('error', '当前存货科目为末级科目，无上一级/上二级科目')
					return false
				}
				if(newList && !newList.length){ 
					this.metaAction.toast('error', '暂无可用存货科目，请重新选择！')
					return false
				}
				this.metaAction.sfs({
					'data.list': fromJS(newList),
					'data.other.tab1': false
				})
			}else{
				return false
			}
		}else{
			this.metaAction.sf('data.other.tab1', true)
		}
	}

	onOk = async () => {
		let list = this.metaAction.gf('data.list').toJS()
		let isTong = this.metaAction.gf('data.form.tongbu'), inventoryList = [], noUnit = false
		
		list.forEach(o=>{
			if(!o.unitId) noUnit = true
			inventoryList.push({
				code: o.code,   //--编码
				name: o.name,  //..--名称
				propertyId: o.propertyId,  //--存货类型
				unitId: o.unitId,  //--计量单位
				isEnable: true,  //--是否启用
				inventoryRelatedAccountId: o.inventoryRelatedAccountId,  //存货科目
				specification: o.specification,
				// periodEndQuantity: 1.0, //--科目余额数量
				// periodEndAmount: 1.0, //--科目余额
				// periodEndPrice: 1.0 ,  //-科目余额单价
			})
		})
		if(noUnit) {
			this.metaAction.toast('error', '计量单位组未选择，不能保存')
			return false
		}
		const option =  {
			syncAccountBalance: isTong,   //--是否同步科目余额到存货期初
			inventoryList
		}
		const res = await this.webapi.generateInventory(option)
		if(res){
			this.component.props.closeModal(res)
		}
	}

	getListRowsCount = () => {
		return this.metaAction.gf('data.list').size
	}

}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...o } 
	metaAction.config({ metaHandlers: ret }) 

	return ret
}
