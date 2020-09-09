import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import debounce from 'lodash.debounce'
import extend from './extend'
import config from './config'
import utils from 'edf-utils'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.extendAction = option.extendAction
		this.config = config.current
		this.webapi = this.config.webapi
		this.search = debounce(this.search, 800);
	}

	onInit = ({component, injections}) => {
		this.extendAction.gridAction.onInit({component, injections})
		this.component = component
		this.injections = injections

		let option = {
            isGuide: this.component.props.isGuide,
            menuKey: this.component.props.isMenuCode
        }
        this.menuList = option
		injections.reduce('init', option)

		this.load()
		// 再次进入 refresh
		let addEventListener = this.component.props.addEventListener
		if (addEventListener) {
			addEventListener('onTabFocus', :: this.load)
		}
	}

	load = async (page) => {
		if (!page) {
			const form = this.metaAction.gf('data.pagination').toJS()
			page = {currentPage: form.current, pageSize: form.pageSize}
            let request = {
                moduleKey: 'app-list-account',
                resourceKey: 'app-list-account-grid',
            }
            let response = await this.webapi.getSetting(request)
            if(response.pageSize){
                page.pageSize = response.pageSize
            }
		}
		const params = this.metaAction.gf('data.entity.fuzzyCondition')
		this.metaAction.sf('data.other.loading', true)
		this.getData(page,params).then((res) => {
			this.injections.reduce('load', res)
			this.metaAction.sf('data.other.loading', false)
		})
	}

	search = () => this.load()

	heightCount = () => {
		let name = '', modelStatus = this.component.props.modelStatus
		if (modelStatus && (modelStatus == 1 || modelStatus == 2)) {
			name = "app-list-account-contentHeight"
		}
		return name
	}

	getListRowsCount = () => {
		return this.metaAction.gf('data.list').size
	}

	//删除档案
	delClick = (item) => {
		this.del([item])
	}

	//批量删除
	delClickBatch = () => {
		let selectedArrInfo = this.extendAction.gridAction.getSelectedInfo('dataGrid')
		if (!selectedArrInfo.length) {
			this.metaAction.toast('warning', '请选择账户')
			return
		}
		this.del(selectedArrInfo)
	}

	del = async (list) => {
		const ret = await this.metaAction.modal('confirm', {
			title: '删除',
			content: '确认删除?'
		})
		if (ret) {
			let response = await this.webapi.account.delete(list)
			if (response.length && response.length > 0) {
				response.forEach((data) => {
					this.metaAction.toast('warn', data.message)
				})
			} else {
				this.metaAction.toast('success', '删除成功')
			}
			this.load()
		}
	}

	//修改档案
	modifyDetail = (id) => (e) => {
		let personId = id ? id : null
		this.add(personId)
	}

	//新增档案
	addClick = () => {
		//埋点
		_hmt && _hmt.push(['_trackEvent', '基础档案', '账户', '新增'])
		this.add()
	}

	add = (id) => {
		let option = {title: '', appName: '', id: id}
		option.title = '账户'
		option.appName = 'app-card-bankaccount'
		this.addModel(option)
	}

	addModel = async (option) => {
		const ret = await this.metaAction.modal('show', {
			title: option.title,
			className: 'app-list-account-modal',
			wrapClassName: 'card-archive',
			width: 395,
			height: 500,
			children: this.metaAction.loadApp(option.appName, {
				store: this.component.props.store,
				personId: option.id
			}),
		})
		// if (ret) {
			this.load()
		// }
	}

	selectRow = (rowIndex) => (e) => {
		this.injections.reduce('selectRow', rowIndex, e.target.checked)
	}

	//分页修改
	pageChanged = async (currentPage, pageSize) => {
		if (pageSize == null || pageSize == undefined) {
			pageSize = this.metaAction.gf('data.pagination').toJS().pageSize
		}
		let page = {currentPage, pageSize}
		this.load(page)
        let request = {
            moduleKey: 'app-list-account',
            resourceKey: 'app-list-account-grid',
            settingKey:"pageSize",
            settingValue:pageSize
        }
        this.webapi.setSetting([request])
	}

	//获取列表内容
	getData = async (pageInfo,params) => {
		let response,
			pagination = this.metaAction.gf('data.pagination'),
			page = {
				pageSize: pagination.toJS().pageSize,
				currentPage: pagination.toJS().currentPage,
			},
			entity = {
				fuzzyCondition:''
			}
		if (pageInfo && pageInfo['currentPage']) {
			page.currentPage = pageInfo.currentPage
			page.pageSize = pageInfo.pageSize
		}
		if(params) entity.fuzzyCondition = params;
		response = await this.webapi.account.query({page,entity})
		return response
	}

	//人员的停用状态
	personStatusClick = (name, index) => {
		let status = this.metaAction.gf('data.status')
		this.setStatus(name, index)
	}

	setStatus = async (option, index) => {
		if (option.isEnable) {
			option.isEnable = false
			let response = await this.webapi.account.update(option)
			if (response) {
				this.metaAction.toast('success', '停用账号成功')
				this.injections.reduce('enable', response, index)
			}
		} else {
			option.isEnable = true
			let response = await this.webapi.account.update(option)
			if (response) {
				this.metaAction.toast('success', '启用账号成功')
				this.injections.reduce('enable', response, index)
			}
		}
	}

	//数字加精度和千分位
	numberFormat = (value,num) => {
		return utils.number.format(value,num)
	}

	//停用行置灰
	isEnable = (isEnable) => !!isEnable ? '' : 'no-enable'

	clickCompent = (obj) => !!obj.isEnable ?  <a title={obj.name} onClick={this.modifyDetail(obj.id)}>{obj.name}</a> : <label className={'no-enable'}>{obj.name}</label>

	onExit = (tour) => {
        const intro = tour
        if (intro.action == 'skip' || intro.status == 'finished') {
            let stepEnabled = this.metaAction.gf('data.other.stepEnabled')
            if (stepEnabled == true) {
                this.metaAction.sf('data.other.stepEnabled', false)
                let params = { "menuId": this.menuList.menuKey, "isVisible": false }
				this.webapi.updateGuide(params)

				this.component.props.closeGuide &&
				this.component.props.closeGuide(this.component.props.appName)
            }
        }
    }
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({...option, metaAction}),
		o = new action({...option, metaAction, extendAction}),
		ret = {...metaAction, ...extendAction.gridAction, ...o}

	metaAction.config({metaHandlers: ret})

	return ret
}
