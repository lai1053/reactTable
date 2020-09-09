import moment from 'moment'
import { consts } from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-tplus-inventory-card',
		children: {
			name: 'load',
			component: 'Spin',
			tip: '数据处理中...',
			spinning: '{{data.other.loading}}',
			children: {
				name: 'form',
				component: 'Form',
				className: 'ttk-tplus-inventory-card-form',
				children: [{
					name: 'top',
					component: '::div',
					className: 'ttk-tplus-inventory-card-form-top',
					children: [
						{
							name: 'codeItem',
							component: 'Form.Item',
							label: '存货编码',
							required: true,
							validateStatus: "{{data.form.codeErr == false ? 'error' : 'success'}}",
							children: [{
								name: 'code',
								component: 'Input',
								value: '{{data.form.code}}',
								onChange: "{{function(e){$fieldChange('data.form.code',e.target.value);}}}"
							}]
						},
						{
							name: 'nameItem',
							component: 'Form.Item',
							label: '存货名称',
							required: true,
							help: '{{data.other.error.name}}',
							validateStatus: "{{data.form.nameErr == false ? 'error' : 'success'}}",
							children: [{
								name: 'name',
								component: 'Input',
								maxlength: '200',
								value: '{{data.form.name}}',
								onChange: `{{function(e){$fieldChange('data.form.name',e.target.value);}}}`,
							}]
						},
						{
							name: 'inventory',
							component: 'Form.Item',
							label: '存货分类',
							//validateStatus: "{{data.form.inventoryIdErr == false ? 'error' : 'success'}}",
							//required: false,
							children: [{
								name: 'select',
								component: 'Select',
								allowClear:true,
								value: '{{data.form.inventoryId}}',
								onChange: `{{function(v){$fieldChange('data.form.inventoryId',v)}}}`,
								children: {
									name: 'option',
									component: 'Select.Option',
									value: '{{data.other.inventory && data.other.inventory[_rowIndex].code}}',
									children: '{{data.other.inventory && data.other.inventory[_rowIndex].name}}',
									_power: 'for in data.other.inventory'
								}
							}]
						},
						{
							name: 'unit',
							component: 'Form.Item',
							label: '计量单位',
							validateStatus: "{{data.form.unitIdErr == false ? 'error' : 'success'}}",
							required: true,
							children: [{
								name: 'select',
								component: 'Select',
								value: '{{data.form.unitId}}',
								onChange: `{{function(v){$fieldChange('data.form.unitId',v)}}}`,
								children: {
									name: 'option',
									component: 'Select.Option',
									value: '{{data.other.unit && data.other.unit[_rowIndex].code}}',
									children: '{{data.other.unit && data.other.unit[_rowIndex].name}}',
									_power: 'for in data.other.unit'
								}
							}]
						}
					]
				}
				]
			}
		}
	}
}

export function getInitState() {
	return {
		data: {
			form: {},
			other: {
				error: {},
				loading: false,
				unit:[]
			},
			error: {}
		}
	}
}
