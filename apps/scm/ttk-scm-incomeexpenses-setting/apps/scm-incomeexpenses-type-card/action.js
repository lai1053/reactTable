import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import {Icon, FormDecorator} from 'edf-component'
import config from './config'
import extend from './extend'

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
        injections.reduce('init')

        this.load()
    }

    load = async () => {
        let option = {}, incomeexpenses = this.component.props.incomeexpenses, code
        if(incomeexpenses && incomeexpenses.type == 'edit'){
            option.form = incomeexpenses
        }else{
            code = await this.webapi.incomeexpensesCard.queryCode({
                isCategory: true,
                parentId: this.component.props.incomeexpensesTabId
            })
            if(code) option.code = code
        }
        this.injections.reduce('load', option)
    }

    //取消
    onCancel = () => {
        this.component.props.closeModal(true)
    }
    
    //保存
	onOk = async (type) => {
        let save = await this.save(type)
        if(save) this.component.props.closeModal(save)
    }
	
	save = async (type) => {
        let form = this.metaAction.gf('data.form').toJS(), option={}, list,
            content = this.component.props.incomeexpenses,
            incomeexpensesTabId = this.component.props.incomeexpensesTabId
		const ok = await this.voucherAction.check([{
			path: 'data.form.code', value: form.code
		}, {
			path: 'data.form.name', value: form.name
        }], this.check)

        if(!ok) return  

        option.code = form.code
        option.name = form.name
        option.pid = incomeexpensesTabId
        //编辑
        if(content && content.type == 'edit'){
            option.id = form.id
            option.ts = form.ts
            list = await this.webapi.incomeexpensesCard.update(option)
            if(!list) return false
            this.metaAction.toast('success', '编辑成功')
        //新增
        }else{
            option.isCategory = true
            list = await this.webapi.incomeexpensesCard.create(option)
            if(!list) return false
            this.metaAction.toast('success', '新增成功')
        } 
        //this.close()
        return list
    }	

    //保存校验
    check = async (option) => {
		if (!option || !option.path)
			return
        if (option.path == 'data.form.code') {
            return { errorPath: 'data.other.error.code', message: !(option.value && option.value.trim()) ? '请录入编码' : (option.value.length > 50 ? '编码不能超过50个字' : '') }
        }
        else if (option.path == 'data.form.name') {
            return { errorPath: 'data.other.error.name', message: !(option.value && option.value.trim()) ? '请录入名称' : (option.value.length > 100 ? '名称不能超过100个字' : '') }
        }
	}
    
    fieldChange = (path, value) => {
		this.voucherAction.fieldChange(path, value, this.check)
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