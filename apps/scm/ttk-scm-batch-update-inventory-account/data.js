import moment from 'moment'
import { consts } from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-batch-update-inventory-account',
		children: [
			{
				name: 'inventory',
				component: 'Form.Item',
				label: '存货名称',
				className: 'name',
				children: [{
					name: 'inventory',
					component: 'Select',
					value: '{{data.form.name}}',
					filterOption: '{{$filterOption}}',
					showSearch: true,
					allowClear: true,
					dropdownClassName: 'celldropdown',
					onChange: `{{function(v){$fieldChange('data.form.inventoryId',data.other.inventory.filter(function(o){return o.id == v})[0])}}}`,
					children: {
						name: 'option',
						component: 'Select.Option',
						value: '{{data.other.inventory && data.other.inventory[_rowIndex].id}}',
						children: '{{data.other.inventory && data.other.inventory[_rowIndex].fullName}}',
						_power: 'for in data.other.inventory'
					},
					dropdownFooter: {
						name: 'add',
						type: 'primary',
						component: 'Button',
						style: { width: '100%', borderRadius: '0' },
						children: '新增',
						onClick: '{{function(){$addRecordClick()}}}'
					},
				}]
			},
			{
				name: 'account',
				component: 'Form.Item',
				label: '存货对应科目',
				className: 'account',
				children: [{
					name: 'account',
					component: 'Select',
					value: '{{data.form.inventoryRelatedAccountName}}',
					filterOption: '{{$filterOption}}',
					showSearch: true,
					allowClear: false,
					dropdownClassName: 'celldropdown',
					onChange: `{{function(v){$fieldChange('data.form.inventoryRelatedAccountName',data.other.account.filter(function(o){return o.id == v})[0])}}}`,
					children: {
						name: 'option',
						component: 'Select.Option',
						value: '{{data.other.account && data.other.account[_rowIndex].id}}',
						children: '{{data.other.account && data.other.account[_rowIndex].codeAndName}}',
						_power: 'for in data.other.account'
					},
					dropdownFooter: {
						name: 'add',
						type: 'primary',
						component: 'Button',
						style: { width: '100%', borderRadius: '0' },
						children: '新增',
						onClick: '{{function(){$addSubjects()}}}'
					},
				}]
			}
		]

	}
}

export function getInitState() {
	return {
		data: {
			form: {},
			other: {

			},

		}
	}
}
