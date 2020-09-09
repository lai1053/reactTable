import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {Menu, Checkbox, DataGrid, Icon} from 'edf-component'
import {Map, fromJS} from 'immutable'
import extend from './extend'
import config from './config'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.extendAction = option.extendAction
		this.config = config.current
		this.webapi = this.config.webapi
	}

	onInit = ({component, injections}) => {
		this.extendAction.gridAction.onInit({component, injections})
		this.component = component
		this.injections = injections
		injections.reduce('init')
		this.load()
	}
	load = async (keyId) => {
		let response = await this.webapi.basearchive.queryList(), contentData, obj
		if (typeof keyId == 'number') {
			obj = response['list'] && response['list'].length > 0 ? response['list'][response['list'].length - 1] : undefined
		} else {
			obj = response['list'] && response['list'].length > 0 ? response['list'][0] : undefined
		}
		if (obj) {
			this.metaAction.sf('data.other.loading', true)
			// this.getData(obj).then((res) => {
			//     this.injections.reduce('load', response, res)
			//     this.metaAction.sf('data.other.loading', false)
			// }).then(() => {
			//     if (this.component.props.activeKey) {
			//         let key = response['list'].filter((data) => {
			//             return data.name == this.component.props.activeKey
			//         })
			//         this.tabChange(key[0].id + '')
			//     }
			// })
            debugger
			let data = await this.getData(obj)
			await this.injections.reduce('load', response, data, keyId)
			this.metaAction.sf('data.other.loading', false)
			if (this.component.props.activeKey) {
				let key = response['list'].filter((data) => {
					return data.name == this.component.props.activeKey
				})
				this.tabChange(key[0].id + '')
			}
		} else {
			this.injections.reduce('load', response, contentData)
		}
		if (this.component.props.modelStatus) {
			this.metaAction.sf('data.modelStatus', this.component.props.modelStatus)
		}
	}

	// 刷新页面
	refresh = async (page) => {
		if (!page) {
			const form = this.metaAction.gf('data.pagination').toJS()
			page = {currentPage: form.current, pageSize: form.pageSize}
		}
		this.getData({}, page).then((res) => {
			this.injections.reduce('tabChange', res)
		})
	}

	heightCount = () => {
		let name = ''
		if (this.component.props.modelStatus && (this.component.props.modelStatus == 1 || this.component.props.modelStatus == 2)) {
			name = "app-list-userdefinecard-contentHeight"
		}
		return name
	}
	//新增档案
	addArchives = async () => {
		//埋点
		_hmt && _hmt.push(['_trackEvent', '基础档案', '自定义档案', '新增自定义档案+左上角（+）'])
		const ret = await this.metaAction.modal('show', {
			title: '自定义档案',
			className: 'app-list-userdefinecard-modalTitle',
			wrapClassName: 'card-archive',
			width: 395,
			height: 170,
			children: this.metaAction.loadApp('app-card-userdefinecard', {
				store: this.component.props.store,
				archivesName: true
			}),
		})
		if (ret) {
			this.load(ret.id)
		}
	}
	//删除档案
	delArchives = async () => {
		//埋点
		_hmt && _hmt.push(['_trackEvent', '基础档案', '自定义档案', '左上角（X）'])
		const ret = await this.metaAction.modal('confirm', {
			title: '删除',
			content: '确认删除?'
		})
		if (ret) {
			let id = this.metaAction.gf('data.tabKey')
			let ts = this.metaAction.gf('data.tabTs')
			let response = await this.webapi.basearchive.delete({id, ts})
			if (response) {
				this.load()
				this.metaAction.toast('success', '删除成功')
			}
		}
	}
	//删除档案明细
	delClick = (obj) => (e) => {
		let data = [{
			archiveId: this.metaAction.gf('data.tabKey'),
			...obj
		}]
		this.del(data)
	}
	//批量删除档案明细
	delClickBatch = () => {
		let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid')
		let selectedArr = []
		if (selectedArrInfo && selectedArrInfo.length > 0) {
			this.del(selectedArrInfo)
		} else {
			this.metaAction.toast('warn', '请选择档案明细')
		}
	}
	// 明细删除-根
	del = async (obj) => {
		const ret = await this.metaAction.modal('confirm', {
			title: '删除',
			content: '确认删除?'
		})
		if (ret) {
			let response = await this.webapi.basearchive.deleteData(obj)
			if (response.length && response.length > 0) {
				response.forEach((data) => {
					this.metaAction.toast('warn', data.message)
				})
			} else {
				this.metaAction.toast('success', '删除成功')
			}
			this.refresh()
		}
	}
	//修改档案
	modifyDetail = (id) => (e) => {
		let personId = id ? id : null
		this.add(personId)
	}
	add = (id) => {
		let option = {title: '', appName: '', id: id}
		option.title = '自定义档案'
		option.appName = 'app-card-userdefinecard'
		this.addModel(option)
	}
	//新增明细
	addClick = () => {
		//埋点
		_hmt && _hmt.push(['_trackEvent', '基础档案', '自定义档案', '右上角新增'])
		this.addModel()
	}
	addModel = async (option) => {
		let tabKey = this.metaAction.gf('data.tabKey'), name = '',
			tabArr = this.metaAction.gf('data.other.userDefineArchives') || [],
			parentId = option && option.id

		tabArr.toJS().map(item => {
			if (item.id == tabKey) name = item.name
		})

		const ret = await this.metaAction.modal('show', {
			title: name,
			className: 'app-list-userdefinecard-modalList',
			wrapClassName: 'card-archive',
			width: 350,
			heigth: 390,
			children: this.metaAction.loadApp('app-card-userdefinecard', {
				store: this.component.props.store,
				id: tabKey,
				parentId: parentId
			}),
		})

		if (ret) {
			this.refresh()
		}
	}
	getListRowsCount = () => {
		return this.metaAction.gf('data.list').size
	}

	//页签切换
	tabChange = async (v) => {
		if (v !== "add") {
			this.getData({id: v}).then((res) => {
				this.injections.reduce('tabChange', res, v)
			})
		}
	}
	//分页修改
	pageChanged = (currentPage, pageSize) => {
		if (pageSize == null || pageSize == undefined) {
			pageSize = this.metaAction.gf('data.pagination').toJS().pageSize
		}
		let page = {currentPage, pageSize}
		this.refresh(page)
        let request = {
            moduleKey: 'app-list-userdefinecard',
            resourceKey: 'app-list-userdefinecard-grid',
            settingKey:"pageSize",
            settingValue:pageSize
        }
        this.webapi.setSetting([request])
	}
	//获取列表内容
	getData = async (obj, pageInfo) => {
		let response,
			pagination = this.metaAction.gf('data.pagination'),
			page = {
				pageSize: pagination.toJS().pageSize
			}
		if (pageInfo && (pageInfo['currentPage'] || pageInfo['pageSize'])) {
			if (pageInfo.currentPage != 0) {
				page.currentPage = pageInfo.currentPage
			}
			page.pageSize = pageInfo.pageSize
		}
		if(!pageInfo){
            let request = {
                moduleKey: 'app-list-userdefinecard',
                resourceKey: 'app-list-userdefinecard-grid',
            }
            let response = await this.webapi.getSetting(request)
            if(response.pageSize){
                page.pageSize = response.pageSize
            }
        }
		let reqObj = {
			// orgId: this.metaAction.context.get("currentOrg").id || '',
			entity: {archiveId: obj.id || this.metaAction.gf('data.tabKey')},
			page
		}
		response = await this.webapi.basearchive.queryDataList(reqObj)
		return response
	}

	selectRow = (rowIndex) => (e) => {
		this.injections.reduce('selectRow', rowIndex, e.target.checked)
	}
	openSubject = async () => {
		this.component.props.setPortalContent &&
		this.component.props.setPortalContent('科目', 'app-account-subjects')
	}
	//人员的停用状态
	personStatusClick = (name, index) => (e) => {
		let status = this.metaAction.gf('data.status')
		this.setStatus(name, index)
	}

	setStatus = async (option, index) => {
		let optionData = {}
		if (option) {
			option.code ? optionData.code = option.code : ''
			option.id ? optionData.id = option.id : ''
			option.name ? optionData.name = option.name : ''
			option.archiveId ? optionData.archiveId = option.archiveId : ''
			option.ts ? optionData.ts = option.ts : ''
		}
		if (option.isEnable) {
			optionData.isEnable = false
			let response = await this.webapi.basearchive.update(optionData)
			if (response) {
				this.metaAction.toast('success', '停用自定义档案成功')
				this.injections.reduce('enable', response, index)
			}
		} else {
			optionData.isEnable = true
			let response = await this.webapi.basearchive.update(optionData)
			if (response) {
				this.metaAction.toast('success', '启用自定义档案成功')
				this.injections.reduce('enable', response, index)
			}
		}
	}

	//停用行置灰
	isEnable = (isEnable) => !!isEnable ? '' : 'no-enable'

	clickCompent = (obj) => !!obj.isEnable ?  <a title={obj.code} onClick={this.modifyDetail(obj.id)}>{obj.code}</a> : <label className={'no-enable'}>{obj.code}</label>
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({...option, metaAction}),
		o = new action({...option, metaAction, extendAction}),
		ret = {...metaAction, ...extendAction.gridAction, ...o}
	metaAction.config({metaHandlers: ret})
	return ret
}
