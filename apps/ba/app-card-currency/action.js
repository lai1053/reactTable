import React from 'react';
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
import config from './config';
import { FormDecorator } from 'edf-component';

class action {
	constructor(option) {
		console.log(option);
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
		injections.reduce('init', {
			isPop: this.component.props.isPop
		});
		this.load();
	};

	load = async () => {
		let data = {}, response = {}, code;
		if (this.component.props.personId || this.component.props.personId === 0) {
			response = await this.webapi.currency.query(this.component.props.personId);
		} else {
			code = await this.webapi.currency.getCode();
		}
		if (code) data.code = code;
		if (response) data.response = response;
		this.injections.reduce('load', data);
	};

	getDetail = async (id) => {
		const res = await this.webapi.bankaccount.query(id);
		if (res.result) {
			this.injections.reduce('setCurrency', res.data);
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
			path: 'data.form.code', value: form.code
		}, {
			path: 'data.form.name', value: form.name
		}, {
			path: 'data.form.exchangeRate', value: form.exchangeRate
		}], this.check);
		if (!ok) {
			this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交');
			this.clickStatus = false
			return false;
		}
		let response;
		form.code = form.code ? form.code.trim() : '';
		form.name = form.name ? form.name.trim() : '';
		form.isReturnValue = true;
		form.isLoadingDefaultAccount = false
		if (this.component.props.personId || this.component.props.personId === 0) {
			form.id = this.component.props.personId;
			response = await this.webapi.currency.update(form);
		} else {
			response = await this.webapi.currency.create(form);
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
