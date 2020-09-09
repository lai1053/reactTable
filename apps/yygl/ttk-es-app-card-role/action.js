import React from 'react'
import {action as MetaAction, AppLoader} from 'edf-meta-engine'
import {List, fromJS} from 'immutable'
import moment from 'moment'
import config from './config'

import {FormDecorator} from 'edf-component'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.voucherAction = option.voucherAction
		this.config = config.current
		this.webapi = this.config.webapi
	}

	onInit = ({component, injections}) => {
		this.voucherAction.onInit({component, injections})
		this.component = component
		this.injections = injections
		this.clickStatus = false
		this.selRole=""
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}
		injections.reduce('init', {
			isPop: this.component.props.isPop
		})
		this.load()
	}

	load = async () => {
		let data = {}, response = {},roleAttr
		if (this.component.props.personId || this.component.props.personId === 0) {
			response = await this.webapi.role.query(this.component.props.personId)//查询当前岗位信息
		} else {
			//code = await this.webapi.role.getCode()
		}
		//if (code) data.code = code
        if (response) data.response = response
        
        roleAttr = await this.webapi.role.roleAttr()//岗位类型
		if (roleAttr) data.roleAttr = roleAttr
		
		console.log(response, 'response')
		this.selRole=response.postType;
		console.log("岗位："+this.selRole);
		
		this.injections.reduce('load', data)
	}

	onOk = async () => {
		return await this.save()
	}

	save = async () => {
		console.log(99999999999999+"state::::"+this.clickStatus);
		if (this.clickStatus) return
		this.clickStatus = true
		const form = this.metaAction.gf('data.form').toJS()
		//console.log("chushi::"+form.postType);
		const ok = await this.voucherAction.check([{
			path: 'data.form.postType', value: form.postType
		}, {
			path: 'data.form.postName', value: form.postName
		}], this.check)

		if (!ok) {
			this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
			this.clickStatus = false
			return false
		}

		let response
	 
		const postTypeObj= this.metaAction.gf('data.other.postTypeObj');//重新取岗位的值

		form.postType = postTypeObj&&postTypeObj.code ? postTypeObj.code: form.postType//重新取岗位的值
		

		form.postName = form.postName ? form.postName.trim() : ''
		form.isReturnValue = true
		form.isLoadingDefaultAccount = false
        
		if (this.component.props.personId || this.component.props.personId === 0) {
			form.id = this.component.props.personId
			console.log("选择的角色："+this.selRole);
			if(this.selRole=="002" && form.postType == '001'){//当系统由业务岗变更为管理岗时进行提醒
				const ret = await this.metaAction.modal('confirm', {
					title: '编辑岗位',
					content: '岗位类型变更为【管理】后，客户分配功能中将不显示该岗位，确定要变更吗?'
				});

				if(ret){
					response = await this.webapi.role.update(form)//更新岗位
				}
			}
			else{
				response = await this.webapi.role.update(form)//更新岗位
			}
		} else {
			if(form.postType>0){
				if(postTypeObj.code>0 ){
					console.log("选择了岗位");
					response = await this.webapi.role.create(form)//新增岗位
				}
				else{
					this.metaAction.toast('error', "请选择岗位类型！")
					this.clickStatus = false
			        return false
				}
			}
			else{
				this.metaAction.toast('error', "请选择岗位类型！")
				this.clickStatus = false
			    return false
			}
		
		}
		
		this.clickStatus = false

		if (!response.success) {
			this.metaAction.toast('error', response.message)
			return false
		} else {
			this.metaAction.toast('success', '保存成功')
			return response
		}
	}

	changeCheck = (str) => {
		const form = this.metaAction.gf('data.form').toJS()
		switch (str){
			case 'postType':
				this.voucherAction.check([{
					path: 'data.form.postType', value: form.postType
				}], this.check);
				break;
			case 'postName':
				this.voucherAction.check([{
					path: 'data.form.postName', value: form.postName
				}], this.check);
				break;
		}
	}

	check = async (option) => {
		console.table(option);
		if (!option || !option.path) return
		if (option.path == 'data.form.postType') {
			return {errorPath: 'data.other.error.postType', message: option.value && option.value.name ? '请选择岗位类型': ''}
		} else if (option.path == 'data.form.postName') {
			return {errorPath: 'data.other.error.postName', message: option.value && option.value.trim() ? (option.value.trim().length > 16 ? '名称不得大于16个字符' : "") : '请录入岗位名称'}
		}
	}

	fieldChange = (path, value) => {
		this.voucherAction.fieldChange(path, value, this.check)
	}

}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		voucherAction = FormDecorator.actionCreator({...option, metaAction}),
		o = new action({...option, metaAction, voucherAction}),
		ret = {...metaAction, ...voucherAction, ...o}

	metaAction.config({metaHandlers: ret})

	return ret
}
