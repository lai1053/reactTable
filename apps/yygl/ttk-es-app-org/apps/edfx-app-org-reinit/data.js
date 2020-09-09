export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className:'ttk-es-app-org-reinit',
		children: [{
			name: 'item1',
			component: '::div',
			_visible: '{{data.step === 1 && data.origin == "org"}}',
			className: 'text',
			style: {textAlign: 'center',marginBottom: '10px'},
			children: {
				name: 'content',
				component: '::span',
				children:[{
					name: 'item1',
					component: '::span',
					style: {fontSize: '18px', color: '#FF001F'},
					children: '即将删除数据，且不可恢复！'
				}]
			}
		}, {
			name: 'item2',
			component: '::div',
			_visible: '{{data.step === 1 && data.origin == "org"}}',
			className: 'text',
			style: {textAlign: 'center'},
			children: {
				name: 'content',
				component: '::span',
				children:[{
					name: 'item1',
					component: '::span',
					children: '{{"您将对“" +data.orgName+ "”的业务，财务，税务的数据，以及档案数据进行删除，且不可恢复！"}}'
				}]
			}
		}, {
			name: 'item3',
			component: '::div',
			_visible: '{{data.step === 1 && data.origin == "org"}}',
			className: 'text',
			style: {margin: '10px 0 18px', textAlign: 'center'},
			children: {
				name: 'content',
				component: '::span',
				children: '是否确认初始化？'
			}
		}, {
			name: 'item6',
			component: '::div',
			_visible: '{{data.step === 1 && data.origin == "manageList"}}',
			className: 'text',
			style: {textAlign: 'center',marginBottom: '10px'},
			children: {
				name: 'content',
				component: '::span',
				children:[{
					name: 'item1',
					component: '::span',
					style: {fontSize: '20px', color: '#FF001F'},
					children: '继续导账将删除企业数据，且不可恢复！'
				}]
			}
		}, {
			name: 'item5',
			component: '::div',
			_visible: '{{data.step === 1 && data.origin == "manageList"}}',
			className: 'text',
			style: {textAlign: 'center', margin: '10px 0 18px',},
			children: {
				name: 'content',
				component: '::span',
				children:[{
					name: 'item1',
					component: '::span',
					children: '{{"【" +data.orgName+ "】已有数据，导账将会删除企业数据，是否继续导账？"}}'
				}]
			}
		}, {
			name: 'item4',
			component: '::div',
			className: 'ttk-es-app-org-reinit-formItem',
			children: [{
				name: 'mobileItem',
				component: 'Form.Item',
				_visible: '{{data.step === 1}}',
				children: [{
					name: 'mobile',
					component: 'Input',
					disabled: true,
					value: '{{data.form.mobile}}',
				}]
			}, {
				name: 'captchaItem',
				component: 'Form.Item',
				_visible: '{{data.step === 1}}',
				validateStatus: "{{data.other.error.captcha?'error':'success'}}",
				help: '{{data.other.error.captcha}}',
				children: [{
					name: 'captcha',
					component: 'Input',
					value: '{{data.form.captcha}}',
					placeholder: "请输入验证码",
					className: 'captchaInput',
					type: 'captcha',
					onChange: "{{function(e){$setField('data.form.captcha',e.target.value)}}}",
					onFocus: "{{function(e){$checkCaptcha('data.form.captcha',e.target.value)}}}",
					addonAfter: {
						name: 'suffix',
						component: 'Button',
						_disable: false,
						style:{fontSize: "14px",color: '#999999', width: '88px'},
						disabled: '{{!data.timeStaus }}',
						onClick: '{{$getCaptcha}}',
						children: '{{data.time}}'
					}
				}]
			}]
			// {
			// 	name: 'name',
			// 	component: 'Form.Item',
			// 	colon: false,
			// 	label: '登录密码',
			// 	validateStatus: "{{data.error.password?'error':'success'}}",
			// 	help: '{{data.error.password}}',
			// 	children: [{
			// 		name: 'hiddenInput',
			// 		component: 'Input',
			// 		type: 'password',
			// 		style: {display: 'none', width: '0', height: '0'}
			// 	}, {
			// 		name: 'input',
			// 		component: 'Input',
			// 		autocomplete: 'new-password',
			// 		value: '{{data.form.password}}',
			// 		type: 'password',
			// 		style: {width: '381px', height:'34px'},
			// 		onBlur: '{{function(e) {$checkpassword(e.target.value)}}}'
			// 	}]
			// }
		}, {
			name: 'step2',
			component: '::div',
			className: 'text',
			_visible: '{{data.step === 2 && data.origin == "org"}}',
			style: {textAlign: 'center'},
			children: {
				name: 'content',
				component: '::span',
				children:[{
					name: 'item1',
					component: '::span',
					style: {fontSize: '18px', color: '#FF001F', margin: '40px 0'},
					children: [{
						name: 'text1',
						component: '::p',
						className: 'confirmText',
						children: '是否初始化？'
					}, {
						name: 'text2',
						component: '::p',
						className: 'confirmText',
						children: '（初始化后将删除相关数据，且无法恢复！）'
					}]
				}]
			}
		}, {
			name: 'step3',
			component: '::div',
			className: 'text',
			_visible: '{{data.step === 2 && data.origin == "manageList"}}',
			style: {textAlign: 'center'},
			children: {
				name: 'content',
				component: '::span',
				children:[{
					name: 'item1',
					component: '::span',
					style: {fontSize: '18px', color: '#FF001F', margin: '40px 0'},
					children: [{
						name: 'text1',
						component: '::p',
						className: 'confirmText',
						children: '是否确认继续导账？'
					}, {
						name: 'text2',
						component: '::p',
						className: 'confirmText',
						children: '（继续导账将删除业务，财务，税务以及基础档案的数据，且无法恢复！）'
					}]
				}]
			}
		}]
	}
}

export function getInitState() {
	return {
		data: {
			form: {
				password: ''
			},
			error: {

			},
			time: '获取验证码',
			timeStaus:true,
			other: {
				error: {

				}
			},
			step: 1,
			origin: '',
			orgName: ''
		}
	}
}
