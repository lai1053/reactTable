import moment from 'moment'
import { consts } from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-tplus-department-card',
		children: {
			name: 'load',
			component: 'Spin',
			tip: '数据处理中...',
			spinning: '{{data.other.loading}}',
			children: {
				name: 'form',
				component: 'Form',
				className: 'ttk-tplus-department-card-form',
				children: [{
					name: 'top',
					component: '::div',
					className: 'ttk-tplus-department-card-form-top',
					children: [
						{
							name: 'codeItem',
							component: 'Form.Item',
							label: '部门编码',
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
							label: '部门名称',
							required: true,
							validateStatus: "{{data.form.nameErr == false ? 'error' : 'success'}}",
							help: '{{data.other.error.name}}',
							children: [{
								name: 'name',
								component: 'Input',
								maxlength: '200',
								value: '{{data.form.name}}',
								onChange: `{{function(e){$fieldChange('data.form.name',e.target.value);}}}`,
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
