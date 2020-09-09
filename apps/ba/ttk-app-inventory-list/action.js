import React from 'react'
import { Map, fromJS } from 'immutable'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
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
		injections.reduce('init')
		this.load()
		// 再次进入 refresh
		let addEventListener = this.component.props.addEventListener
		if (addEventListener) {
			addEventListener('onTabFocus', :: this.load)
		}
	}

	load = async () => {
		let filter = {
			page: {
				currentPage: 1,
				pageSize: 50
			},
			entity: {
				fuzzyCondition: '',
				propertyId: ''
			}
		}
		this.metaAction.sf('data.other.loading', true)
		// const response = await this.webapi.queryList(filter)
		// const enumList = await this.webapi.findEnumList()
		// const queryAll = await this.webapi.queryAll()
		const result = await Promise.all([
            this.webapi.queryList(filter),
			this.webapi.findEnumList(),
			this.webapi.queryAll()
		])
		let response = result[0], enumList = result[1], queryAll = result[2]
		this.injections.reduce('load', response, enumList, queryAll)
		this.metaAction.sf('data.other.loading', false)
	}

	handlePopoverVisibleChange = (visible) => {
		this.metaAction.sf('data.showPopoverCard', visible)

		let isSearched = this.metaAction.gf('data.isSearched')
		if (!visible && !isSearched) {
			this.metaAction.sf('data.form.propertyId', undefined)
		}
		if (visible) {
			let id = this.metaAction.gf('data.search.id')
			this.metaAction.sf('data.form.propertyId', id)
		}
	}

	searchList = (type) => {
		let inputVal = this.metaAction.gf('data.inputVal'),
			propertyId = this.metaAction.gf('data.form.propertyId'),
			page = this.metaAction.gf('data.pagination').toJS()
		const entity = {
			fuzzyCondition: inputVal || '',
			propertyId: propertyId || ''
		}

		if (type == 'filter') {
			this.metaAction.sf('data.search.id', propertyId)
		}
		page.currentPage = 1
		this.refresh(page, entity)
		if (propertyId) {
			this.metaAction.sf('data.isSearched', true)
		}
	}

	refresh = async (page) => {
		let inputVal = this.metaAction.gf('data.inputVal'),
			propertyId = this.metaAction.gf('data.form.propertyId')
		let filter = {
			page: {
				currentPage: 1,
				pageSize: 50
			},
			entity: {
				fuzzyCondition: inputVal || '',
				propertyId: propertyId || ''
			}
		}
		if (page && page.pageSize) {
			filter.page = {
				currentPage: page.currentPage,
				pageSize: page.pageSize
			}
		}
		this.metaAction.sf('data.other.loading', true)
		const response = await this.webapi.queryList(filter)
		this.metaAction.sf('data.other.loading', false)
		this.injections.reduce('load', response)
	}

	getListRowsCount = () => {
		return this.metaAction.gf('data.list').size
	}

	renderOper = (index, option) => {
		return <div>
			<a onClick={()=>this.setStatus(option, index)}>{option.isEnable ? "停用" : "启用"}</a>
			<a onClick={()=>this.del(option)}>删除</a>
		</div>
	}
	del = async (option) => {
		let page = this.metaAction.gf('data.pagination').toJS()
		const ret = await this.metaAction.modal('confirm', {
			title: '删除',
			content: '确认删除?'
		})
		let delArr = []
		delArr.push(option)
		if (ret) {
			this.metaAction.sf('data.other.loading', true)
			let response = await this.webapi.delete(delArr)
			this.metaAction.sf('data.other.loading', false)
			if (response.length && response.length > 0) {
				response.forEach((data) => {
					this.metaAction.toast('warn', data.message)
				})
			} else {
				this.metaAction.toast('success', '删除成功')
			}
			this.refresh(page)
		}
	}
	//批量删除
	delClickBatch = async () => {
		let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid')
		let page = this.metaAction.gf('data.pagination').toJS()
		if (selectedArrInfo && !selectedArrInfo.length) {
			this.metaAction.toast('warn', '请选择存货')
			return false
		}
		const ret = await this.metaAction.modal('confirm', {
			title: '删除',
			content: '确认删除?'
		})
		if (ret) {
			this.metaAction.sf('data.other.loading', true)
			let response = await this.webapi.delete(selectedArrInfo)
			this.metaAction.sf('data.other.loading', false)

			let resConirm
			if (response) {
				if(response.length){
					resConirm = await this.metaAction.modal('warning', {
						content: <div>
							<p>成功删除{selectedArrInfo.length - response.length}条，{response.length}条删除失败</p>
							<p>失败原因：{response[0].message}</p>
						</div>,
						okText: '确定'
					})
				}else{
					resConirm = await this.metaAction.modal('warning', {
						content: <div>
							<p>成功删除{selectedArrInfo.length}条，0条删除失败</p>
						</div>,
						okText: '确定'
					})
				}
			} 
			this.refresh(page)
		}
	}

	//新增档案
	addClick = () => {
		this.add()
	}

	onRowDoubleClick = (record, index) => {
		let list = this.metaAction.gf('data.list').toJS()
		this.toCard(list[index])
	}

	toCard = (item) => {
		this.addModel('edit', item)
	}

	addModel = async (type, item) => {
		const ret = await this.metaAction.modal('show', {
			title: type == 'edit' ? '编辑存货档案' : '新增存货档案',
			wrapClassName: 'card-archive',
			width: 700,
			height: 520,
			footer: '',
			closeModal: this.close,
			closeBack: (back) => { this.closeTip = back },
			children: this.metaAction.loadApp('ttk-app-inventory-card', {
				store: this.component.props.store,
				initData: type == 'edit' ? item : null,  // 编辑/新增
				// moduleYW: {
				// 	invenName: '名称',
				// 	invenSpecification: '型号'
				// }
			})
		})
	}

	close = (ret) => {
		this.closeTip()
		this.refresh()
	}

	selectRow = (rowIndex) => (e) => {
		this.injections.reduce('selectRow', rowIndex, e.target.checked)
	}

	//分页修改
	pageChanged = async (currentPage, pageSize) => {
		let page
		if (pageSize == null || pageSize == undefined) {
			page = this.metaAction.gf('data.pagination').toJS()
			pageSize = page.pageSize
		}
		this.refresh({ currentPage, pageSize })
	}

	setStatus = async (option, index) => {
		if (option.isEnable) {
			option.isEnable = false
			this.metaAction.sf('data.other.loading', true)
			let response = await this.webapi.update(option)
			this.metaAction.sf('data.other.loading', false)
			if (response) {
				this.metaAction.toast('success', '停用存货成功')
				this.injections.reduce('enable', response, index)
			}
		} else {
			option.isEnable = true
			this.metaAction.sf('data.other.loading', true)
			let response = await this.webapi.update(option)
			this.metaAction.sf('data.other.loading', false)
			if (response) {
				this.metaAction.toast('success', '启用存货成功')
				this.injections.reduce('enable', response, index)
			}
		}
	}

	moreClick = (e) => {
		this[e.key] && this[e.key]()
	}

	import = async () => {
		const ret = await this.metaAction.modal('show', {
			title: '导入',
			wrapClassName: 'card-archive',
			width: 520,
			children: this.metaAction.loadApp('ttk-app-inventory-import', {
				store: this.component.props.store
			})
		})
		if (ret) {
			this.refresh()
		}
	}

	export = async () => {
		let list = this.metaAction.gf('data.list').toJS()
		if(!list.length) {
			this.metaAction.toast('error', '当前没有可导出数据！')
			return false
		}
		let inputVal = this.metaAction.gf('data.inputVal'),
			propertyId = this.metaAction.gf('data.form.propertyId')
		const entity = {
			fuzzyCondition: inputVal || '',
			propertyId: propertyId || ''
		}
		const res = await this.webapi.export(entity)
	}

	copy = async () => {
		let unitList = this.metaAction.gf('data.unitList').toJS()
		const ret = await this.metaAction.modal('show', {
			title: '科目复制档案',
			wrapClassName: 'ttk-app-inventory-copy-archive',
			width: 1000,
			footer: '',
			closeModal: this.close1,
			closeBack: (back) => { this.closeTip = back },
			children: this.metaAction.loadApp('ttk-app-inventory-copy-subject', {
				store: this.component.props.store,
				unitList
			})
		})
		// if (ret) {
		// 	this.metaAction.toast('success', '保存成功')
		// 	this.refresh()
		// }
	}
	close1 = (ret) => {
		this.closeTip()
		// console.log(ret, 'ret///////close11')
		if(ret) this.metaAction.toast('success', '保存成功')
		this.refresh()
	}
	

	setType = async () => {
		let propertyList = this.metaAction.gf('data.goodsTypes').toJS()
		if (propertyList[0].name == '全部') propertyList.shift()
		const ret = await this.metaAction.modal('show', {
			title: '设置存货类型',
			wrapClassName: 'card-archive',
			width: 720,
			okText: '保存',
			children: this.metaAction.loadApp('ttk-app-inventory-type-setting', {
				store: this.component.props.store,
				propertyList
			})
		})
		if(ret) {
			const queryAll = await this.webapi.queryAll()
			if(queryAll) this.injections.reduce('load', null, null, queryAll)
		}
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
