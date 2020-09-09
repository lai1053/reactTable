import moment from 'moment'
import { consts } from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-tplus-account-card',
		children: {
			name: 'load',
			component: 'Spin',
			tip: '数据处理中...',
			spinning: '{{data.other.loading}}',
			children: [
				{
					name: 'form',
					component: 'Form',
					className: 'ttk-tplus-account-card-form',
					children: [
						{
							name: 'preClass',
							component: 'Form.Item',
							labelCol: {
								span: 5
							},
							wrapperCol: {
								span: 19
							},
							label: '上级科目',
							required: true,
							validateStatus: "{{data.other.error.topAccount? 'error':'success'}}",
							// help: '{{data.other.error.topAccount? data.other.error.topAccount: ""}}',
							children: {
								name: 'assetClass',
								component: 'Select',
								// showSearch: false,
								value: '{{data.form.topAccount && data.form.topAccount}}',
								onChange: '{{function(v){return $handleTopAccount(v)}}}',
								filterOption:'{{$filterOption}}',
								children: {
									name: 'option',
									component: 'Select.Option',
									value: "{{data.other.account &&data.other.account[_rowIndex].code}}",
									title: "{{data.other.account &&data.other.account[_rowIndex].name}}",
									children: '{{data.other.account && data.other.account[_rowIndex].name}}',
									_power: 'for in data.other.account'
								}
							}
						},
						{
							name: 'accountName',
							component: 'Form.Item',
							labelCol: {
								span: 5
							},
							wrapperCol: {
								span: 19
							},
							label: '科目名称',
							required: true,
							validateStatus: "{{data.other.error.accountName? 'error': 'success'}}",
							// help: '{{data.other.error.accountName ? data.other.error.accountName: ""}}',
							children: {
								name: 'assetClass',
								component: 'Input',
								showSearch: false,
								maxLength: '50',
								value: '{{data.form.accountName && data.form.accountName}}',
								onBlur: '{{function(e){return $handleChangeInput(e.target.value, "accountName")}}}',
							}
						},
						{
							name: 'num',
							component: 'Form.Item',
							labelCol: {
								span: 5
							},
							className: '{{data.form.isCalcQuantity ? "num" : ""}}',
							label: '数量核算',
							children:[{
								name: 'check',
								component: 'Checkbox',
								onChange:'{{function(v){return $handleCheckChange(v)}}}',
								children: '启用'
							}] 
						},
						{
							name: 'unit',
							component: 'Form.Item',
							label: '计量单位',
							className: 'unit',
							// required: true,
							validateStatus: "{{data.other.error.unitDto? 'error': 'success'}}",
							_visible:'{{data.form.isCalcQuantity}}',
							// help: '{{data.other.error.unitDto ? data.other.error.unitDto: ""}}',
							children: {
								name: 'assetClass',
								component: 'Input',
								showSearch: false,
								maxLength: '50',
								value: '{{data.form.unitDto && data.form.unitDto.name}}',
								onBlur: '{{function(e){return $handleChangeInput(e.target.value, "unitDto")}}}',
							}
						},
					]
				}
			]
		}
	}
}

export function getInitState() {
	return {
		data: {
			form: {
				topAccount: '',
				accountName: '',
				isCalcQuantity: false,
				unitDto:{
					name: ''
				}
			},
			other: {
				error: {},
				loading: false,
				account:[]
			},
			error: {}
		}
	}
}
