import React from 'react';
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
import { Menu, Checkbox, DataGrid, Icon, FormDecorator } from 'edf-component';
import extend from './extend';
import config from './config';

class action {
	constructor(option) {
		this.metaAction = option.metaAction;
		this.extendAction = option.extendAction;
		this.voucherAction = option.voucherAction;
		this.config = config.current;
		this.webapi = this.config.webapi;
	}

	onInit = ({ component, injections }) => {
		this.extendAction.gridAction.onInit({ component, injections });
		this.component = component;
		this.injections = injections;
		injections.reduce('init');
		this.load();
	};


	load = async () => {
		this.metaAction.sf('data.other.loading', true);
		let response = {};
		response.revenueType = await this.webapi.revenueType.query();
		response.inventory = await this.webapi.inventory.query();
		response.inventory.forEach((data) => data.disabled = false);
		this.injections.reduce('load', response);
		this.metaAction.sf('data.other.loading', false);
	};

	inventoryChange = (id, _rowIndex) => {
		let data = this.metaAction.gf('data')
			.toJS();
		let inventory,
			revenue;
		data.other.inventory.forEach((inventoryData) => {
			if (inventoryData.id == id) {
				inventory = inventoryData;
			}
		});
		data.other.revenueType.forEach((revenueData) => {
			if (revenueData.id == inventory.revenueType) {
				revenue = revenueData.name;
			}
		});
		data.form.details[_rowIndex].id = id;
		data.form.details[_rowIndex].name = inventory.name;
		data.form.details[_rowIndex].defaultRevenueType = revenue;
		data.other.inventory.forEach((data) => data.disabled = false);
		data.form.details.forEach((detailsData) => {
			data.other.inventory.forEach((revenueData, index) => {
				if (detailsData.id == revenueData.id) {
					data.other.inventory[index].disabled = true;
				}
			});
		});
		this.injections.reduce('dataChange', data);
	};

	revenueTypeChange = (id,rowIndex) => {
		let data = this.metaAction.gf('data')
			.toJS();
		data.form.details[rowIndex].revenueType = id;
		data.other.revenueType.forEach(function (revenueTypeData) {
			if (revenueTypeData.id == id) {
				data.form.details[rowIndex].revenueTypeName = revenueTypeData.name
			}
		});
		this.injections.reduce('dataChange', data);
	};


	fieldChange = (path, value) => {
		this.voucherAction.fieldChange(path, value, this.check);
	};

	newClick = async () => {
		// return false
		let list = this.metaAction.gf('data.form.details')
			.toJS();
		list.forEach((data, index) => {
			if (Object.keys(data).length == 0) {
				list.splice(index, 1);
			}
		});
		list.forEach((data) => {
			data.applyExistingInventory = false;
		});
		let response = await this.webapi.revenueType.set(list);
		if (response) {
			this.metaAction.toast('success', '保存成功');
			document.getElementsByClassName('ant-modal-close-x')[0].click();
		}
	};

	oldClick = async () => {
		let list = this.metaAction.gf('data.form.details')
			.toJS();
		list.forEach((data, index) => {
			if (Object.keys(data).length == 0) {
				list.splice(index, 1);
			}
		});
		list.forEach((data) => {
			data.applyExistingInventory = true;
		});
		let response = await this.webapi.revenueType.set(list);
		if (response) {
			this.metaAction.toast('success', '保存成功');
			document.getElementsByClassName('ant-modal-close-x')[0].click();
		}
	};
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		voucherAction = FormDecorator.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, voucherAction, extendAction }),
		ret = { ...metaAction, ...voucherAction, ...extendAction.gridAction, ...o };
	metaAction.config({ metaHandlers: ret });
	return ret;
}
