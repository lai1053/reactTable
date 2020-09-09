import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import {Icon, Form, Select, FormDecorator, Input, Button} from 'edf-component'
import config from './config'
import extend from './extend'
import { fromJS } from 'immutable'
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
        this.component = component
        this.injections = injections
        if (this.component.props.setOkListener) {
            this.component.props.setOkListener(this.onOk)
        }

        let addEventListener = this.component.props.addEventListener
        if (addEventListener) {
			addEventListener('onTabFocus', :: this.onTabFocus)
		}
        injections.reduce('init')

        this.load()
    }

    //大类列表查询
    load = async () => {
        let option = {}
        option.incomeexpensesTabId = this.component.props.incomeexpensesTabId

        this.metaAction.sf('data.loading', true)
        const list = await this.webapi.accountCard.queryChild({parentId: option.incomeexpensesTabId, isCategory: true})
        this.metaAction.sf('data.loading', false)
        if(list) option.list = list
        this.injections.reduce('load', option)
    }

    //大类列表刷新
    refresh = async () => {
        let incomeexpensesTabId = this.component.props.incomeexpensesTabId
		this.metaAction.sf('data.other.loading', true)
		const res = await this.webapi.accountCard.queryChild({parentId: incomeexpensesTabId, isCategory: true})
		this.metaAction.sf('data.other.loading', false)

		if (res) {
			this.injections.reduce('load', {list: res})
		}
	}

    //大类新增
    newClick = async (option) => {
        let title = this.component.props.incomeexpensesTabId=="3001002" ? '新增收款大类' : '新增付款大类'
        if(option.type == "edit") title = this.component.props.incomeexpensesTabId=="3001002" ? '编辑收款大类' : '编辑付款大类'
        const ret = await this.metaAction.modal('show', {
            width: 400,
            wrapClassName: 'scm-incomeexpenses-type-card',
            title: title,
            footer: '',
            closeModal: this.close,
            closeBack: (back) => { this.closeTip = back },
            children: this.metaAction.loadApp('scm-incomeexpenses-type-card', {
                store: this.component.props.store,
                incomeexpensesTabId: this.component.props.incomeexpensesTabId,
                incomeexpenses: option.type ? option : undefined
			}),
        })
    }

    close = (ret) => {
		this.closeTip()
		if (ret) {
            this.refresh()
        }
	}

    //大类编辑
    editClick = (option) => {
        this.newClick({type: 'edit', ...option})
    }

    //大类删除
    delClick = async (record) => {
        let option = {}, name = '付款'
        if(this.component.props.incomeexpensesTabId=="3001002") name = '收款'
        const ret = await this.metaAction.modal('confirm', {
			title: '删除',
			content: `删除${name}大类，将删除${name}大类下的全部${name}类型，是否确认删除？`
		})

		if (ret) {
            option.id = record.id
            option.ts = record.ts
			let response = await this.webapi.accountCard.delete(option)
			if (response.message) {
				this.metaAction.toast('warn', response.message)
			} else {
				this.metaAction.toast('success', '删除成功')
			}
			this.refresh()
		}
    }

    //大类列表界面确定
	onOk =  () => {
        return this.save()
    }
	
	save = async () => { 
		return true
    }

    getListRowsCount = () => {
		return this.metaAction.gf('data.list').size
    }

    selectRow = (rowIndex) => (e) => {
		this.injections.reduce('selectRow', rowIndex, e.target.checked)
    }
}

export default function creator(option) {
    const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction,voucherAction }),
		ret = { ...metaAction, ...extendAction.gridAction,...voucherAction, ...o }
	
	metaAction.config({ metaHandlers: ret })
	return ret
}