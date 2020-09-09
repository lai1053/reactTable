import React from 'react'
import ReactDOM from 'react-dom'
import { action as MetaAction } from 'edf-meta-engine'
import config from './config'
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
		injections.reduce('init')
		this.load()
	}

	load = async () => {
		let org = this.metaAction.context.get('currentOrg')
		let defaultPeriod = await this.webapi.cerficate.getDisplayPeriod()
		let res = await this.webapi.cerficate.query(defaultPeriod)
		this.metaAction.sfs({
			'data.other.disabledDate': `${org.enabledYear}-${org.enabledMonth}`,
			'data.other.period': `${defaultPeriod.year}-${defaultPeriod.period}`
		})
		this.injections.reduce('load', res)
	}
	
	setField = async (path, value) => {
		this.metaAction.sf('data.other.period', value)
		await this.getData()
	}
	getData = async () => {
		let period = this.metaAction.gf('data.other.period')
		period = {year: period.split('-')[0],period: period.split('-')[1]}
		let res = await this.webapi.cerficate.query(period)
		this.injections.reduce('load', res)
	}
	delTemplate = async (item) => {
		
		let res = await this.webapi.cerficate.del({templateId: item.templateId})
		if(res){
			this.metaAction.toast('success', '删除成功')
			await this.getData()
		}
	}
	setting = async (item) => {
		let list = this.metaAction.gf('data.list').toJS()
		const result = await this.metaAction.modal('show', {
            title: '编辑',
			// height: 500,
			width:750,
			okText: '保存',
            children: this.metaAction.loadApp('app-account-cerficate-add', {
                store: this.component.props.store,
				   initData: {item: item,list: list},
				   type: 'update'
            })
		})
		if(result){
			await this.getData()
		}
	}
	addModal = async () => {
		const result = await this.metaAction.modal('show', {
            title: '自定义添加',
			// height: 500,
			width:750,
			okText: '保存',
            children: this.metaAction.loadApp('app-account-cerficate-add', {
                store: this.component.props.store,
               	type: 'add'
            })
		})
		if(result){
			await this.getData()
		}
	}

	linkProofList = (docId) => {
		let period = this.metaAction.gf('data.other.period')
		this.component.props.setPortalContent &&
        this.component.props.setPortalContent(
            '填制凭证',
            'app-proof-of-charge',
            {
                accessType: 1,
                initData: {
                    id: docId
                }               
            }
        )
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
