export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-proof-of-charge-common-add',
		children: [{
			name: 'code',
			component: 'Form.Item',
			label: '编码',
			required: true,
			validateStatus: "{{data.other.error.code?'error':'success'}}",
			help: '{{data.other.error.code}}',
			children: [{
				name: 'code',
				component: 'Input',
				style: { width: 200 },
				value: '{{data.form.code}}',
				onChange: `{{function(e){$setField('data.form.code',e.target.value)}}}`,
			}]
		},{
			name: 'name',
			component: 'Form.Item',
			label: '名称',
			required: true,
			validateStatus: "{{data.other.error.name?'error':'success'}}",
			help: '{{data.other.error.name}}',
			children: [{
				name: 'name',
				component: 'Input',
				style: { width: 200 },
				value: '{{data.form.name}}',
				onChange: `{{function(e){$setField('data.form.name',e.target.value)}}}`,
			}]
		},{
			name: 'price',
			component: 'Form.Item',
			className: 'check',
			_visible: '{{data.form.isDisplayCheckBox}}',
			children: [{
				name: 'isSaveAmount',
				component: 'Checkbox',
				onClick: `{{function(v){$setField('data.form.isSaveAmount', v.target.checked)}}}`,
				children: '保存金额'
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			form: {
				code: '',
				name: '',
				isSaveAmount: false
			},
			other: {
				error: {}
			}
		}
	}
}
