export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-edf-app-org-verifyca',
		children: [{
			name: 'item1',
			component: '::div',
			_visible: '{{!$IsEmptyCA()}}',
			children: {
				name: 'orgName',
				component: '::div',
				children: [{
					name: 'i1',
					className: 'ttk-edf-app-org-verifyca-blank-logotitle',
					component: '::div',
					children: '请插入一证通证书登录平台'
				}, {
					name: 'item10',
					component: '::img',
					className: 'ttk-edf-app-org-verifyca-blank-logo',
					src: '{{$getCATips()}}'
				}, {
					name: 'i3',
					component: '::span',
					className: 'ttk-edf-app-org-verifyca-blank-logodesc',
					children: '登录一证通平台前，请确保正确安装证书',
				}, {
					name: 'link',
					component: '::a',
					children: '应用环境',
					href: 'http://yzt.beijing.gov.cn/download/index.html',
					target: '_blank'
				}]
			}
		}, {
			name: 'sequenceId',
			component: 'Input',
			type: 'hidden',
			value: '{{data.form.sequenceId}}',
			style: { display: 'none', width: '0', height: '0' }
		}, {
			name: 'container',
			component: '::div',
			_visible: '{{$IsEmptyCA()}}',
			children: [
				{
					name: 'item0',
					component: '::div',
					className: 'text',
					style: { margin: '10px 0 18px' },
					children: [{
						name: 'content',
						component: '::div',
						children: '请选择您的企业：'
					}, {
						name: 'content',
						component: '::div',
						children: [{
							name: 'e1',
							component: 'Radio.Group',
							value: '{{data.form.sequenceId}}',
							onChange: `{{function(v){$setField('data.form.sequenceId',v.target.value)}}}`,
							children: [{
								name: 'option',
								component: 'Radio',
								key: '{{data.other.elist[_rowIndex].id}}',
								value: '{{data.other.elist[_rowIndex].id}}',
								children: '{{data.other.elist[_rowIndex].name}}',
								_power: 'for in data.other.elist'
							}]
						}]
					}]
				}, {
					name: 'item2',
					component: '::div',
					className: 'text',
					_visible: false,
					style: { margin: '10px 0 18px' },
					children: [{
						name: 'content',
						component: '::span',
						children: '统一社会信用代码：'
					}, {
						name: 'content',
						component: '::span',
						children: '{{data.form.nsrsbh}}'
					}]
				}, {
					name: 'verifydate',
					component: '::div',
					className: 'text',
					_visible: false,
					style: { margin: '10px 0 18px' },
					children: [{
						name: 'content',
						component: '::span',
						children: '证书有效期：'
					}, {
						name: 'content',
						component: '::span',
						children: '{{data.form.usbKeyDate}}'
					}]
				}, {
					name: 'item3',
					component: '::div',
					children: [{
						name: 'name',
						component: 'Form.Item',
						colon: false,
						label: '请输入密码',
						required: true,
						validateStatus: "{{data.error.password?'error':'success'}}",
						help: '{{data.error.password}}',
						children: [{
							name: 'hiddenInput',
							component: 'Input',
							type: 'password',
							style: { display: 'none', width: '0', height: '0' }
						}, {
							name: 'input',
							component: 'Input',
							autocomplete: 'new-password',
							value: '{{data.form.password}}',
							type: '{{data.other.showpwd ? "password":"input"}}',
							style: { width: '260px', height: '34px' },
							onBlur: '{{function(e) {$checkpassword(e.target.value)}}}'
						}]
					}, {
						name: 'showpwd',
						component: 'Checkbox',
						children: '显示密码',
						_visible: false,
						onChange: '{{function(e){$showPwdChange(e.target.checked)}}}'

					}]
				}
			]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			form: {
				password: '',
				nsrsbh: '',
				usbKeyDate: '',
				sequenceId: '',
				orgName: ''
			},
			other: {
				elist: [{
					id: '',
					name: ''
				}],
				showpwd: true
			},
			error: {

			}
		}
	}
}
