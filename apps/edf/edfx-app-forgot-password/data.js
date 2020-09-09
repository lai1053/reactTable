import moment from 'moment'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'edfx-app-forgot-password',
		children: [{
			name: 'header',
			className: 'edfx-app-forgot-password-header',
			component: 'Layout',
			children: [{
				name: 'header-left',
				component: 'Layout',
				className: 'edfx-app-forgot-password-header-left',
				children: [{
					name: 'logo',
					component: '::img',
					className: 'edfx-app-login-header-left-logo',
					onClick:'{{$goLanding}}',
					src: "{{'./vendor/img/' + (appBasicInfo.directory || 'transparent') + '/logo_login.png'}}"
				// },
				// {
				// 	name: 'sitename',
				// 	component: '::span',
				// 	className: 'edfx-app-login-header-left-sitename',
				// 	children: '金财管家'
				}, {
					name: 'split',
					component: '::div',
					className: 'edfx-app-login-header-left-split',
				}, {
					name: 'item',
					className: 'edfx-app-login-header-left-login',
					component: '::span',
					children: '重置密码'
				}]
			}, {
				name: 'header-right',
				className: 'edfx-app-forgot-password-header-right',
				component: '::a',
				onClick: '{{$goLogin}}',
				children: ['登录']
			}]
		}, {
			name: 'form',
			component: 'Form',
			className: 'edfx-app-forgot-password-form',
			children: [{
				name: 'titleItem',
				component: 'Form.Item',
				className: 'edfx-app-forgot-password-form-title',
				children: "{{'重置密码'}}"
			}, {
				name: 'barItem',
				component: '::div',
				className: 'edfx-app-forgot-password-form-bar',
				// src: '{{$getBar()}}'
				children: [{
					name: 'step1',
					component: '::div',
					className: 'edfx-app-register-form-bar-step step1',
					children: [{
						name: 'title',
						className: 'edfx-app-register-form-bar-step-icon',
						component: '::div',
						style: {background: '#F27215',borderColor: '#F27215',color: '#fff'},
						children: ['1']
					}, {
						name: 'description',
						component: '::span',
						className: 'edfx-app-register-form-bar-step-description',
						style: {color: '#F27215'},
						children: ['重置密码']
					}]
				}, {
					name: 'line1',
					className: '{{data.other.step >= 2 ? "edfx-app-forgot-password-form-bar-line active" : "edfx-app-forgot-password-form-bar-line"}}',
					component: '::span',
				},{
					name: 'line2',
					className: '{{data.other.step >= 2 ? "edfx-app-forgot-password-form-bar-line active" : "edfx-app-forgot-password-form-bar-line"}}',
					component: '::span',
				}, {
					name: 'step2',
					component: '::div',
					className: 'edfx-app-register-form-bar-step step2',
					children: [{
						name: 'title',
						className: 'edfx-app-register-form-bar-step-icon',
						style: "{{data.other.step>=2? {background: '#F27215',borderColor: '#F27215',color: '#fff'}:{background: '#fff',borderColor: '#666666',color: '#666666'}}}",
						component: '::div',
						children: ['2']
					}, {
						name: 'description',
						component: '::span',
						style: "{{data.other.step>=2?{color: '#F27215'}:{color: '#666666'}}}",
						className: 'edfx-app-register-form-bar-step-description',
						children: ['重新登录']
					}]
				}, 
				// {
				// 	name: 'step3',
				// 	component: '::div',
				// 	className: 'edfx-app-register-form-bar-step step3',
				// 	children: [{
				// 		name: 'title',
				// 		className: 'edfx-app-register-form-bar-step-icon',
				// 		style: "{{data.other.step==3? {background: '#F27215',borderColor: '#F27215',color: '#fff'}:{background: '#fff',borderColor: '#666666',color: '#666666'}}}",
				// 		component: '::div',
				// 		children: ['3']
				// 	}, {
				// 		name: 'description',
				// 		component: '::span',
				// 		style: "{{data.other.step==3?{color: '#F27215'}:{color: '#666666'}}}",
				// 		className: 'edfx-app-register-form-bar-step-description',
				// 		children: ['重新登录']
				// 	}]
				// }
			]
			}, {
				name: 'mobileItem',
				component: 'Form.Item',
				className: 'edfx-app-forgot-password-form-mobile',
				validateStatus: "{{data.other.error.mobile?'error':'success'}}",
				help: '{{data.other.error.mobile}}',
				_visible: '{{data.other.step==1}}',
				children: [{
					name: 'mobile',
					component: 'Input',
					className: 'mobileInput',
					autoFocus: true,
					tabIndex: 1,
					value: '{{data.form.mobile}}',
					placeholder: "请输入绑定手机号",
					onFocus: `{{function(){$setField('data.other.error.mobile',undefined)}}}`,
					onChange: `{{function(e){$fieldChange('data.form.mobile',e.target.value)}}}`,
					onBlur: `{{function(e){$fieldChange('data.form.mobile',e.target.value, 'next')}}}`,
				}]
			}, {
				name: 'captchaItem',
				component: 'Form.Item',
				className: 'edfx-app-forgot-password-form-captcha',
				validateStatus: "{{data.other.error.captcha?'error':'success'}}",
				help: '{{data.other.error.captcha}}',
				_visible: '{{data.other.step==1}}',
				children: [{
					name: 'captcha',
					component: 'Input',
					value: '{{data.form.captcha}}',
					placeholder: "请输入验证码",
					type: 'captcha',
					className: 'captchaInput',
					onFocus: "{{function(){$setField('data.other.error.captcha',undefined)}}}",
					onChange: "{{function(e){$setField('data.form.captcha',e.target.value)}}}",
					addonAfter: {
						name: 'suffix',
						component: 'Button',
						tabIndex:2,
						style: {width: '98px'},
						className: 'getCaptchaCode',
						disabled: '{{!data.form.mobile || !!data.other.error.mobile || !data.timeStaus}}',
						onClick: '{{$getCaptcha}}',
						children: '{{data.time}}'
					}
				}]
			}, {
				name: 'passwordItem',
				component: 'Form.Item',
				className: 'edfx-app-forgot-password-form-password',
				validateStatus: "{{data.other.error.password?'error':'success'}}",
				help: '{{data.other.error.password}}',
				_visible: '{{data.other.step==1}}',
				children: [
					{
						name: 'stopAutocompletePassword',
						component: 'Input',
						type: 'text',
						autocomplete:"off",
						style:{position: 'absolute', top: '-9999px'}
					
					},{
						name: 'stopAutocompletePassword',
						component: 'Input',
						type: 'password',
						autocomplete:"new-password",
						style:{position: 'absolute', top: '-9999px'}
					
					},{
					name: 'password',
					component: 'Input',
					className: 'pwdInput',
					autocomplete:"new-password",
					value: '{{data.form.password}}',
					placeholder: "新密码（6-20位必须包含大写字母、小写字母和数字）",
					type: 'password',
					onChange: `{{function(e){$setField('data.form.password',e.target.value)}}}`,
					onBlur: `{{function(e){$fieldChange('data.form.password',e.target.value)}}}`,
					onFocus: `{{function(e){$setField('data.other.error.password',undefined)}}}`,
				}]
			}, {
				name: 'confirmPasswordItem',
				component: 'Form.Item',
				className: 'edfx-app-forgot-password-form-confirmPassword',
				validateStatus: "{{data.other.error.confirmPassword?'error':'success'}}",
				help: '{{data.other.error.confirmPassword}}',
				_visible: '{{data.other.step==1}}',
				children: [{
					name: 'confirmPassword',
					component: 'Input',
					value: '{{data.form.confirmPassword}}',
					className:'rePwdInput',
					placeholder: "确认新密码",
					type: 'password',
					onChange: `{{function(e){$setField('data.form.confirmPassword',e.target.value)}}}`,
					onBlur: `{{function(e){$fieldChange('data.form.confirmPassword',e.target.value)}}}`,
					onFocus: `{{function(e){$setField('data.other.error.confirmPassword',undefined)}}}`,
				}]
			},{
				name: 'nextItem',
				className: 'edfx-app-forgot-password-form-next',
				component: 'Form.Item',
				_visible: '{{data.other.step==1}}',
				children: [{
					name: 'next',
					disabled: '{{$checkNext()}}',
					component: 'Button',
					className: 'nextBtn',
					type: 'softly',
					children: '重置密码',
					onClick: '{{$modify}}'
				}]
			}, {
				name: 'passwordItem',
				component: 'Form.Item',
				className: 'edfx-app-forgot-password-form-password',
				validateStatus: "{{data.other.error.password?'error':'success'}}",
				help: '{{data.other.error.password}}',
				_visible: '{{data.other.step==2}}',
				children: [{
					name: 'password',
					component: 'Input',
					className: 'pwdInput',
					autoFocus: 'autoFocus',
					value: '{{data.form.password}}',
					placeholder: "新密码（6-20位必须包含大写字母、小写字母和数字）",
					type: 'password',
					onChange: `{{function(e){$setField('data.form.password',e.target.value)}}}`,
					onBlur: `{{function(e){$fieldChange('data.form.password',e.target.value)}}}`,
					onFocus: `{{function(e){$setField('data.other.error.password',undefined)}}}`,
				}]
			}, {
				name: 'confirmPasswordItem',
				component: 'Form.Item',
				className: 'edfx-app-forgot-password-form-confirmPassword',
				validateStatus: "{{data.other.error.confirmPassword?'error':'success'}}",
				help: '{{data.other.error.confirmPassword}}',
				_visible: '{{data.other.step==2}}',
				children: [{
					name: 'confirmPassword',
					component: 'Input',
					value: '{{data.form.confirmPassword}}',
					className:'rePwdInput',
					placeholder: "确认新密码",
					type: 'password',
					onChange: `{{function(e){$setField('data.form.confirmPassword',e.target.value)}}}`,
					onBlur: `{{function(e){$fieldChange('data.form.confirmPassword',e.target.value)}}}`,
					onFocus: `{{function(e){$setField('data.other.error.confirmPassword',undefined)}}}`,
				}]
			}, {
				name: 'relogin',
				component: '::div',
				className: 'edfx-app-forgot-password-form-relogin',
				_visible: '{{data.other.step==3}}',
				children:[{
					name: 'success',
					component: '::div',
					children: [{
						name: 'successIcon',
						component: 'Icon',
						fontFamily: 'edficon',
						type: 'chenggongtishi'
					}, {
						name: 'text',
						component: '::span',
						style: {marginLeft: '8px'},
						children: '密码修改成功'
					}]
				}, {
					name: 'reloginBtn',
					component: '::div',
					onClick: '{{$goLogin}}',
					children:[{
						name: 'btn',
						component: '::span',
						children: '重新登录'
					}, '（','{{data.reLoginTime}}',')']
				}]
			}, {
				name: 'modifyItem',
				className: 'edfx-app-forgot-password-form-modify',
				component: 'Form.Item',
				_visible: '{{data.other.step==2}}',
				children: [{
					name: 'modify',
					// disabled: '{{$checkNext()}}',
					component: 'Button',
					type: 'softly',
					children: '重置密码',
					onClick: '{{$modify}}'
				}]
			}, {
				name: 'loginItem',
				component: 'Form.Item',
				className: 'formBottom',
				_visible: '{{data.other.step!=3}}',
				children: [{
					name: 'prev',
					component: '::a',
					children: '上一步',
					className: 'prev',
					onClick: '{{$prev}}',
					_visible: '{{data.other.step==2}}'
				},{
					name: 'login',
					component: '::a',
					style: { float: 'right', fontSize: '12px' },
					children: '返回登录',
					className: 'backToLogin',
					onClick: '{{$goLogin}}'
				}]
			}]
		}, {
			name: 'footer',
			className: 'edfx-app-forgot-password-footer',
			component: 'Layout',
			children: [{
				name: 'item1',
				component: '::p',
				children: [{
					name: 'item1',
					component: '::span',
					children: '{{appBasicInfo.name}}'
				}, {
					name: 'version',
					id: 'lbl-version',
					component: '::span',
					children: '{{data.other.version}}'
				}, {
					name: 'item2',
					component: '::span',
					children: '{{" 版权所有 © 2018 " + appBasicInfo.companyName +" "}}'
				}, {
					name: 'item3',
					component: '::span',
					children: '{{appBasicInfo.copyright1}}'
				}, {
					name: "item4",
					component: "::a",
					target: "_blank",
					style: { color: "#a1a1a1" },
					href: '{{appBasicInfo.beianDomain}}',
					children: '{{appBasicInfo.copyright2}}'
				}, {
					name: 'item5',
					component: '::span',
					children: '{{appBasicInfo.copyright3}}'
				}]
			}]
		}, {
			name: 'footer',
			className: 'edfx-app-forgot-password-footer-mobile',
			component: 'Layout',
			children: [{
				name: 'item1',
				component: '::p',
				children: [{
					name: 'item1',
					component: '::span',
					children: '{{"版权所有 © 2019 " + appBasicInfo.companyNameShort}}'
				}]
			}]
		},]
	}
}


export function getInitState(option) {
	var state = {
		data: {
			form: {
				mobile: '',
				password: '',
				confirmPassword: '',
				captcha: ''
			},
			reLoginTime: 5,
			time: '获取验证码',
            timeStaus:true,
			other: {
				step: 1,
				error: {}
			}
		}
	}
	return state
}
