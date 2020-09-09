import moment from 'moment'
import { consts } from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-tplus-consumer-card',
		children: {
			name: 'load',
			component: 'Spin',
			tip: '数据处理中...',
			spinning: '{{data.other.loading}}',
			children: {
				name: 'form',
				component: 'Form',
				className: 'ttk-tplus-consumer-card-form',
				children: [{
					name: 'top',
					component: '::div',
					className: 'ttk-tplus-consumer-card-form-top',
					children: [
						{
							name: 'codeItem',
							component: 'Form.Item',
							label: '往来单位编码',
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
							label: '往来单位名称',
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
							name: 'consumer',
							component: 'Form.Item',
							label: '往来单位分类',
							//validateStatus: "{{data.form.consumerIdErr == false ? 'error' : 'success'}}",
							//required: true,
							children: [{
								name: 'select',
								component: 'Select',
								allowClear:true,
								value: '{{data.form.consumerId}}',
								onChange: `{{function(v){$fieldChange('data.form.consumerId',v)}}}`,
								children: {
									name: 'option',
									component: 'Select.Option',
									value: '{{data.other.consumer && data.other.consumer[_rowIndex].code}}',
									children: '{{data.other.consumer && data.other.consumer[_rowIndex].name}}',
									_power: 'for in data.other.consumer'
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
			},
			error: {}
		}
	}
}
