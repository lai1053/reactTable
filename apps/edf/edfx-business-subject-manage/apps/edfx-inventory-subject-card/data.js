import moment from 'moment'
import { consts } from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'edfx-inventory-subject-card',
		children: {
			name: 'load',
			component: 'Spin',
			tip: '数据处理中...',
			spinning: '{{data.other.loading}}',
			children: {
				name: 'form',
				component: 'Form',
				className: 'edfx-inventory-subject-card-form',
				children: [{
					name: 'top',
					component: '::div',
					className: 'edfx-inventory-subject-card-form-top',
					children: [
						{
							name: 'parentRevenueAccount',
							component: 'Form.Item',
							label: '上级科目',
							required: true,
							validateStatus: "{{!data.redBorder ? 'success' : 'error'}}",
							children: [{
								name: 'select',
								component: 'Select',
								allowClear:true,
								className: 'autoFocus_item',
								value: '{{data.form.parentRevenueAccount}}',
								filterOption: '{{$filterOption}}',
								onChange: `{{function(v){$fieldChange('data.form.parentRevenueAccount',v)}}}`,
								children: {
									name: 'option',
									component: 'Select.Option',
									value: '{{data.other.parentRevenueAccounts && data.other.parentRevenueAccounts[_rowIndex].id}}',
									children: '{{data.other.parentRevenueAccounts && data.other.parentRevenueAccounts[_rowIndex].codeAndName}}',
									_power: 'for in data.other.parentRevenueAccounts'
								},
								dropdownFooter: {
									name: 'add',
									component: 'Button',
									type: 'primary',
									style: { width: '100%', borderRadius: '0' },
									children: '新增',
									onClick: "{{function(){$addArchive()}}}"
								},
							}]
						},
						{
							name: 'checkbox',
							component: 'Checkbox',
							checked: '{{data.form.isCalcQuantity}}',
							className: 'edfx-inventory-subject-check1',
							children: '明细科目自动启用数量核算',
							onChange: `{{function(){$handleCheckboxChange()}}}`,
						},
						{
							name: 'div1',
							component: '::div',				
							className: 'edfx-inventory-subject-div1',
							children: '（1）选择上级科目后，点击确定会按照存货名称自动生成上级科目下的末级科目',
						},
						{
							name: 'div2',
							component: '::div',				
							className: 'edfx-inventory-subject-div2',
							children: '（2）如果上级科目有余额时，余额会自动转到第一个末级科目，原凭证上对应的上级科目也会更新为第一个末级科目',
						},
					]
				}]
			}
		}
	}
}

export function getInitState() {
	return {
		data: {
			form: {
				stockAccountSetInvoking : true,
				isCalcQuantity : true,
			},
			other: {
				error: {},
				loading: false,
			},
			error: {}
		}
	}
}
