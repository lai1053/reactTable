import moment from 'moment'
import { consts } from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-tplus-batch-get-current-account',
		children: {
			name: 'load',
			component: 'Spin',
			tip: '数据处理中...',
			spinning: '{{data.other.loading}}',
			children: [
				{
					name: 'form',
					component: 'Form',
					className: 'ttk-tplus-batch-get-current-account-form',
					children: [
						{
							name: 'preClass',
							component: 'Form.Item',
							labelCol: {
								span: 5
							},
							wrapperCol: {
								span: 50
							},
							label: '上级科目',
							required: true,
							// validateStatus: "{{data.other.error.assetClass? (data.other.assetClassTip? 'success':'error'):'success'}}",
							// help: '{{ !data.other.assetClassTip ? data.other.error.assetClass: ""}}',
							children: {
								name: 'accountClass',
								component: 'Select',
								showSearch: true,
								allowClear: false,
								value: '{{data.form.accountCode}}',
								filterOption: '{{$filterOptionName}}',
								onChange: '{{function(v){$handleChange(v, _rowIndex)}}}',
								children: {
									name: 'option',
									component: 'Select.Option',
									// value: '{{data.other.account && data.other.type == "incomeAccount" ? data.other.account[_lastIndex].accountCode :data.other.account[_lastIndex].code}}',
									value: '{{data.other.account && data.other.account[_lastIndex].code}}',
									children: '{{data.other.account && data.other.account[_lastIndex].name}}',
									_power: 'for in data.other.account'
								},
								// value: '{{data.form.assetClass && data.form.assetClass.id}}',
								// onChange: '{{$assetClass()}}',
								// children: {
								// 	name: 'option',
								// 	component: 'Select.Option',
								// 	value: "{{data.other.assetClass &&data.other.assetClass[_rowIndex].id}}",
								// 	title: "{{data.other.assetClass &&data.other.assetClass[_rowIndex].name}}",
								// 	children: '{{data.other.assetClass && data.other.assetClass[_rowIndex].name}}',
								// 	_power: 'for in data.other.assetClass'
								// }
							}
						},{
							name: 'account',
							component: 'Form.Item',
							_visible: '{{data.other.type == "incomeAccount"}}',
							labelCol: {
								span: 5
							},
							wrapperCol: {
								span: 25
							},
							label: '科目名称',
							children: {
								name: 'radio',
								component: 'Radio.Group',
								onChange:'{{function(v){return $handleAccountChange(v)}}}',
								value:'{{data.other.accountName}}',
								className: 'radio',
								children: [{
									name: 'radio1',
									component: 'Radio',
									value:'accountName',
									children: '存货名称'
								},/*{
									name: 'radio2',
									component: 'Radio',
									value:'accountNameModel',
									children: '存货名称+规格型号'
								}*/]
							}
						},{
							name: 'enable',
							component: 'Form.Item',
							_visible: '{{data.other.type == "inventoryAccount"}}',
							labelCol: {
								span: 5
							},
							wrapperCol: {
								span: 25
							},
							label: '数量核算',
							children: {
								name: 'check',
								component: 'Checkbox',
								onChange:'{{function(v){return $handleCheckChange(v)}}}',
								children: '启用'
							}
						}
					]
				},
				{
					name: 'tip',
					component: '::div',
					// children: '注：按上级科目自动生成下级科目，科目名称为存货名称'
					className: 'ttk-tplus-batch-get-current-account-tip',
					_visible: '{{data.other.type == "inventoryAccount"}}',
					children:[{
						name: 'left',
						component: '::div',
						children: '注：'
					},{
						name: 'right',
						component: '::div',
						children: [{
							name: 'top',
							component: '::div',
							children: "1、按上级科目自动生成下级科目，科目名称为存货名称"
						},{
							name: 'bot',
							component: '::div',
							children: '2、启用数量核算后，自动生成计量单位'
						}]
					}]
				},
				{
					name: 'tip1',
					component: '::div',
					_visible: '{{data.other.type != "inventoryAccount"}}',
					children: '{{data.other.accountName == "accountNameModel" && data.other.type == "incomeAccount" ? `注：按上级科目自动生成下级科目，科目名称为存货名称+规格型号`:`注：按上级科目自动生成下级科目，科目名称为`+data.other.docName+`名称`}}',
					className: 'ttk-tplus-batch-get-current-account-tip1',
				}
			]
		}
	}
}

export function getInitState() {
	return {
		data: {
			form: {
				accountCode: '',
				isCalcQuantity: false
			},
			other: {
				error: {},
				loading: false,
				account: [],
				type: '',
				// accountName: 'accountNameModel',
				accountName: 'accountName',
				selectObj: {},
				docName:'存货'
			},
			error: {}
		}
	}
}
