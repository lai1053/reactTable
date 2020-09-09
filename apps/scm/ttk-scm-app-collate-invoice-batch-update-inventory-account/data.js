import moment from 'moment'
import { consts } from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-collate-invoice-batch-update-inventory-account',
		children: {
			name: 'load',
			component: 'Spin',
			tip: '数据处理中...',
			spinning: '{{data.other.loading}}',
			children: [
				{
					name: 'form',
					component: 'Form',
					className: 'ttk-scm-app-collate-invoice-batch-update-inventory-account-form',
					children: [
						{
							name: 'preClass',
							component: 'Form.Item',
							labelCol: {
								span: 8
							},
							wrapperCol: {
								span: 5
							},
							label: '存货科目',
							required: true,
							validateStatus: "{{data.other.error.inventoryAccount? 'error':'success'}}",
							help: '{{data.other.error.inventoryAccount? data.other.error.inventoryAccount: ""}}',
							children: {
								name: 'assetClass',
								component: 'Select',
								showSearch: true,
								filterOption: '{{$filterOption}}',
								value: '{{data.form.inventoryAccount && data.form.inventoryAccount}}',
								onChange: '{{function(v){return $handleInventoryAccount(v)}}}',
								dropdownStyle: { width: '325px' },
								dropdownClassName: 'dropdownClassStyleLiPiao',
								dropdownFooter: {
									name: 'add',
									type: 'primary',
									component: 'Button',
									style: { width: '100%', borderRadius: '0' },
									children: '新增',
									onClick: '{{$batchAddInventoryAccount}}'
								},
								children:'{{$renderAccountSelectOption("account")}}',
							}
						}
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
				inventoryAccount: '',
				accountName: '',
				isCalcQuantity: false,
				unitDto: {
					name: ''
				}
			},
			other: {
				error: {},
				loading: false,
				account: []
			},
			error: {}
		}
	}
}
