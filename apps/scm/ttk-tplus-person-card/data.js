import moment from 'moment'
import { consts } from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-tplus-person-card',
		children: {
			name: 'load',
			component: 'Spin',
			tip: '数据处理中...',
			spinning: '{{data.other.loading}}',
			children: {
				name: 'form',
				component: 'Form',
				className: 'ttk-tplus-person-card-form',
				children: [{
					name: 'top',
					component: '::div',
					className: 'ttk-tplus-person-card-form-top',
					children: [
						{
							name: 'codeItem',
							component: 'Form.Item',
							label: '人员编码',
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
							label: '人员名称',
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
							name: 'person',
							component: 'Form.Item',
							label: '所属部门',
							validateStatus: "{{data.form.personIdErr == false ? 'error' : 'success'}}",
							required: true,
							children: [{
								name: 'select',
								component: 'Select',
								value: '{{data.form.personId}}',
								onChange: `{{function(v){$fieldChange('data.form.personId',v)}}}`,
								children: {
									name: 'option',
									component: 'Select.Option',
									value: '{{data.other.person && data.other.person[_rowIndex].code}}',
									children: '{{data.other.person && data.other.person[_rowIndex].name}}',
									_power: 'for in data.other.person'
								}
							}]
						}
					]
				},
					// {
					// 	name: 'footer',
					// 	component: '::div',
					// 	className: 'footer',
					// 	children: [{
					// 		name: 'btnGroup',
					// 		component: '::div',
					// 		className: 'btnGroup',
					// 		children: [{
					// 			name: 'cancel',
					// 			component: 'Button',
					// 			className: 'btnGroup-item',
					// 			children: '取消',
					// 			onClick: '{{$onCancel}}'
					// 		}, {
					// 			name: 'confirm',
					// 			component: 'Button',
					// 			className: 'btnGroup-item',
					// 			type: "primary",
					// 			children: "保存",
					// 			onClick: "{{function(e){$onOk('save')}}}"
					// 		}]
					// 	}]
					// }
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
				person:[]
			},
			error: {}
		}
	}
}
