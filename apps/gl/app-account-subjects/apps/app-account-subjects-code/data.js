export function getMeta() {
	return {
		name: 'root',
		className: 'app-account-subjects-code',
		component: 'Layout',
		children: [{
			name: 'subtitle',
			component: 'Layout',
			children: [{
				name: 'title1',
				className: 'app-account-subjects-code-subtitle',
				component: '::p',
				children: '科目编码级次：5级'
			}]
		},{
			name: 'setInput',
			className: 'app-account-subjects-code-input',
			component: 'Form',
			children: [{
				name: 'title1',
				className: 'app-account-subjects-code-set',
				component: 'Form.Item',
				label: '编码长度',
				children: [{
					name: 'number1',
					className: 'app-account-subjects-code-set-input',
					component: 'Input.AntNumber',
					disabled: true,
					// value: '4',
					value: '{{data.form.grade1}}',
					// onChange: "{{function(e){$fieldChange('data.form.addressee',e.target.value)}}}"
				},{
					name: 'span1',
					className: 'app-account-subjects-code-set-span',
					component: '::span',
					children: '一'
				},{
					name: 'number2',
					className: 'app-account-subjects-code-set-input',
					component: 'Input.AntNumber',
					// disabled: true,
					min: 2,
					max: 10,
					// value: '2',
					value: '{{data.form.grade2}}', 
					onChange: "{{function(v){$fieldChange('data.form.grade2',v)}}}"
				},{
					name: 'span2',
					className: 'app-account-subjects-code-set-span',
					component: '::span',
					children: '一'
				},{
					name: 'number3',
					className: 'app-account-subjects-code-set-input',
					component: 'Input.AntNumber',
					min: 2,
					max: 10,
					// disabled: true,
					// value: '2',
					value: '{{data.form.grade3}}',
					onChange: "{{function(v){$fieldChange('data.form.grade3',v)}}}"
				},{
					name: 'span3',
					className: 'app-account-subjects-code-set-span',
					component: '::span',
					children: '一'
				},{
					name: 'number4',
					className: 'app-account-subjects-code-set-input',
					component: 'Input.AntNumber',
					min: 2,
					max: 10,
					// disabled: true,
					// value: '2',
					value: '{{data.form.grade4}}',
					onChange: "{{function(v){$fieldChange('data.form.grade4',v)}}}"
				},{
					name: 'span4',
					className: 'app-account-subjects-code-set-span',
					component: '::span',
					children: '一'
				},{
					name: 'number5',
					className: 'app-account-subjects-code-set-input',
					component: 'Input.AntNumber',
					min: 2,
					max: 10,
					// disabled: true,
					// value: '2',
					value: '{{data.form.grade5}}',
					onChange: "{{function(v){$fieldChange('data.form.grade5',v)}}}"
				}]
			},{
				name: 'title2',
				className: 'app-account-subjects-code-tip',
				component: 'Form.Item',
				children: [{
					name: 'title2',
					className: 'app-account-subjects-code-list',
					component: '::span',
					children: '编码长度变更将会改变原有科目编码，请谨慎修改'
				}]
			},{
				name: 'title3',
				className: 'app-account-subjects-code-set',
				component: 'Form.Item',
				label: '编码示例',
				children: [{
					name: 'title2',
					className: 'app-account-subjects-code-list',
					component: '::span',
					children: '{{$getsample()}}'
				}]
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			form:{
				"grade1":4,
				"grade2":2,
				"grade3":2,
				"grade4":2,
				"grade5":2
			}
		}
	}
}