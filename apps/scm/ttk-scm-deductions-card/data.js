import moment from 'moment'
import { consts } from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-deductions-card',
		children: {
			name: 'load',
			component: 'Spin',
			tip: '数据处理中...',
			spinning: '{{data.other.loading}}',
			children: {
				name: 'form',
				component: 'Form',
				className: 'ttk-scm-deductions-card-form',
				children: [{
					name: 'top',
					component: '::div',
					className: 'ttk-scm-deductions-card-form-top',
					children: [
						{
							name: 'codeItem',
							component: 'Form.Item',
							label: '扣除额',
							required: true,
							validateStatus: "{{data.codeErr == false ? 'error' : 'success'}}",
							children: [{
								name: 'code',
								component: 'Input.Number',
								value: '{{data.money}}',
								onBlur: "{{function(e){$fieldChange(e)}}}",								
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
			error: {},
			money: ''
		}
	}
}
