import React from 'react'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import { FormDecorator, LoadingMask } from 'edf-component'
import { fetch } from 'edf-utils'
import utils from 'edf-utils'
import { trimExt } from 'upath'
import moment from 'moment'
import { Map, fromJS, toJS } from 'immutable'

import { Carousel } from 'edf-component'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.config = config.current
		this.webapi = this.config.webapi
		//	this.beforeLoad = option.voucherAction.excelbeforeUpload
	}

	onInit = ({ component, injections }) => {
		this.component = component
		this.injections = injections
		if (this.component.props.setOkListener) {
			this.component.props.setOkListener(this.onOk)
		}
		// let defaultdate = this.component.props.defaultdate
		// if (!defaultdate) {
		// 	defaultdate = moment().subtract(1, "months").startOf('month')
		// }
		injections.reduce('init')
		//this.load(this.component.props.vatOrEntry)
		this.load()
	}

	load = async () => {
		const { enabledMonth, enabledYear, periodDate } = this.metaAction.context.get('currentOrg') //获取全局的启用日期

		let defaultdate = moment();//默认日期
		let enableddate = moment();//企业启用日期
		//默认日期
		if (periodDate) {
			defaultdate = moment(periodDate);
		}
		if (this.component.props.defaultdate) {
			defaultdate = this.component.props.defaultdate
		}

		if (enabledMonth && enabledYear) {
			enableddate = utils.date.transformMomentDate(`${enabledYear}-${enabledMonth}`)
		}

		let numYear = defaultdate.format('YYYY')

		let newLength = numYear - enabledYear
		let arrYear = []

		for(var i=0;i<=newLength ;i++) {
			arrYear.push({id:numYear-i,name:`${numYear-i}`})
		}

		// let arrYear = [{id:numYear,name:`${numYear}`},
		// 				},
		// 				{id:numYear-2,name:`${numYear-2}`},
		// 				{id:numYear-3,name:`${numYear-3}`},
		// 				{id:numYear-4,name:`${numYear-4}`},
		// 				{id:numYear-5,name:`${numYear-5}`},
		// 				{id:numYear-6,name:`${numYear-6}`}]

		this.metaAction.sfs({
			'data.year': numYear,
			'data.other.year': fromJS(arrYear),
		});
		if(this.metaAction.context.get("currentOrg").vatTaxpayer == 2000010002) {
			if(this.component.props.flag == 'sa') {
				this.metaAction.sf('data.small', true)
			}
		}
		if (this.component.props.authenticatedInvoice) {
			this.metaAction.sfs({
				'data.date': defaultdate,
				'data.dateString': defaultdate.format('YYYY-MM'),
				'data.loading': false,
				'data.other.flag': this.component.props.flag
			});

			return;
		}

		let flag = this.component.props.flag,//默认日期
			enableddateStart = undefined,
			enableddateEnd = undefined

		if (this.component.props.enableddateStart) enableddateStart = this.component.props.enableddateStart
		if (this.component.props.enableddateEnd) enableddateEnd = this.component.props.enableddateEnd
		let settledate = await this.webapi.getSettleDate()//结账日期
		//let defaultdate = moment().subtract(1, "months").startOf('month')//默认日期为上月
		if (settledate && settledate.year && settledate.month) {
			settledate = utils.date.transformMomentDate(`${settledate.year}-${settledate.month}`)
			if (settledate.format('YYYYMM') > defaultdate.format('YYYYMM')) {
				defaultdate = settledate.startOf('month')//单据日期的下月
			}
			enableddate = settledate
			//setTimeout(() => {
			this.injections.reduce('load', { defaultdate, enableddate, enableddateStart, enableddateEnd, flag })
			//}, 3000);
		}
	}

	//load = async () => {
	//获取银行账户
	//const res = await this.webapi.bankAccount({ status: true });
	//this.injections.reduce('load', { res: res.list });
	//}
	// onCancel = async () => {
	// 	this.component.props.closeModal({ cancel: true });
	// }
	//改变账户
	// bankAccountChange = async (value) => {
	// 	this.injections.reduce('updateArr', 'data.form.bankAccountId', value);
	// }

	dateChange = async (date, dateString) => {
		this.injections.reduce('dateChange', date, dateString)
	}

	issuedByTaxonChange = (v) => {
        let issuedByTax = this.metaAction.gf('data.form.issuedByTax')
        this.metaAction.sfs({
            'data.form.issuedByTax': !issuedByTax
        })
    }

	getName = () => {
		let flag = this.component.props.flag
		if (flag == 'pu') {
			if (this.metaAction.context.get("currentOrg").vatTaxpayer == 2000010001) {
				return '注：包含本月认证发票和本月开具发票'
			} else {
				return '注：包含本月开具发票'
			}
		}
	}

	renderTest = (flag) => {
		let data = [{
			'text': '正在采集专用发票'
		}, {
			'text': '正在采集普通发票'
		}]

		if (flag == 'pu') {
			// data.push(
			// 	{
			// 		'text': '正在采集电子发票'
			// 	}
			// )
			// data.push(
			// 	{
			// 		'text': '正在采集通行费发票'
			// 	}
			// )
			// data.push(
			// 	{
			// 		'text': '正在采集农产品发票'
			// 	}
			// )
			// data.push(
			// 	{
			// 		'text': '正在采集海关缴款书'
			// 	}
			// )
			data = data.concat([
				{
					'text': '正在采集电子发票'
				},
				{
					'text': '正在采集通行费发票'
				},
				{
					'text': '正在采集农产品发票'
				},
				{
					'text': '正在采集海关缴款书'
				}
			])
		}

		if (flag == 'authenticatedInvoice') {
			data = [{
				'text': '正在采集增值税专用发票'
			},
			{
				'text': '正在采集机动车发票'
			}]
		}
		let issuedByTax = this.metaAction.gf('data.form.issuedByTax')

		if(flag == 'sa' && issuedByTax == false) {
			let quarterId = this.metaAction.gf('data.form.quarterId')
			if(quarterId == 1) {
				data = data.concat([
					{
						'text': '正在采集一月份发票'
					},
					{
						'text': '正在采集二月份发票'
					},
					{
						'text': '正在采集三月份发票'
					}
				])
			}
			if(quarterId == 2) {
				data = data.concat([
					{
						'text': '正在采集四月份发票'
					},
					{
						'text': '正在采集五月份发票'
					},
					{
						'text': '正在采集六月份发票'
					}
				])
			}
			if(quarterId == 3) {
				data = data.concat([
					{
						'text': '正在采集七月份发票'
					},
					{
						'text': '正在采集八月份发票'
					},
					{
						'text': '正在采集九月份发票'
					}
				])
			}
			if(quarterId == 4) {
				data = data.concat([
					{
						'text': '正在采集十月份发票'
					},
					{
						'text': '正在采集十一月份发票'
					},
					{
						'text': '正在采集十二月份发票'
					}
				])
			}
		}

		const arr = data.map((item, index) => {
			return (
				<div key={index}>
					<span className="ttk-scm-app-collect-loadingText">{item.text}</span>
				</div>
			)
		})
		return (
			<div style={{ width: '100%', height: '28px' }}>
				<Carousel
					pauseOnHover={false}
					dots={false}
					style={{ width: '100%', height: '28px', lineHeight: '28px' }}
					autoplaySpeed={1000}
					speed={1000}
					autoplay={true}
					vertical
				>
					{arr}
				</Carousel>
			</div>

		)
	}



	// accountDateChange = async (date) => {
	// 	this.injections.reduce('accountDateChange', date);
	// }

	onOk = async () => {
		let flag = this.component.props.flag
		const data = this.metaAction.gf('data').toJS()
		let issuedByTax = this.metaAction.gf('data.form.issuedByTax')
		
		if (!data.date) {
			this.metaAction.toast('error', '请选择采集月份')
			return false
		}

		let collectStart = {
			'data.other.tip': this.renderTest(flag),
			'data.loading': true
		}

		this.injections.reduce('updateState', collectStart)
		// window.setTimeout(function () {
		// 	this.injections.reduce('updateTip', '正在采集专票')
		// })
		// window.setTimeout(function () {
		// 	this.injections.reduce('updateTip', '正在采集普票')
		// })

		/*
		this.injections.reduce('updateTip', '发票采集中...')
		this.injections.reduce('loading', true);
		*/

		if(flag == 'sa' && issuedByTax == false) {
			// let date = data.date.format('YYYY')
			let res = {}
			let date = this.metaAction.gf('data.year')

			let quarterId = this.metaAction.gf('data.form.quarterId')
			if(quarterId == 1) {
				let date1 = date + '-' + '01'
				let begin = moment(date1).startOf('month')//起始日期
				let end = moment(date1).endOf('month')//结束日期
				let list = []

				begin = `${begin.format('YYYY-MM-DD')} 00:00:00`
				end = `${end.format('YYYY-MM-DD')} 23:59:59`

				let params1 = {
					begin, end
				}
				if (this.component.props.authenticatedInvoice) {
					params1.authenticatedInvoice = true;
				}
				const res1 = await this.component.props.collectOnOk(params1)
				if (res1 == undefined) {
					this.injections.reduce('loading', false);
					return false
				}
				if (res1.message == '生成单据成功' && res1.list && res1.list.length > 0) {
					for(var i = 0; i<res1.list.length;i++) {
						res1.list[i].month = '一月'
						list.push(res1.list[i])
					}
					res.invoice = res1.invoice
				}
				if (res1.message == '本次采集0条发票') {
					let total = {month: '一月',authenticatedInvoice: false, isInit: true, beginLong: 0, endLong: 0, invoiceSum: 0, invoiceRedSum: 0,invoiceStateSum:0,invoiceSum:0,invoiceTypeName: "合计",invoicebuleSum: 0,isAuthenTemplate: 0,isInit: true,taxTotal: 0,amountTotal:0,amountAndTaxTotal:0}
					list.push(total)
				}

				let date2 = date + '-' + '02'
				begin = moment(date2).startOf('month')//起始日期
				end = moment(date2).endOf('month')//结束日期

				begin = `${begin.format('YYYY-MM-DD')} 00:00:00`
				end = `${end.format('YYYY-MM-DD')} 23:59:59`

				let params2 = {
					begin, end
				}
				if (this.component.props.authenticatedInvoice) {
					params.authenticatedInvoice = true;
				}
				const res2 = await this.component.props.collectOnOk(params2)
				if (res2 == undefined) {
					this.injections.reduce('loading', false);
					return false
				}
				if (res2.message == '生成单据成功' && res2.list && res2.list.length > 0) {
					for(var i = 0; i<res2.list.length;i++) {
						res2.list[i].month = '二月'
						list.push(res2.list[i])
					}
					res.invoice = res1.invoice
				}
				if (res2.message == '本次采集0条发票') {
					let total = {month: '二月',amountTotal:0,amountAndTaxTotal:0,authenticatedInvoice: false, isInit: true, beginLong: 0, endLong: 0, invoiceSum: 0, invoiceRedSum: 0,invoiceStateSum:0,invoiceSum:0,invoiceTypeName: "合计",invoicebuleSum: 0,isAuthenTemplate: 0,isInit: true,taxTotal: 0}
					list.push(total)
				}
			

				let date3 = date + '-' + '03'
				begin = moment(date3).startOf('month')//起始日期
				end = moment(date3).endOf('month')//结束日期

				begin = `${begin.format('YYYY-MM-DD')} 00:00:00`
				end = `${end.format('YYYY-MM-DD')} 23:59:59`

				let params3 = {
					begin, end
				}
				if (this.component.props.authenticatedInvoice) {
					params.authenticatedInvoice = true;
				}
				const res3 = await this.component.props.collectOnOk(params3)
				if (res3 == undefined) {
					this.injections.reduce('loading', false);
					return false
				}
				if (res3.message == '生成单据成功' && res3.list && res3.list.length > 0) {
					for(var i = 0; i<res3.list.length;i++) {
						res3.list[i].month = '三月'
						list.push(res3.list[i])
					}
					res.invoice = res1.invoice
				}
				if (res3.message == '本次采集0条发票') {
					let total = {month: '三月',amountTotal:0,amountAndTaxTotal:0,authenticatedInvoice: false, isInit: true, beginLong: 0, endLong: 0, invoiceSum: 0, invoiceRedSum: 0,invoiceStateSum:0,invoiceSum:0,invoiceTypeName: "合计",invoicebuleSum: 0,isAuthenTemplate: 0,isInit: true,taxTotal: 0}
					list.push(total)
				}

				let allInvoiceSum = 0,allAmountTotal = 0,allAmountAndTaxTotal = 0,allTaxTotal = 0,invoicebuleSum = 0,invoiceRedSum = 0,invoiceStateSum = 0
				for(var i=0;i<list.length;i++){
					if(list[i].invoiceTypeName == '合计') {
						invoicebuleSum += list[i].invoicebuleSum
						invoiceRedSum += list[i].invoiceRedSum
						invoiceStateSum += list[i].invoiceStateSum
						allInvoiceSum += list[i].invoiceSum
						allTaxTotal += list[i].taxTotal
						allAmountTotal += list[i].amountTotal
						allAmountAndTaxTotal += list[i].amountAndTaxTotal
					}
				}
				
				let amountTotal= 0,amountAndTaxTotal = 0,taxTotal = 0,invoiceSum = 0
				let Newtotal = {month: '第一季度',
							amountTotal:allAmountTotal,
							amountAndTaxTotal:allAmountAndTaxTotal,
							taxTotal:allTaxTotal,
							invoiceSum:allInvoiceSum,
							invoiceStateSum:invoiceStateSum,
							invoiceRedSum:invoiceRedSum,
							invoicebuleSum:invoicebuleSum,
							authenticatedInvoice: false, 
							isInit: true, beginLong: 0, endLong: 0, invoiceTypeName: "合计",isAuthenTemplate: 0,isInit: true}
				list.push(Newtotal)
				res.list = list
				res.issuedByTax = issuedByTax
				
				this.injections.reduce('loading', false);
				if (res) {
					begin = date + '-01-01'
					res.collectDate = [moment(begin), moment(end)]
					return res
				} else {
					return false
				}
			}
			if(quarterId == 2) {
				let date4 = date + '-' + '04'
				let begin = moment(date4).startOf('month')//起始日期
				let end = moment(date4).endOf('month')//结束日期
				let list = []

				begin = `${begin.format('YYYY-MM-DD')} 00:00:00`
				end = `${end.format('YYYY-MM-DD')} 23:59:59`

				let params4 = {
					begin, end
				}
				if (this.component.props.authenticatedInvoice) {
					params.authenticatedInvoice = true;
				}
				const res4 = await this.component.props.collectOnOk(params4)
				if (res4 == undefined) {
					this.injections.reduce('loading', false);
					return false
				}
				if (res4.message == '生成单据成功' && res4.list && res4.list.length > 0) {
					for(var i = 0; i<res4.list.length;i++) {
						res4.list[i].month = '四月'
						list.push(res4.list[i])
					}
					res.invoice = res4.invoice
				}
				if (res4.message == '本次采集0条发票') {
					let total = {month: '四月',amountTotal:0,amountAndTaxTotal:0,authenticatedInvoice: false, isInit: true, beginLong: 0, endLong: 0, invoiceSum: 0, invoiceRedSum: 0,invoiceStateSum:0,invoiceSum:0,invoiceTypeName: "合计",invoicebuleSum: 0,isAuthenTemplate: 0,isInit: true,taxTotal: 0}
					list.push(total)
				}

				let date5 = date + '-' + '05'
				begin = moment(date5).startOf('month')//起始日期
				end = moment(date5).endOf('month')//结束日期

				begin = `${begin.format('YYYY-MM-DD')} 00:00:00`
				end = `${end.format('YYYY-MM-DD')} 23:59:59`

				let params5 = {
					begin, end
				}
				if (this.component.props.authenticatedInvoice) {
					params.authenticatedInvoice = true;
				}
				const res5 = await this.component.props.collectOnOk(params5)
				if (res5 == undefined) {
					this.injections.reduce('loading', false);
					return false
				}
				if (res5.message == '生成单据成功' && res5.list && res5.list.length > 0) {
					for(var i = 0; i<res5.list.length;i++) {
						res5.list[i].month = '五月'
						list.push(res5.list[i])
					}
					res.invoice = res5.invoice
				}
				if (res5.message == '本次采集0条发票') {
					let total = {month: '五月',amountTotal:0,amountAndTaxTotal:0,authenticatedInvoice: false, isInit: true, beginLong: 0, endLong: 0, invoiceSum: 0, invoiceRedSum: 0,invoiceStateSum:0,invoiceSum:0,invoiceTypeName: "合计",invoicebuleSum: 0,isAuthenTemplate: 0,isInit: true,taxTotal: 0}
					list.push(total)
				}
			

				let date6 = date + '-' + '06'
				begin = moment(date6).startOf('month')//起始日期
				end = moment(date6).endOf('month')//结束日期

				begin = `${begin.format('YYYY-MM-DD')} 00:00:00`
				end = `${end.format('YYYY-MM-DD')} 23:59:59`

				let params6 = {
					begin, end
				}
				if (this.component.props.authenticatedInvoice) {
					params.authenticatedInvoice = true;
				}
				const res6 = await this.component.props.collectOnOk(params6)
				if (res6 == undefined) {
					this.injections.reduce('loading', false);
					return false
				}
				if (res6.message == '生成单据成功' && res6.list && res6.list.length > 0) {
					for(var i = 0; i<res6.list.length;i++) {
						res6.list[i].month = '六月'
						list.push(res6.list[i])
					}
					res.invoice = res6.invoice
				}
				if (res6.message == '本次采集0条发票') {
					let total = {month: '六月',amountTotal:0,amountAndTaxTotal:0,authenticatedInvoice: false, isInit: true, beginLong: 0, endLong: 0, invoiceSum: 0, invoiceRedSum: 0,invoiceStateSum:0,invoiceSum:0,invoiceTypeName: "合计",invoicebuleSum: 0,isAuthenTemplate: 0,isInit: true,taxTotal: 0}
					list.push(total)
				}

				let allInvoiceSum = 0,allAmountTotal = 0,allAmountAndTaxTotal = 0,allTaxTotal = 0,invoicebuleSum = 0,invoiceRedSum = 0,invoiceStateSum = 0
				for(var i=0;i<list.length;i++){
					if(list[i].invoiceTypeName == '合计') {
						invoicebuleSum += list[i].invoicebuleSum
						invoiceRedSum += list[i].invoiceRedSum
						invoiceStateSum += list[i].invoiceStateSum
						allInvoiceSum += list[i].invoiceSum
						allTaxTotal += list[i].taxTotal
						allAmountTotal += list[i].amountTotal
						allAmountAndTaxTotal += list[i].amountAndTaxTotal
					}
				}
				
				let amountTotal= 0,amountAndTaxTotal = 0,taxTotal = 0,invoiceSum = 0
				let Newtotal = {month: '第二季度',
							amountTotal:allAmountTotal,
							amountAndTaxTotal:allAmountAndTaxTotal,
							taxTotal:allTaxTotal,
							invoiceSum:allInvoiceSum,
							invoiceStateSum:invoiceStateSum,
							invoiceRedSum:invoiceRedSum,
							invoicebuleSum:invoicebuleSum,
							authenticatedInvoice: false, 
							isInit: true, beginLong: 0, endLong: 0, invoiceTypeName: "合计",isAuthenTemplate: 0,isInit: true}
				list.push(Newtotal)

				res.list = list
				res.issuedByTax = issuedByTax
				this.injections.reduce('loading', false);
				if (res) {
					begin = date + '-04-01'
					res.collectDate = [moment(begin), moment(end)]
					return res
				} else {
					return false
				}
			}
			if(quarterId == 3) {
				let date7 = date + '-' + '07'
				let begin = moment(date7).startOf('month')//起始日期
				let end = moment(date7).endOf('month')//结束日期
				let list = []

				begin = `${begin.format('YYYY-MM-DD')} 00:00:00`
				end = `${end.format('YYYY-MM-DD')} 23:59:59`

				let params7 = {
					begin, end
				}
				if (this.component.props.authenticatedInvoice) {
					params.authenticatedInvoice = true;
				}
				const res7 = await this.component.props.collectOnOk(params7)
				if (res7 == undefined) {
					this.injections.reduce('loading', false);
					return false
				}
				if (res7.message == '生成单据成功' && res7.list && res7.list.length > 0) {
					for(var i = 0; i<res7.list.length;i++) {
						res7.list[i].month = '七月'
						list.push(res7.list[i])
					}
					res.invoice = res7.invoice
				}
				if (res7.message == '本次采集0条发票') {
					let total = {month: '七月',amountTotal:0,amountAndTaxTotal:0,authenticatedInvoice: false, isInit: true, beginLong: 0, endLong: 0, invoiceSum: 0, invoiceRedSum: 0,invoiceStateSum:0,invoiceSum:0,invoiceTypeName: "合计",invoicebuleSum: 0,isAuthenTemplate: 0,isInit: true,taxTotal: 0}
					list.push(total)
				}

				let date8 = date + '-' + '08'
				begin = moment(date8).startOf('month')//起始日期
				end = moment(date8).endOf('month')//结束日期

				begin = `${begin.format('YYYY-MM-DD')} 00:00:00`
				end = `${end.format('YYYY-MM-DD')} 23:59:59`

				let params8 = {
					begin, end
				}
				if (this.component.props.authenticatedInvoice) {
					params.authenticatedInvoice = true;
				}
				const res8 = await this.component.props.collectOnOk(params8)
				if (res8 == undefined) {
					this.injections.reduce('loading', false);
					return false
				}
				if (res8.message == '生成单据成功' && res8.list && res8.list.length > 0) {
					for(var i = 0; i<res8.list.length;i++) {
						res8.list[i].month = '八月'
						list.push(res8.list[i])
					}
					res.invoice = res8.invoice
				}
				if (res8.message == '本次采集0条发票') {
					let total = {month: '八月',amountTotal:0,amountAndTaxTotal:0,authenticatedInvoice: false, isInit: true, beginLong: 0, endLong: 0, invoiceSum: 0, invoiceRedSum: 0,invoiceStateSum:0,invoiceSum:0,invoiceTypeName: "合计",invoicebuleSum: 0,isAuthenTemplate: 0,isInit: true,taxTotal: 0}
					list.push(total)
				}
			

				let date9 = date + '-' + '09'
				begin = moment(date9).startOf('month')//起始日期
				end = moment(date9).endOf('month')//结束日期

				begin = `${begin.format('YYYY-MM-DD')} 00:00:00`
				end = `${end.format('YYYY-MM-DD')} 23:59:59`

				let params9 = {
					begin, end
				}
				if (this.component.props.authenticatedInvoice) {
					params.authenticatedInvoice = true;
				}
				const res9 = await this.component.props.collectOnOk(params9)
				if (res9 == undefined) {
					this.injections.reduce('loading', false);
					return false
				}
				if (res9.message == '生成单据成功' && res9.list && res9.list.length > 0) {
					for(var i = 0; i<res9.list.length;i++) {
						res9.list[i].month = '九月'
						list.push(res9.list[i])
					}
					res.invoice = res9.invoice
				}
				if (res9.message == '本次采集0条发票') {
					let total = {month: '九月',amountTotal:0,amountAndTaxTotal:0,authenticatedInvoice: false, isInit: true, beginLong: 0, endLong: 0, invoiceSum: 0, invoiceRedSum: 0,invoiceStateSum:0,invoiceSum:0,invoiceTypeName: "合计",invoicebuleSum: 0,isAuthenTemplate: 0,isInit: true,taxTotal: 0}
					list.push(total)
				}

				let allInvoiceSum = 0,allAmountTotal = 0,allAmountAndTaxTotal = 0,allTaxTotal = 0,invoicebuleSum = 0,invoiceRedSum = 0,invoiceStateSum = 0
				for(var i=0;i<list.length;i++){
					if(list[i].invoiceTypeName == '合计') {
						invoicebuleSum += list[i].invoicebuleSum
						invoiceRedSum += list[i].invoiceRedSum
						invoiceStateSum += list[i].invoiceStateSum
						allInvoiceSum += list[i].invoiceSum
						allTaxTotal += list[i].taxTotal
						allAmountTotal += list[i].amountTotal
						allAmountAndTaxTotal += list[i].amountAndTaxTotal
					}
				}
				
				let amountTotal= 0,amountAndTaxTotal = 0,taxTotal = 0,invoiceSum = 0
				let Newtotal = {month: '第三季度',
							amountTotal:allAmountTotal,
							amountAndTaxTotal:allAmountAndTaxTotal,
							taxTotal:allTaxTotal,
							invoiceSum:allInvoiceSum,
							invoiceStateSum:invoiceStateSum,
							invoiceRedSum:invoiceRedSum,
							invoicebuleSum:invoicebuleSum,
							authenticatedInvoice: false, 
							isInit: true, beginLong: 0, endLong: 0, invoiceTypeName: "合计",isAuthenTemplate: 0,isInit: true}
				list.push(Newtotal)

				res.list = list
				res.issuedByTax = issuedByTax
				this.injections.reduce('loading', false);
				if (res) {
					begin = date + '-07-01'
					res.collectDate = [moment(begin), moment(end)]
					return res
				} else {
					return false
				}
			}
			if(quarterId == 4) {
				let date10 = date + '-' + '10'
				let begin = moment(date10).startOf('month')//起始日期
				let end = moment(date10).endOf('month')//结束日期
				let list = []

				begin = `${begin.format('YYYY-MM-DD')} 00:00:00`
				end = `${end.format('YYYY-MM-DD')} 23:59:59`

				let params10 = {
					begin, end
				}
				if (this.component.props.authenticatedInvoice) {
					params.authenticatedInvoice = true;
				}
				const res10 = await this.component.props.collectOnOk(params10)
				if (res10 == undefined) {
					this.injections.reduce('loading', false);
					return false
				}
				if (res10.message == '生成单据成功' && res10.list && res10.list.length > 0) {
					for(var i = 0; i<res10.list.length;i++) {
						res10.list[i].month = '十月'
						list.push(res10.list[i])
					}
					res.invoice = res10.invoice
				}
				if (res10.message == '本次采集0条发票') {
					let total = {month: '十月',amountTotal:0,amountAndTaxTotal:0,authenticatedInvoice: false, isInit: true, beginLong: 0, endLong: 0, invoiceSum: 0, invoiceRedSum: 0,invoiceStateSum:0,invoiceSum:0,invoiceTypeName: "合计",invoicebuleSum: 0,isAuthenTemplate: 0,isInit: true,taxTotal: 0}
					list.push(total)
				}

				let date11 = date + '-' + '11'
				begin = moment(date11).startOf('month')//起始日期
				end = moment(date11).endOf('month')//结束日期

				begin = `${begin.format('YYYY-MM-DD')} 00:00:00`
				end = `${end.format('YYYY-MM-DD')} 23:59:59`

				let params11 = {
					begin, end
				}
				if (this.component.props.authenticatedInvoice) {
					params.authenticatedInvoice = true;
				}
				const res11 = await this.component.props.collectOnOk(params11)
				if (res11 == undefined) {
					this.injections.reduce('loading', false);
					return false
				}
				if (res11.message == '生成单据成功' && res11.list && res11.list.length > 0) {
					for(var i = 0; i<res11.list.length;i++) {
						res11.list[i].month = '十一月'
						list.push(res11.list[i])
					}
					res.invoice = res11.invoice
				}
				if (res11.message == '本次采集0条发票') {
					let total = {month: '十一月',amountTotal:0,amountAndTaxTotal:0,authenticatedInvoice: false, isInit: true, beginLong: 0, endLong: 0, invoiceSum: 0, invoiceRedSum: 0,invoiceStateSum:0,invoiceSum:0,invoiceTypeName: "合计",invoicebuleSum: 0,isAuthenTemplate: 0,isInit: true,taxTotal: 0}
					list.push(total)
				}
			

				let date12 = date + '-' + '12'
				begin = moment(date12).startOf('month')//起始日期
				end = moment(date12).endOf('month')//结束日期

				begin = `${begin.format('YYYY-MM-DD')} 00:00:00`
				end = `${end.format('YYYY-MM-DD')} 23:59:59`

				let params12 = {
					begin, end
				}
				if (this.component.props.authenticatedInvoice) {
					params.authenticatedInvoice = true;
				}
				const res12 = await this.component.props.collectOnOk(params12)
				if (res12 == undefined) {
					this.injections.reduce('loading', false);
					return false
				}
				if (res12.message == '生成单据成功' && res12.list && res12.list.length > 0) {
					for(var i = 0; i<res12.list.length;i++) {
						res12.list[i].month = '十二月'
						list.push(res12.list[i])
					}
					res.invoice = res12.invoice
				}
				if (res12.message == '本次采集0条发票') {
					let total = {month: '十二月',amountTotal:0,amountAndTaxTotal:0,authenticatedInvoice: false, isInit: true, beginLong: 0, endLong: 0, invoiceSum: 0, invoiceRedSum: 0,invoiceStateSum:0,invoiceSum:0,invoiceTypeName: "合计",invoicebuleSum: 0,isAuthenTemplate: 0,isInit: true,taxTotal: 0}
					list.push(total)
				}

				let allInvoiceSum = 0,allAmountTotal = 0,allAmountAndTaxTotal = 0,allTaxTotal = 0,invoicebuleSum = 0,invoiceRedSum = 0,invoiceStateSum = 0
				for(var i=0;i<list.length;i++){
					if(list[i].invoiceTypeName == '合计') {
						invoicebuleSum += list[i].invoicebuleSum
						invoiceRedSum += list[i].invoiceRedSum
						invoiceStateSum += list[i].invoiceStateSum
						allInvoiceSum += list[i].invoiceSum
						allTaxTotal += list[i].taxTotal
						allAmountTotal += list[i].amountTotal
						allAmountAndTaxTotal += list[i].amountAndTaxTotal
					}
				}
				
				let amountTotal= 0,amountAndTaxTotal = 0,taxTotal = 0,invoiceSum = 0
				let Newtotal = {month: '第四季度',
							amountTotal:allAmountTotal,
							amountAndTaxTotal:allAmountAndTaxTotal,
							taxTotal:allTaxTotal,
							invoiceSum:allInvoiceSum,
							invoiceStateSum:invoiceStateSum,
							invoiceRedSum:invoiceRedSum,
							invoicebuleSum:invoicebuleSum,
							authenticatedInvoice: false, 
							isInit: true, beginLong: 0, endLong: 0, invoiceTypeName: "合计",isAuthenTemplate: 0,isInit: true}
				list.push(Newtotal)

				res.list = list
				res.issuedByTax = issuedByTax
				this.injections.reduce('loading', false);
				if (res) {
					begin = date + '-10-01'
					res.collectDate = [moment(begin), moment(end)]
					return res
				} else {
					return false
				}
			}
		}else {
			let date = data.date.format('YYYY-MM');//当前月份
			let begin = moment(date).startOf('month')//起始日期
			let end = moment(date).endOf('month')//结束日期

			begin = `${begin.format('YYYY-MM-DD')} 00:00:00`
			end = `${end.format('YYYY-MM-DD')} 23:59:59`
			let params = {
				begin, end
			}
			if (this.component.props.authenticatedInvoice) {
				params.authenticatedInvoice = true;
			}
			const res = await this.component.props.collectOnOk(params)

			this.injections.reduce('loading', false);
			if(!res){
				return false
			}
			res.issuedByTax = issuedByTax
			//console.log(res, '1')
			if (res) {
				res.collectDate = [moment(begin), moment(end)]
				return res
				//	return this.component.props.closeModal(res);
			} else {
				//this.metaAction.toast('error', res.message)
				return false
			}
		}	
	}

	fieldChange = (value) => {
		this.metaAction.sf('data.form.quarterId', value)
	}
	
	fieldChangeYear = (value) => {
		this.metaAction.sf('data.year', value)
	}

	disabledRangePicker = (currentDate) => {
		if (this.component.props.authenticatedInvoice) return false;
		let enableddate = this.metaAction.gf('data.enableddate'),
			enableddateEnd = this.metaAction.gf('data.enableddateEnd'),
			enableddateStart = this.metaAction.gf('data.enableddateStart')
		if (enableddateStart && enableddateEnd) {
			return currentDate && (currentDate.format('YYYYMM') < enableddateStart.format('YYYYMM') || currentDate.format('YYYYMM') > enableddateEnd.format('YYYYMM'))
		}
		return currentDate.format('YYYYMM') < enableddate.format('YYYYMM')
		//|| currentDate.format('YYYYMM') > moment().format('YYYYMM')
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