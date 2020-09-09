import React from 'react';
import { action as MetaAction, AppLoader } from 'edf-meta-engine';
import debounce from 'lodash.debounce'
import moment from 'moment'
import extend from './extend';
import config from './config';
import { toJS, fromJS } from 'immutable'
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
		// this.extendAction.gridAction.onInit({ component, injections });
		this.component = component;
		this.injections = injections;
		injections.reduce('init');
		this.commitStatus = true
		if(this.component.props.origin == 1){
			LoadingMask.show()
			this.metaAction.sf('data.other.step', 2)
			this.quickCommit(this.component.props.orderData);
		}else {
			this.getStartTime()
			this.load();
		}
		// // 再次进入 refresh
		// let addEventListener = this.component.props.addEventListener;
		// if (addEventListener) {
		// 	addEventListener('onTabFocus', :: this.load);
		// }
		if(this.component.props.appVersion) {
			this.metaAction.sfs({
				'data.appVersion': this.component.props.appVersion,
				'data.form.productId': this.component.props.appVersion == 104 ? 4 : 1,
				'data.other.productName': this.component.props.appVersion == 104 ? '金财管家-精锐版' : '金财管家-标准版',
			})
		}
	};

	load = async () => {
		// let org = Object.assign({}, this.metaAction.context.get("currentOrg")) || {}
		this.metaAction.sf('data.form.orgId', this.component.props.company.id);
		let response = await this.webapi.ordercenter.productList({entity:{isLegacyProduct:false}})
		// let startTime = await this.webapi.ordercenter.startTime({orgId:this.component.props.company.id})
		let appVersion = this.metaAction.gf('data.appVersion')
		let showArr = {list:[]}
		if(response && response.list && Array.isArray(response.list)){
			if(appVersion == 104) {
				showArr.list = response.list.filter(function(item) {
					return item.appId == 104
				})
			}else {
				showArr.list = response.list.filter(function(item) {
					return item.appId != 104
				})
				showArr.list.push(
					{id:8,name:"定制版",description:"适用于大中企业",price:-2,productStatus:2,isActivationProduct:false,appId:"100",maxUser:"-1",ts:"2018-10-31 19:25:00.0"}
				)
			}
			// response.list.push(
			// 	{id:7,name:"合作版",description:"适用于中小企业",price:-1,productStatus:2,isActivationProduct:false,appId:"100",maxUser:"-1",ts:"2018-10-31 19:25:00.0"}
			// )

		}
		let obj = Object.assign({},showArr)
		// obj.startTime = startTime
		if(appVersion == 104){
			this.metaAction.sf('data.other.productPrice', 2680)
		}
		this.injections.reduce('load', obj)
	};

	packageClassName = (index) => {
			let data = this.metaAction.gf('data').toJS();
			if(data.other.productList[index].productStatus == 1 ){
				if(data.other.productList[index].id == data.form.productId || data.other.productList[index].id == 4){
					return "ttk-edf-app-buy-content-left-package active"
				}else {
					return "ttk-edf-app-buy-content-left-package"
				}
			}else {
				return "ttk-edf-app-buy-content-left-package noAllow"
			}
	}

	getStartTime = async () => {
		function callBack(time){this.metaAction.sf('data.other.startTime', time)}
		let startTime = await this.webapi.ordercenter.startTime({orgId:this.component.props.company.id}, callBack.bind(this))
		this.metaAction.sfs({'data.other.startTime': startTime})
	}

	packageSelect = (arr) => () => {
		const data = this.metaAction.gf('data').toJS();
		if(arr.productStatus == 2) return
		this.injections.reduce('packageSelect', arr)
	}

	getCurrentOrg = () => Object.assign({}, this.metaAction.context.get("currentOrg")) || {}

	getOrgName = () => {   //立即支付时，不会传给我 company，暂时用当前企业名称过去
		// const org = this.getCurrentOrg()
		// if (org) {
		// 	return org.name;
		// }
		return (this.component.props.company && this.component.props.company.name) || (this.component.props.orderData && this.component.props.orderData.orgName)
	}

	showAgreement = async () => {
		const ret = await this.metaAction.modal('show', {
			title: '用户协议条款',
			width: 700,
			bodyStyle: { height: 400, overflow: 'auto' },
			okText: '同意',
			cancelText: '不同意',
			// className: 'pruductBuy',
			children: this.metaAction.loadApp('edfx-app-agreement', {
				store: this.component.props.store,
			})
		})

		this.metaAction.sf('data.form.agree', !!ret)
	}

	buyTimeChange = (key) => this.injections.reduce('buyTimeChange', key)

	InvoiceChange = (key) => this.injections.reduce('InvoiceChange', key)


	listCommit = async () => {
		let form = this.metaAction.gf('data.form').toJS(),
			other = this.metaAction.gf('data.other').toJS()
		form.invoiceStatus = form.invoiceStatus == false ? 1 : 2
		if (!form.agree) {
			return false
		}
		if(form.invoiceStatus == 2 && other.invoiceType == false){
			this.metaAction.toast('warning', '请保存开票信息');
			return false
		}
		// const ok = await this.voucherAction.check([{ path: 'data.form.serviceProviderName', value: form.serviceProviderName }], this.check)
		// if (!ok) {
		// 	this.metaAction.toast('warning', '请按页面提示信息修改信息后才可保存')
		// 	return false
		// }
		if(!this.commitStatus) return       //阻止重复点击下单
		this.commitStatus = false
		setTimeout(function time (){ this.commitStatus =true }.bind(this),2000)
		LoadingMask.show()
		this.metaAction.sf('data.other.step', 2)
		let response = await this.webapi.ordercenter.create(form)
		if (response) {
			// let org = Object.assign({}, this.metaAction.context.get("currentOrg")) || {}
			let isIE= /(msie\s|trident.*rv:)([\w.]+)/.test(navigator.userAgent.toLowerCase()),
			 commitObj = {
				orderId: response.id,
				payRetUrl: window.location.protocol+"//"+ window.location.host + '/vendor/pay.html',    //支付成功后需要调转的 url
				payNotifyUrl: window.location.protocol+"//"+ window.location.host + '/v1/edf/ordercenter/paynotifyurl',    //支付成功后支付平台会回调通知此 url
				returnUrlProtocol: window.location.protocol == 'http:' ? 'http' : 'https'
			}
			if(isIE) {
				commitObj.payRetUrl = window.location.protocol + "//" + window.location.host + '/#/edfx-app-root/edfx-app-portal/edfx-app-home'    //支付成功后需要调转的 url
			}
			let orderResponse = await this.webapi.ordercenter.orderPay(commitObj)
			if(orderResponse){
				LoadingMask.hide()
				if(isIE) window.location = orderResponse
				other.iframeUrl = orderResponse
				other.step = 2
				this.metaAction.sf('data.other', fromJS(other))
			}
		}
	}
	quickCommit = async (data) => {   //立即下单
		let isIE= /(msie\s|trident.*rv:)([\w.]+)/.test(navigator.userAgent.toLowerCase()),
		 other = this.metaAction.gf('data.other').toJS(),
			commitObj = {
				orderId: data.id,
				payRetUrl: window.location.protocol + "//" + window.location.host + '/vendor/pay.html',    //支付成功后需要调转的 url
				payNotifyUrl: window.location.protocol + "//" + window.location.host + '/v1/edf/ordercenter/paynotifyurl',    //支付成功后支付平台会回调通知此 url
				returnUrlProtocol: window.location.protocol == 'http:' ? 'http' : 'https'
			}
		if(isIE) {
			commitObj.payRetUrl = window.location.protocol + "//" + window.location.host + '/#/edfx-app-root/edfx-app-portal/edfx-app-home'    //支付成功后需要调转的 url
		}
		let orderResponse = await this.webapi.ordercenter.orderPay(commitObj)
		if(orderResponse){
			LoadingMask.hide()
			if(isIE) window.location = orderResponse
			other.iframeUrl = orderResponse
			other.step = 2
			this.metaAction.sf('data.other', fromJS(other))
		}
	}

	payIframe = () => this.metaAction.gf('data.other.iframeUrl')

	invoiceSave = async() => {
		const form = this.metaAction.gf('data.form').toJS()
		let checkArr
		if(form.orderInvoice.titleType == 1){
			checkArr =[{
				path: 'data.form.orderInvoice.title', value: form.orderInvoice.title
			}, {
				path: 'data.form.orderInvoice.vatTaxpayerNum', value: form.orderInvoice.vatTaxpayerNum
			}]
		}else {
			checkArr =[{
				path: 'data.form.orderInvoice.title', value: form.orderInvoice.title
			}]
		}
		const ok = await this.voucherAction.check(checkArr, this.check)

		if (!ok) {
			this.metaAction.toast('warning', '请按页面提示信息修改信息后才可保存')
			return false
		}
		this.injections.reduce('invoiceSave')
	}

	inputCheck = (checkArr) => {
		this.voucherAction.check(checkArr, this.check)
	}

	check = async (option) => {   //输入检查
		if (!option || !option.path) return
		const form = this.metaAction.gf('data.form').toJS()
		if (option.path == 'data.form.orderInvoice.title') {
			return {errorPath: 'data.other.error.orderInvoice.title', message: option.value && option.value.trim() ? (option.value.length > 50 ? (form.orderInvoice.titleType == 1 ?'企业名称最大长度为50个字符' : '发票抬头最大长度为50个字符') : '') : (form.orderInvoice.titleType == 1 ? "请录入企业名称" : "请录入发票抬头")}
		} else if (option.path == 'data.form.orderInvoice.vatTaxpayerNum') {
			let message
			let res = await this.webapi.ordercenter.validevatTaxpayerNum({vatTaxpayerNum: option.value})
            if(res.state){
                message = undefined
            }else{
                message = res.message
            }
			return {errorPath: 'data.other.error.orderInvoice.vatTaxpayerNum', message}
		} else if (option.path == 'data.form.orderInvoice.vatTaxpayerNumInput') {
			let message
			// let res = await this.webapi.ordercenter.validevatTaxpayerNum({vatTaxpayerNum: option.value})
            // if(res.state){
            //     message = undefined
            // }else{
            //     message = res.message
            // }
			return {errorPath: 'data.other.error.orderInvoice.vatTaxpayerNum', message}
		}else if (option.path == 'data.form.serviceProviderName') {
			return {errorPath: 'data.other.error.serviceProviderName', message: option.value.length > 50 ? '服务商最大长度为50个字符' : ''}
		}
	}

	goBack = () => {   //返回控制
		const step = this.metaAction.gf('data.other.step')
		if(step == 1){
			this.component.props.setPortalContent('企业管理', 'edf-company-manage')
		}else {
			this.component.props.setPortalContent('企业管理', 'edf-company-manage',{tabState:2})
		}
	}

	endTime = (time) => {   //结束时间
		const startTime = this.metaAction.gf('data.other.startTime')
		let endTime = moment(new Date(startTime)).add(365*time, 'days').format("YYYY-MM-DD");
		if(endTime == 'Invalid date') endTime = '2000-01-01'
		return endTime
	}

	invoiceStatus = (data) => {
		this.metaAction.sf('data.form.invoiceStatus', data)
		setTimeout(() => {
			let scrollCon = document.querySelector('.ttk-edf-app-buy .ttk-edf-app-buy-content')
			scrollCon.scrollTop = 262
		}, 0)

	}
	getDetailDescribe = (index) => {
		index -= 1
		if(index == 0) {
			return (
				<div className="remindInfo">
					<h1>功能</h1>
					<p>业务、财务、税务一体化</p>
				</div>
			)
		}else if(index == 1) {
			return (
				<div className="remindInfo">
					<h1>功能</h1>
					<p>业务、财务、税务一体化</p>
					<p>智能申报第三方财务报表</p>
					<p>支持定制</p>
				</div>
			)
		}else if(index == 3) {  //传进来的精锐版 id=4
			return (
				<div className="remindInfo">
					<h1>功能</h1>
					<p>一键采集进销项发票</p>
					<p>发票生成用友金蝶财务凭证</p>
					<p>自动算税便捷申报</p>
					<p>智能申报用友金蝶财务报表</p>
				</div>
			)
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
