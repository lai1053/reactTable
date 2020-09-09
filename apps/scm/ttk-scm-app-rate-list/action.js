import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Menu, Checkbox, DataGrid, Icon } from 'edf-component'
import { List, fromJS } from 'immutable'

import moment from 'moment'
import utils from 'edf-utils'
import extend from './extend'
import config from './config'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.extendAction = option.extendAction
		this.config = config.current
		this.webapi = this.config.webapi
	}

	onInit = ({ component, injections }) => {
		this.extendAction.gridAction.onInit({ component, injections })
		this.component = component
		this.injections = injections

		//this.component.props.tabchange('tab1',this.onTabFocus);
		let addEventListener = this.component.props.addEventListener
		if (addEventListener) {
			addEventListener('onTabFocus', :: this.onTabFocus)
		}
		injections.reduce('init')
		this.load()
	}

	load = async (params) => {
		const currentOrg = this.metaAction.context.get("currentOrg")
		let periodDate = currentOrg.periodDate
		let date = utils.date.monthStartEndDay(periodDate)
		let parameter = {}

		parameter.init = true
		parameter.beginDate = date.startDay + ' 00:00:00'
		parameter.endDate = date.endDay + ' 23:59:59'

		const response = await this.webapi.tplus.init(parameter)
		const time = await this.webapi.tplus.time()

		for (var i = 0; i < response.list.length; i++) {
			response.list[i].quantity = response.list[i].quantity.toFixed(6)
			response.list[i].salePrice = response.list[i].salePrice.toFixed(6)
			response.list[i].stockPrice = response.list[i].stockPrice.toFixed(6)
			response.list[i].grossProfitRateAmount = response.list[i].grossProfitRateAmount.toFixed(2)
			response.list[i].saleAmount = response.list[i].saleAmount.toFixed(2)
			response.list[i].stockAmount = response.list[i].stockAmount.toFixed(2)
		}
		
		response.periodDate = periodDate
		response.time = time
		this.injections.reduce('load', response)
	}

	disabledMonth = (current) => {
		let time = this.metaAction.gf('data.time')
		return current && current < moment(time)
	}

	periodChange = async (path, value) => {
		let parameter = {}
		let date = utils.date.monthStartEndDay(value)
		let propertyId = this.metaAction.gf('data.form.propertyId')
		let paramName = this.metaAction.gf('data.form.paramName')
		let time = this.metaAction.gf('data.time')

		parameter.init = true
		parameter.beginDate = date.startDay + ' 00:00:00'
		parameter.endDate = date.endDay + ' 23:59:59'
	 	propertyId ? parameter.propertyId = propertyId : ''
		paramName ? parameter.paramName = paramName : ''
	
		const response = await this.webapi.tplus.init(parameter)

		for (var i = 0; i < response.list.length; i++) {
			response.list[i].quantity = response.list[i].quantity.toFixed(6)
			response.list[i].salePrice = response.list[i].salePrice.toFixed(6)
			response.list[i].stockPrice = response.list[i].stockPrice.toFixed(6)
			response.list[i].grossProfitRateAmount = response.list[i].grossProfitRateAmount.toFixed(2)
			response.list[i].saleAmount = response.list[i].saleAmount.toFixed(2)
			response.list[i].stockAmount = response.list[i].stockAmount.toFixed(2)
		}

		response.periodDate = value
		response.time = time
		this.injections.reduce('load', response)
	}
	
	getBeginList = async (value) => {
		let propertys = this.metaAction.gf('data.other.propertys')
		let periodDate = this.metaAction.gf('data.periodDate')
		let date = utils.date.monthStartEndDay(periodDate)
		let paramName = this.metaAction.gf('data.form.paramName')
		let time = this.metaAction.gf('data.time')
		// let paramsValue = propertys.find(item => item.get('propertyId') == value).toJS()

		this.metaAction.sf('data.form.propertyId', value);
		// this.metaAction.sf('data.form.propertyName', paramsValue.propertyName);

		let parameter = {}
		parameter.propertyId = value
		// parameter.propertyName = paramsValue.propertyName
		parameter.beginDate = date.startDay + ' 00:00:00'
		parameter.endDate = date.endDay + ' 23:59:59'
	 	paramName ? parameter.paramName = paramName : ''
		parameter.init = true

		const response = await this.webapi.tplus.init(parameter)

		for (var i = 0; i < response.list.length; i++) {
			response.list[i].quantity = response.list[i].quantity.toFixed(6)
			response.list[i].salePrice = response.list[i].salePrice.toFixed(6)
			response.list[i].stockPrice = response.list[i].stockPrice.toFixed(6)
			response.list[i].grossProfitRateAmount = response.list[i].grossProfitRateAmount.toFixed(2)
			response.list[i].saleAmount = response.list[i].saleAmount.toFixed(2)
			response.list[i].stockAmount = response.list[i].stockAmount.toFixed(2)
		}

		response.periodDate = periodDate
		response.time = time
		this.injections.reduce('load', response)
	}

	refresh = async () => {
		let periodDate = this.metaAction.gf('data.periodDate')
		let paramName = this.metaAction.gf('data.form.paramName')
		let date = utils.date.monthStartEndDay(periodDate)
		let propertyId = this.metaAction.gf('data.form.propertyId')
		
		let time = await this.webapi.tplus.time()

		let parameter = {}
		propertyId ? parameter.propertyId = propertyId : ''
		paramName ? parameter.paramName = paramName : ''
		parameter.beginDate = date.startDay + ' 00:00:00'
		parameter.endDate = date.endDay + ' 23:59:59'
		parameter.init = true

		const response = await this.webapi.tplus.init(parameter)

		for (var i = 0; i < response.list.length; i++) {
			response.list[i].quantity = response.list[i].quantity.toFixed(6)
			response.list[i].salePrice = response.list[i].salePrice.toFixed(6)
			response.list[i].stockPrice = response.list[i].stockPrice.toFixed(6)
			response.list[i].grossProfitRateAmount = response.list[i].grossProfitRateAmount.toFixed(2)
			response.list[i].saleAmount = response.list[i].saleAmount.toFixed(2)
			response.list[i].stockAmount = response.list[i].stockAmount.toFixed(2)
		}

		response.periodDate = periodDate
		response.time = time
		this.injections.reduce('load', response)
	}

	changeCondition = async (e) => {
		this.metaAction.sf('data.form.paramName', e.target.value);
		let periodDate = this.metaAction.gf('data.periodDate')
		let date = utils.date.monthStartEndDay(periodDate)
		let propertyId = this.metaAction.gf('data.form.propertyId')
		let time = this.metaAction.gf('data.time')

		let parameter = {}
		propertyId ? parameter.propertyId = propertyId : ''
		parameter.beginDate = date.startDay + ' 00:00:00'
		parameter.endDate = date.endDay + ' 23:59:59'
		parameter.paramName = e.target.value
		parameter.init = true

		const response = await this.webapi.tplus.init(parameter)

		for (var i = 0; i < response.list.length; i++) {
			response.list[i].quantity = response.list[i].quantity.toFixed(6)
			response.list[i].salePrice = response.list[i].salePrice.toFixed(6)
			response.list[i].stockPrice = response.list[i].stockPrice.toFixed(6)
			response.list[i].grossProfitRateAmount = response.list[i].grossProfitRateAmount.toFixed(2)
			response.list[i].saleAmount = response.list[i].saleAmount.toFixed(2)
			response.list[i].stockAmount = response.list[i].stockAmount.toFixed(2)
		}

		response.periodDate = periodDate
		response.time = time
		this.injections.reduce('load', response)
	}

	print = async() => {
		const list = this.metaAction.gf('data.list').toJS(),
			filter = {}
		
        if(!list.length){
			this.metaAction.toast('warning', '当前暂无数据可打印')
			return
		}
		
		let periodDate = this.metaAction.gf('data.periodDate')
		let date = utils.date.monthStartEndDay(periodDate)
		let propertyId = this.metaAction.gf('data.form.propertyId')
		let paramName = this.metaAction.gf('data.form.paramName')

		filter.beginDate = date.startDay + ' 00:00:00'
		filter.endDate = date.endDay + ' 23:59:59'
	 	propertyId ? filter.propertyId = propertyId : ''
		paramName ? filter.paramName = paramName : ''
        
        let res = await this.webapi.tplus.print(filter) 
	}
	
	exports = async() => {
		let list = this.metaAction.gf('data.list').toJS(),
			filter = {}
        if(!list.length){
            this.metaAction.toast('warning', '当前暂无数据可导出')
            return
		}   
		
		let periodDate = this.metaAction.gf('data.periodDate')
		let date = utils.date.monthStartEndDay(periodDate)
		let propertyId = this.metaAction.gf('data.form.propertyId')
		let paramName = this.metaAction.gf('data.form.paramName')

		filter.beginDate = date.startDay + ' 00:00:00'
		filter.endDate = date.endDay + ' 23:59:59'
	 	propertyId ? filter.propertyId = propertyId : ''
		paramName ? filter.paramName = paramName : ''

        let res = await this.webapi.tplus.exports(filter)        
  
        this.metaAction.toast('导出成功', res)
    }

	//当前app的 "tab被点击" (从其他app切换到当前app)
	onTabFocus = async (params) => {
		this.refresh()
	}

	getListRowsCount = () => {
		return this.metaAction.gf('data.list').size
	}

	

	onResize = () => {
		let keyRandom = Math.floor(Math.random() * 10000)
		this.metaAction.sf('data.form.key', keyRandom)
	}

	// //分页修改
	// pageChanged = async (currentPage, pageSize) => {
	// 	let page = this.metaAction.gf('data.page').toJS()
	// 	page.currentPage = currentPage
	// 	pageSize ? page.pageSize = pageSize : ''

	// 	let response = {}, entity = {}
	// 	entity.fuzzyCondition = ''
	// 	response.page = page
	// 	response.entity = entity
	// 	response.entity.isEnable = 1
	// 	const newList = await this.webapi.tplus.queryList(response);//查询配置信息

	// 	this.metaAction.sfs({
	// 		'data.list': fromJS(newList.list),
	// 		'data.page': fromJS(newList.page)
	// 	})
	// }
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction }),
		ret = { ...metaAction, ...extendAction.gridAction, ...o }

	metaAction.config({ metaHandlers: ret })

	return ret
}
