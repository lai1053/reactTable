import React from 'react';
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
import config from './config';

import { FormDecorator } from 'edf-component';

class action {
	constructor(option) {
		this.metaAction = option.metaAction;
		this.voucherAction = option.voucherAction;
		this.config = config.current;
		this.webapi = this.config.webapi;
	}

	onInit = ({ component, injections }) => {
		this.voucherAction.onInit({ component, injections });
		this.component = component;
		this.injections = injections;
		this.clickStatus = false;
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk);
		}
		injections.reduce('init');
		this.load();
	};

	load = async () => {
		let data = {}, response;
		response = await this.webapi.inventory.queryData()
		if (response) data.response = response;
		this.injections.reduce('load', data);
	};

	propertyChange = (v) => {
		v = JSON.parse(v)
		let arr = this.metaAction.gf('data.other.propertyDetail').toJS().filter((data) => {
			return v.id == data.propertyId
		})
		this.injections.reduce('propertyChange', v, arr)
		const form = this.metaAction.gf('data.form').toJS(),
			checkArr = [{
				path: 'data.form.property', value: form.property
			}]
		this.voucherAction.check(checkArr, this.check)
	}
	propertyDetailChange = (v) => {
		v = JSON.parse(v)
		let arr = this.metaAction.gf('data.other.propertyDetail').toJS().filter((data) => {
			return v.id == data.propertyId
		})
		this.injections.reduce('propertyChange', v, arr)
		const form = this.metaAction.gf('data.form').toJS(),
			checkArr = [{
				path: 'data.form.propertyDetail', value: form.propertyDetail
			}]
		this.voucherAction.check(checkArr, this.check)
	}

	onOk = async () => {
		return await this.save();
	};

	save = async () => {
		if (this.clickStatus) return;
		this.clickStatus = true;
		const form = this.metaAction.gf('data.form').toJS(),
			isProperty = this.metaAction.gf('data.isProperty')
		let checkArr = [ {
			path: 'data.form.property', value: form.property
		}]
		if (isProperty) {
			checkArr.push({
				path: 'data.form.propertyDetail', value: form.propertyDetail
			})
		}
		const ok = await this.voucherAction.check(checkArr, this.check)
		if (!ok) {
			this.metaAction.toast('warning', '请按页面提示信息修改信息后才可提交');
			this.clickStatus = false;
			return false;
		}
		let inventorySelect = this.component.props.inventorySelect, response;
		inventorySelect.forEach((inventoryData) => {
			if(inventoryData.propertyId != form.property.id){   //存货及服务分类更改，清空税收分类编码
				inventoryData.taxClassificationName = ''
				inventoryData.taxClassificationId = ''
			}
			inventoryData.propertyId = form.property ? form.property.id : ''
			inventoryData.propertyDetail = form.propertyDetail ? form.propertyDetail.id : ''
		})
		response = await this.webapi.inventory.updateBatch(inventorySelect);
		this.clickStatus = false;
		// console.log('嘻嘻哈哈',response)
		if (response){
			this.metaAction.toast('success', '保存成功');
			return response;
		}
	};

	check = async (option) => {
		if (!option || !option.path) return;
		if (option.path == 'data.form.property') {
			return {errorPath: 'data.other.error.property', message: option.value ? '' : '请选择存货及服务分类'}
		}else if (option.path == 'data.form.propertyDetail') {
			return {errorPath: 'data.other.error.propertyDetail', message: option.value ? '' : '请选择明细分类'}
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
