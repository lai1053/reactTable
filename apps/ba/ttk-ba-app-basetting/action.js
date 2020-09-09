import React from 'react'
import { Map, fromJS, toJS, is } from 'immutable'
import { action as MetaAction, AppLoader } from 'edf-meta-engine'
import config from './config'
import isEquall from 'lodash.isequal'
import { fetch, number, history } from 'edf-utils'

class action {
	constructor(option) {
		this.metaAction = option.metaAction
		this.extendAction = option.extendAction
		this.config = config.current
		this.webapi = this.config.webapi
		this.voucherAction = option.voucherAction
	}

	onInit = ({ component, injections }) => {
		this.component = component
		this.injections = injections
		injections.reduce('init')
		this.load()
		// 再次进入 refresh
		let addEventListener = this.component.props.addEventListener;
		if (addEventListener) {
			addEventListener('onTabFocus', :: this.load);
		}
	}

	//初始化接口调用
	load = async (initData) => {
		let param = {}
		let accountEnableDto = {}
		accountEnableDto.entranceFlag = 'system'
		param.accountEnableDto = accountEnableDto

		let res = await this.webapi.dateCard.queryAccountEnable(param)
		let customer = await this.webapi.dateCard.queryAccountByNameAutomatic(["应收账款", "预收账款"])
		let supplier = await this.webapi.dateCard.queryAccountByNameAutomatic(["应付账款", "预付账款", "其他应收款", "其他应付款"])

		this.metaAction.sfs({
			'data.other.customer': fromJS(customer),
			'data.other.supplier': fromJS(supplier),
		})


		if (res) this.injections.reduce('load', res)
		if (this.metaAction.context.get("currentOrg").accountingStandards == 2000020002) {
			let newrevenueAccountClass = [{
				value: 1,
				label: '是（例：500101 主营业务收入-销售收入）'
			}, {
				value: 0,
				label: '否'
			}]
			let newsaleAccountClass = [{
				value: 1,
				label: '是（例：540101 主营业务成本-销售成本）'
			}, {
				value: 0,
				label: '否'
			}]
			this.metaAction.sfs({
				'data.other.revenueAccountClass': newrevenueAccountClass,
				'data.other.saleAccountClass': newsaleAccountClass
			})
		}
	}

	settlementChange = (name, v) => {
		if (v.target.checked) {
			if (name == 'data.form.customer') {
				this.metaAction.sfs({
					'data.achivalRuleDto.accountSet': 1,
					'data.other.accountSetVisible': false
				})
			} else if (name == 'data.form.supplier') {
				this.metaAction.sfs({
					'data.achivalRuleDto.supplierAccountSet': 1,
					'data.other.supplierAccountSetVisible': false
				})
			}
		} else {
			if (name == 'data.form.customer') {
				this.metaAction.sf('data.achivalRuleDto.accountSet', 0)
				this.metaAction.sfs({
					'data.achivalRuleDto.accountSet': 0,
					'data.other.accountSetVisible': true,
					'data.achivalRuleDto.customerUpperAccount': null
				})
			} else if (name == 'data.form.supplier') {
				this.metaAction.sfs({
					'data.achivalRuleDto.supplierAccountSet': 0,
					'data.other.supplierAccountSetVisible': true,
					'data.achivalRuleDto.supplierUpperAccount': null
				})
			}
			this.fieldChange()
		}
	}

	fieldChange = async (name, value) => {
		if (value == undefined) value = null
		if (name == 'data.form.customer') {
			this.metaAction.sf('data.achivalRuleDto.customerUpperAccount', value)
			if (value == null) {
				this.metaAction.sf('data.other.accountSetVisible', true)
				this.metaAction.sf('data.achivalRuleDto.accountSet', 0)
			}
		} else if (name == 'data.form.supplier') {
			this.metaAction.sf('data.achivalRuleDto.supplierUpperAccount', value)
			if (value == null) {
				this.metaAction.sf('data.other.supplierAccountSetVisible', true)
				this.metaAction.sf('data.achivalRuleDto.supplierAccountSet', 0)
			}
		}

		let form = this.metaAction.gf('data.form').toJS()
		let achivalRuleDto = this.metaAction.gf('data.achivalRuleDto').toJS()

		let param = {}
		let accountEnableDto = {}
		accountEnableDto = form
		param.accountEnableDto = accountEnableDto
		param.achivalRuleDto = achivalRuleDto

		let create = await this.webapi.dateCard.create(param)
		if (create) {
			this.metaAction.sf('data.form.id', create.accountEnableDto.id)
			this.metaAction.sf('data.achivalRuleDto.id', create.achivalRuleDto.id)
		}
	}

