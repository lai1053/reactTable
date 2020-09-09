import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import { Menu, Checkbox, DataGrid, Icon, LoadingMask, Popover } from 'edf-component'
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
		this.stringToMoment = utils.moment.stringToMoment
		let addEventListener = this.component.props.addTabChangeListener
		if (addEventListener) {
			addEventListener('onTabFocus', :: this.onTabFocus)
		}
		injections.reduce('init')
		this.load()
	}

	componentWillReceiveProps=(nextProps) =>{
		this.metaAction.sf('data.activekey', nextProps.active)
	}

	load = async () => {
		let initData = this.component.props.initData, dateArr,
			filter = this.metaAction.gf('data.filter').toJS()
		if(initData && initData.date){
			dateArr = initData.date.split('-')
		}else{
			dateArr = filter.period.split('-')
		}
		let option = {
			"year": dateArr[0],
			"month": dateArr[1],
			"init": false,
			"page": {
				"currentPage": filter.page.currentPage,
				"pageSize": filter.page.pageSize
			}
		}
		
		let type = this.component.props.store.getState('data.type').toJS()['ttk-scm-financial-assistance'].data.typeentry
		let value = this.component.props.store.getState('data.type').toJS()['ttk-scm-financial-assistance'].data.valueentry
		if (type == 'entry' && value) {
			if(value.period){
				option.year = value.period.split('-')[0]
				option.month = value.period.split('-')[1]
			}
			if(value.fplxdm) option.fplxdm = value.fplxdm
			if(value.simpleCondition) {
				option.fphm = value.simpleCondition
				//option.xfnsrsbh = value.simpleCondition
			}
			if(value.page){
				option.page = {} 
				option.page.currentPage = value.page.currentPage
				option.page.pageSize = value.page.pageSize
			}
		}
		
		LoadingMask.show()
		const list = await this.webapi.entry.jxfpmxcx(option)
		LoadingMask.hide()		
		this.injections.reduce('load', list, initData, value)
	}

	//当前app的 "tab被点击" (从其他app切换到当前app)
	onTabFocus = async (props) => {
		this.refresh()
	}

	//月份查询
	depreciationChange = async (e) => {
		let filter = this.metaAction.gf('data.filter').toJS()
		let date = this.metaAction.momentToString(e, 'YYYY-MM')
		filter.period = date
		this.refresh(filter)
	}

	//搜索
	changeCondition = async (e) => {
		let filter = this.metaAction.gf('data.filter').toJS()
		filter.simpleCondition = e.target.value
		this.metaAction.sf('data.filter.simpleCondition', e.target.value)
		const keyRandom = Math.floor(Math.random()*10000000)
		this.keyRandom = keyRandom
		setTimeout(()=>{
			if( keyRandom == this.keyRandom ) {
				this.refresh(filter)
			}
		}, 1000)
	}

	//分页修改
	pageChanged = async (currentPage, pageSize) => {
		let filter = this.metaAction.gf('data.filter').toJS()
		if (pageSize == null || pageSize == undefined) {
			pageSize = this.metaAction.gf('data.filter.page').toJS().pageSize
		}
		filter.page = { currentPage, pageSize }
		this.refresh(filter)
	}

	getPopover = (value) => {
		return  <Popover content={value}> { value } </Popover>
	}

	refresh = async (filter, name) => {
		let initData = this.component.props.initData
		if(filter && filter.period) {
			this.metaAction.sf('data.activeKey', fromJS('1'))
			this.metaAction.sf('data.filter', fromJS(filter))
			this.component.props.setFilters('entry', filter)
		}else{
			filter = this.metaAction.gf('data.filter').toJS()
		}
		if(!filter.period){
			filter.period = initData.date
		}
		let dateArr = filter.period.split('-')
		let option = {
			"year": dateArr[0],
			"month": dateArr[1],
			"init": false,
			"page": {
				"currentPage": filter.page.currentPage,
				"pageSize": filter.page.pageSize
			}
		}
		if(filter.fplxdm) option.fplxdm = filter.fplxdm
		if(filter.simpleCondition){
			option.fphm = filter.simpleCondition
			//option.xfnsrsbh = filter.simpleCondition
		}
		
		LoadingMask.show()
		let response = await this.webapi.entry.jxfpmxcx(option)
		LoadingMask.hide()	
		if(name) {
			this.injections.reduce(name, filter, response)
		}else{
			this.injections.reduce('load', response, undefined, filter)
		}
	}

	//下载数据
	downloadText = async () => {
		let filter = this.metaAction.gf('data.filter').toJS()
		let dateArr = filter.period.split('-')
		let option = {
			"year": dateArr[0],
			"month": dateArr[1],
			"init": true,
			"page": {
				"currentPage": filter.page.currentPage,
				"pageSize": filter.page.pageSize
			}
		}
		if(filter.fplxdm) option.fplxdm = filter.fplxdm
		if(filter.simpleCondition){
			option.fphm = filter.simpleCondition
			//option.xfnsrsbh = filter.simpleCondition
		}
		LoadingMask.show()
		let response = await this.webapi.entry.jxfpmxcx(option)
		LoadingMask.hide()
		this.refresh()
	}

	//tab页签切换
	handletabchange = (key) => {
		let filter = this.metaAction.gf('data.filter').toJS()
		filter.activeKey = key
		filter.fplxdm = key
		this.component.props.setFilters('entry', filter)
		this.refresh(filter, 'handletabchange')
	}
	
	addThousandsPosition = (value) => {
		if(!value) return '0.00'
		let num
		if(value == 0){
			return parseFloat(0).toFixed(2)
		}
		if (value != '') {
			num = parseFloat(value).toFixed(2)
		}else{
			num = value.toString()
		}
		let regex = /(\d{1,3})(?=(\d{3})+(?:\.))/g
		return num.replace(regex, "$1,")
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
