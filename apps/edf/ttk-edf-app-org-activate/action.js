import React from 'react';
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
import extend from './extend';
import config from './config';
import { toJS, fromJS } from 'immutable'
import {consts} from 'edf-consts'
import { FormDecorator, LoadingMask } from 'edf-component';

class action {
	constructor(option) {
		this.metaAction = option.metaAction;
		this.voucherAction = option.voucherAction
		this.extendAction = option.extendAction;
		this.config = config.current;
		this.webapi = this.config.webapi;
	}

	onInit = ({ component, injections }) => {
		this.voucherAction.onInit({component, injections})
		this.component = component;
		this.injections = injections;
		injections.reduce('init');
		this.metaAction.sf('data.company', this.component.props.company && fromJS(this.component.props.company))
		 //获取appVersion
		 let appVersion = this.component.props.appVersion
		 if (!!appVersion) {
			 this.metaAction.sf('data.appVersion', this.component.props.appVersion)
		 }
		this.load();
	};

	load = async () => {

	};

	activateClick = async() => {
		let data = this.metaAction.gf('data').toJS()
		if(!(data.form.psw && data.form.account)) return false
		if(!!data.company.unpaidOrderId){
			const res = await this.metaAction.modal('warning', {
				title: '提示',
				content: '此企业存在未支付的订单，请到“我的订单”进行处理！',
				okText:'确定'
			})
			if(res) {
			}
			return false
		}
		// if(data.company.status == consts.ORGSTATUS_005 ||  data.company.status == consts.ORGSTATUS_006){
		// 	const res = await this.metaAction.modal('confirm', {
		// 		title: '提示',
		// 		content: '此企业存在未支付的订单，请到“我的订单”进行处理！',
		// 	})
		// 	if(res) {
		// 	}
		// 	return false
		// }
		let orderForm = {
			orgId: data.company.id,         // 企业ID
			sequenceNo: data.form.account,     // 激活码序号
			activationCode: data.form.psw           // 激活码
		}
		let response = await this.webapi.ordercenter.create(orderForm)
		if (response) {
			this.metaAction.toast('success', '激活成功')
			setTimeout(function (){window.location.reload()},1000)
		}
	}
	goBack = () => {
		if(this.component.props.activateSource == 'edfx-app-portal'){
			this.component.props.setPortalContent('门户首页', 'edfx-app-portal', {isShowMenu: false, isTabsStyle: false})
		}
		if(this.component.props.activateSource == 'edf-company-manage'){
			this.component.props.setPortalContent('企业管理', 'edf-company-manage')
		}
	}
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		voucherAction = FormDecorator.actionCreator({...option, metaAction}),
		extendAction = extend.actionCreator({ ...option, metaAction }),
		o = new action({ ...option, metaAction, extendAction, voucherAction}),
		ret = { ...metaAction, ...extendAction.gridAction, ...voucherAction, ...o };
	metaAction.config({ metaHandlers: ret });
	return ret;
}