	checkBoxChange = async (path, v) => {
		this.metaAction.sf(path, v)

		if (path == 'data.form.currentAccount' && v == 1) {
			this.metaAction.sf('data.other.flag', true)
		} else if (path == 'data.form.currentAccount' && v == 0) {
			this.metaAction.sf('data.other.flag', false)
			this.metaAction.sfs({
				'data.achivalRuleDto.supplierAccountSet': 0,
				'data.other.supplierAccountSetVisible': true,
				'data.achivalRuleDto.supplierUpperAccount': null,
				'data.achivalRuleDto.accountSet': 0,
				'data.other.accountSetVisible': true,
				'data.achivalRuleDto.customerUpperAccount': null
			})
		}

		let form = this.metaAction.gf('data.form').toJS()
		let achivalRuleDto = this.metaAction.gf('data.achivalRuleDto').toJS()

		let param = {}
		let accountEnableDto = {}
		accountEnableDto = form
		param.accountEnableDto = accountEnableDto
		param.achivalRuleDto = achivalRuleDto

		let create = await this.webapi.dateCard.create(param)
		if (create) {
			this.metaAction.sf('data.form.id', create.accountEnableDto.id)
			this.metaAction.sf('data.achivalRuleDto.id', create.achivalRuleDto.id)
		}
		let obj = {
			'data.form.currentAccount': '往来科目',
			'data.form.inventoryAccount': '存货科目',
			'data.form.revenueAccount': '收入科目',
			'data.form.saleAccount': '销售成本科目'
		}
		if (obj[path]) {
			let content = v ? `适合${obj[path]}启用二级及以上明细科目的场景` : `适合${obj[path]}启用一级或者${obj[path]}启用辅助核算的场景`
			this.metaAction.modal('warning', {
				content: content,
				title: '温馨提示',
				//wrapClassName: 'tranreport-generate-modal-bg',
				//className: 'tranreport-generate-modal',
				okText: '知道了'
			}
			)
		}
		// if (path == 'data.form.currentAccount') {
		// 	let content = v ? '适合往来科目启用二级及以上明细科目的场景' : '适合往来科目启用一级或者往来科目启用辅助核算的场景'
		// 	this.metaAction.modal('warning', {
		// 		content: content,
		// 		title: '温馨提示',
		// 		//wrapClassName: 'tranreport-generate-modal-bg',
		// 		//className: 'tranreport-generate-modal',
		// 		okText: '知道了'
		// 	}
		// 	)
		// }
	}

	updateBatchByparamKey = async (paramKey, paramValue) => {
		let content;
		if (paramKey == 'CertificationGeneration_InventoryAccount') {
			content = '修改选项以后，将影响存货档案，进项发票生成凭证，存货模块生成凭证等规则，是否确认修改'
		} else if (paramKey == 'CertificationGeneration_SalesCostAccount') {
			content = '修改选项以后，将影响存货档案，进项发票，销售出库单和成本调整单生成凭证，是否确定修改'
		}
		const ret = await this.metaAction.modal('confirm', {
			width: 420,
			content: content
		});
		if (ret) {
			let data = this.metaAction.gf('data').toJS()
			let params = [
				{
					"paramKey": paramKey,
					"paramValue": paramValue
				}
			];
			let res = await this.webapi.basetting.updateBatchByparamKey(params)
			if (res) {
				this.injections.reduce('updateBatchByparamKey', params[0])
				this.metaAction.toast('success', '保存成功');
			}

		}
	}
}

export default function creator(option) {
	const metaAction = new MetaAction(option),
		o = new action({ ...option, metaAction }),
		ret = { ...metaAction, ...o }
	metaAction.config({ metaHandlers: ret })
	return ret
}
