import React from 'react'
import { action as MetaAction } from 'edf-meta-engine'
import { Checkbox, DataGrid, Icon } from 'edf-component'
import { List, fromJS } from 'immutable'
import renderColumns from './utils/renderColumns'
import moment from 'moment'
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
	}

	load = async () => {
		this.injections.reduce('loading', true)
		this.metaAction.sf('data.other.isCanNotToNextStep', true)
		await this.webapi.asset.init()
		const response = await this.webapi.asset.queryList()
		const urrentOrg = this.metaAction.context.get("currentOrg")
		const _maxClosingPeriod = await this.webapi.asset.getMaxClosingPeriod()
		if (response) {
			this.injections.reduce('load', response, urrentOrg.periodDate || response.beginDeprPeriod, _maxClosingPeriod)
		}
		this.injections.reduce('loading', false)
		this.metaAction.sf('data.other.isCanNotToNextStep', false)
	}
	/**
    * 编码/名称 状态模糊查询
    */
	onSearch = (path, inputValue) => {
		this.metaAction.sf(path, inputValue)
		let sourceList = this.metaAction.gf('data.sourceList'),
			search = this.metaAction.gf('data.search').toJS(),
			sfsData = {}
		let filterItem
		if (path == 'data.search.name') {
			filterItem = sourceList.filter(o =>
				(!inputValue ? true : (`${o.get('code')}${o.get('name')}`.indexOf(inputValue) == 0 || `${o.get('code')}${o.get('name')}`.indexOf(inputValue) != -1)) &&
				(search.state == 99 ? true : o.get('isDraft') == search.state))
		} else if (path == 'data.search.state') {
			filterItem = sourceList.filter(o =>
				(inputValue == 99 ? true : o.get('isDraft') == inputValue) &&
				(`${o.get('code')}${o.get('name')}`.indexOf(search.name) == 0 || `${o.get('code')}${o.get('name')}`.indexOf(search.name) != -1))
		}
		if (!filterItem) {
			sfsData['data.list'] = sourceList
		} else {
			sfsData['data.list'] = filterItem
		}
		this.metaAction.sfs(sfsData)
	}
	/**
	 * 获取状态
	 */
	getSearchState = () => {
		const state = this.metaAction.gf('data.search.state')
		return state == 0 || state == 1 ? state : 99
	}
	/**
	 * 月份不可选控制
	 */
	disabledMonth =  (current) => {
		let currentOrg = this.metaAction.context.get("currentOrg")
		if (!!currentOrg) {
			let startMonth = currentOrg.enabledYear + "-" + `${currentOrg.enabledMonth}`.padStart('2', '0'),
				maxClosingPeriod = this.metaAction.gf('data.maxClosingPeriod')
			return current && maxClosingPeriod ? (current < moment(maxClosingPeriod).add(1, 'month') || current <= moment(startMonth)) : current <= moment(startMonth)
		} else {
			return false
		}
	}

	getListRowsCount = () => {
		return this.metaAction.gf('data.list') ? this.metaAction.gf('data.list').size : 0
	}
	/**
		* 上一步
		*/
	preStep = async () => {
		this.injections.reduce('loading', true)
		const stepData = await this.webapi.asset.setImpAccountStep({ step: 3 })
		await this.webapi.asset.clearCertificate()
		this.injections.reduce('loading', false)
		if (stepData) {
			this.component.props.setPortalContent('数据导入', 'ttk-gl-app-importdata-accountrelation', {})
		}

	}
	/**
     * 下一步
     */
	nextStep = async () => {
		this.metaAction.sf('data.other.isCanNotToNextStep', true)
		let list = this.metaAction.gf('data.list'),
			startPeriod = this.metaAction.gf('data.search.period'),
			currentOrg = this.metaAction.context.get("currentOrg")

		if (list && list.size > 0) {
			await this.metaAction.modal('show', {
				title: '导入',
				// width: 400,
				// okText: '确定',
				// style: { top: 140 },
				bodyStyle: { padding: 24, fontSize: 12 },
				wrapClassName: 'account-import',
				children: <div>导账成功，请核实财务期初数据、会计科目、基础档案、资产卡片及历史凭证是否准确</div>
			})
			this.injections.reduce('loading', true)
			const stepData = await this.webapi.asset.createList({ 'beginDeprPeriod': startPeriod })
			if (stepData) {
				await this.webapi.asset.importAccountFinished({ orgId: currentOrg.id })
				await this.webapi.asset.setImpAccountStep({ step: 5 })
				this.injections.reduce('loading', false)
				this.metaAction.sf('data.other.isCanNotToNextStep', false)
				this.component.props.setPortalContent('导入完成', 'ttk-gl-app-importdata-success', {})
			}
			this.injections.reduce('loading', false)
			this.metaAction.sf('data.other.isCanNotToNextStep', false)
		}
	}
	//渲染列
	getColumns = () => {
		let list = this.metaAction.gf('data.list') ? this.metaAction.gf('data.list').toJS() : [],
			other = this.metaAction.gf('data.other').toJS()
		return renderColumns(list, other, this)
	}

	/**
	 * 提醒
	 */
	getDelTip = (tipArr) => {
		return (
			<div className='ttk-gl-app-asset-list-del-tip'>
				{tipArr.map((item) => { return <p className='ttk-gl-app-asset-list-del-tip-item'>{item}</p> })}
			</div>
		)
	}

	/**
	 * 修改
	 */
	modifyDetail = (option) => async () => {
		const period = this.metaAction.gf('data.search.period')		
		const ret = await this.metaAction.modal('show', {
			title: '修改资产卡片',
			wrapClassName: 'asset-card',
			className: 'cards',
			okText: '确定',
			bodyStyle: { padding: '10px 0px 10px 24px' },
			footer: '',
			children: this.metaAction.loadApp('app-asset-card', {
				store: this.component.props.store,
				initData: {
					status: 'edit',
					sourceType: 'importAsset',
					id: option.cardId ? option.cardId : '',
					cardId: option.cardId ? option.cardId : '',
					beginDeprPeriod: period
				}
			})
		})
		if (ret) {
			this.refresh()
		}
	}
	/**
	 * 删除
	 */
	delClick = (option) => async (e) => {
		const ret = await this.metaAction.modal('confirm', {
			title: '删除',
			content: '将删除资产卡片及相关凭证'
		})
		if (ret) {
			option.isReturnValue = true
			let response = await this.webapi.asset.delete({ cardIds: [option.cardId] })
			if (response && response.result == false) {
				this.metaAction.toast('error', response.error.message)
			} else {
				let tipArr = []
				if (response && response['60503']) tipArr.push(response['60503'])
				if (response && response['6050301']) tipArr.push(response['6050301'])
				if (tipArr.length) {
					this.metaAction.toast('warning', this.getDelTip(tipArr))
				} else {
					this.metaAction.toast('success', '删除成功')
				}
				this.refresh()
			}
		}
	}
	refresh = async () => {
		this.injections.reduce('loading', true)
		const response = await this.webapi.asset.queryList()
		if (response) {
			this.injections.reduce('refreshList', response)
		}
		this.injections.reduce('loading', false)
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
