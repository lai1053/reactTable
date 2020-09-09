import React from 'react';
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
import config from './config';
import { FormDecorator } from 'edf-component';

class action {
	constructor(option) {
		this.metaAction = option.metaAction;
		this.config = config.current;
		this.voucherAction = option.voucherAction;
		this.webapi = this.config.webapi;
	}

	onInit = ({ component, injections }) => {
		this.voucherAction.onInit({ component, injections });
		this.component = component;
		this.injections = injections;
		this.clickStatus = false
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk);
		}
		injections.reduce('init');
		this.load();
	};

	load = async () => {
		if(this.component.props.baseArchiveType){
			this.metaAction.sf('data.form.baseArchiveType',this.component.props.baseArchiveType)
		}
		if(this.component.props.catName){
			this.metaAction.sf('data.form.name',this.component.props.catName)
		}

	};

	onOk = async () => {
		return await this.save();
	};

	save = async () => {
		if (this.clickStatus) return
		this.clickStatus = true
		const form = this.metaAction.gf('data.form').toJS();
		const ok = await this.voucherAction.check([{
			path: 'data.form.name', value: form.name
		}], this.check);
		let response, option = {}
		if (!ok) {
			this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交')
			this.clickStatus = false
			return false
		}
		option.name = form.name.trim()
		option.baseArchiveType = form.baseArchiveType;
		option.isReturnValue = true
		if (this.component.props.id) {
			option.id = this.component.props.id
			let newOption = Object.assign({}, this.component.props.filter,option);
			if(this.component.props.catName == option.name) return
			response = await this.webapi.cat.update(newOption)
		} else if (this.component.props.parentId) {
			if ('genid' != this.component.props.parentId) {
				option.parentId = this.component.props.parentId
			}else{
				option.parentId = 0
			}
			response = await this.webapi.cat.create(option)
		} else {
			option.parentId = 0
			response = await this.webapi.cat.create(option)
		}
		this.clickStatus = false
		if (response && response.error) {
			this.metaAction.toast('error', response.error.message);
			return false;
		} else {
			this.metaAction.toast('success', '保存成功');
			return response;
		}
	};

	changeCheck = (str) => {
		const form = this.metaAction.gf('data.form')
			.toJS();
		switch (str){
			case 'code':
				this.voucherAction.check([{
					path: 'data.form.code', value: form.code
				}], this.check);
				break;
			case 'name':
				this.voucherAction.check([{
					path: 'data.form.name', value: form.name
				}], this.check);
				break;
		}
	};

	check = (option) => {
		if (!option || !option.path) return;
		if (option.path == 'data.form.code') {
			return { errorPath: 'data.other.error.code', message: option.value && option.value.trim() ? (option.value.trim().length > 50 ? '编码最大长度为50个字符' : "") : '请录入编码' };
		}
		else if (option.path == 'data.form.name') {
			return { errorPath: 'data.other.error.name', message: option.value && option.value.trim() ? (option.value.trim().length > 100 ? '名称最大长度为100个字符' : "") : '请录入名称' };
		}
		else if (option.path == 'data.form.exchangeRate') {
			if (!option.value) {
				return { errorPath: 'data.other.error.exchangeRate', message: option.value ? '' : '请录入汇率' };
			} else {
				if (option.value < 0) {
					return {
						errorPath: 'data.other.error.exchangeRate',
						message: option.value < 0 ? '汇率为非负值' : ''
					};
				} else {
					return {
						errorPath: 'data.other.error.exchangeRate',
						message: option.value > 999999999999.999999 ? '最大整数位为12位' : ''
					};
				}

			}
		}
	};

	fieldChange = (path, value) => {
		this.voucherAction.fieldChange(path, value, this.check);
	};
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, voucherAction }),
		ret = { ...metaAction, ...voucherAction, ...o };
	metaAction.config({ metaHandlers: ret });
	return ret;
}
