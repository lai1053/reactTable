import moment from 'moment'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-dzgl-app-forget-password',
		children: [{
			name: 'header',
			className: 'ttk-dzgl-app-forget-password-header',
			component: 'Layout',
			children: [{
				name: 'header-left',
				component: 'Layout',
				className: 'ttk-dzgl-app-forget-password-header-left',
				children: [{
					name: 'logo',
					component: '::img',
					className: 'ttk-dzgl-app-login-header-left-logo',
					onClick:'{{$goLanding}}',
					src: "{{'./vendor/img/' + (appBasicInfo.directory || 'transparent') + '/logo_login_jc.png'}}"
				// },
				// {
				// 	name: 'sitename',
				// 	component: '::span',
				// 	className: 'edfx-app-login-header-left-sitename',
				// 	children: '金财管家'
				}, {
					name: 'split',
					component: '::div',
					className: 'ttk-dzgl-app-login-header-left-split',
				}, {
					name: 'item',
					className: 'ttk-dzgl-app-login-header-left-login',
					component: '::span',
					children: '重置密码'
				}, {
					name: 'gzlogo',
					component: '::img',
					className: 'ttk-dzgl-app-login-header-left-logo',
					onClick:'{{$goLanding}}',
					src: "{{'./vendor/img/' + (appBasicInfo.directory || 'transparent') + '/logo_login.png'}}"
				}]
			},
            //     {
			// 	name: 'header-right',
			// 	className: 'ttk-dzgl-app-forget-password-header-right',
			// 	component: '::a',
			// 	onClick: '{{$goLogin}}',
			// 	children: ['登录']
			// }
			]
		},
		 {
			name: 'form',
			component: 'Form',
			className: 'ttk-dzgl-app-forget-password-form',
			children: [{
				name: "title",
				component: "::div",
				className: 'ttk-dzgl-app-forget-password-form-title',
				children: "找回密码"
			},{
				name: 'headerProcess',
				component: '::div',
				className: 'ttk-dzgl-app-forget-password-form-process',
				children:[{
					name: 'oneStep',
					component: '::div',
					style: {position: 'relative'},
					children:[{
						name: 'step1',
						component: '::div',
						className: '{{data.other.step > 1 ? "step step1 lineStep" : "step step1"}}',
						children: [{
							name: 'step0',
							component: '::span',
							_visible: '{{data.other.step == 1}}',
							style: {marginRight: '8px',},
							children: '①'
						},{
							name: 'step00',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'duigou',
							_visible: '{{data.other.step > 1}}',
							style: {marginRight:'8px',fontSize: '20px',fontWeight:'bold'}
						},{
							name: 'stepText',
							component: '::span',
							children: '重置密码'
						}],	
					},{
						name: 'bblock',
						component: '::div',
						children: '',
						className: 'san san1',
					},{
						name: 'wblock',
						component: '::div',
						children: '',
						_visible: '{{data.other.step > 1}}',
						className: 'san san2',
					}]
				},{
					name: 'lastStep',
					component: '::div',
					style: {position: 'relative'},
					children:[{
						name: 'wblock',
						component: '::div',
						children: '',
						className: 'san san3',
					},{
						name: 'step1',
						component: '::div',
						className: '{{data.other.step == 2 ? "step lastActive" : "step lastStep"}}',
						children: [{
							name: 'step0',
							component: '::span',
							style: {marginRight: '8px'},
							children: '②'
						}, '重新登录'],	
					}]
				}]
			},{
				name: 'mobileItem',
				component: 'Form.Item',
				className: 'ttk-dzgl-app-forget-password-form-mobile',
				validateStatus: "{{data.other.error.mobile?'error':'success'}}",
				help: '{{data.other.error.mobile}}',
				_visible: '{{data.other.step==1}}',
				label:"手机号码",
				colon:true,
				required: true,
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
					// prefix: {
					// 	name: 'prefix',
					// 	component: '::span',
					// 	children: [{
					// 		name: 'require',
					// 		component: '::span',
					// 		className: 'ant-form-item-required'
					// 	}]
					// }
				}]
			}, {
				name: 'captchaItem',
				component: 'Form.Item',
				className: 'ttk-dzgl-app-forget-password-form-captcha',
				validateStatus: "{{data.other.error.captcha?'error':'success'}}",
				help: '{{data.other.error.captcha}}',
				_visible: '{{data.other.step==1}}',
				label:"验证码",
				colon:true,
				required: true,
				children: [{
					name: 'captcha',
					component: 'Input',
					value: '{{data.form.captcha}}',
					placeholder: "请输入验证码",
					type: 'captcha',
					className: 'captchaInput',
					onFocus: "{{function(){$setField('data.other.error.captcha',undefined)}}}",
					onChange: "{{function(e){$setField('data.form.captcha',e.target.value)}}}",
					onBlur:"{{function(e){$fieldChange('data.form.captcha',e.target.value, 'next')}}}",
					// prefix: {
					// 	name: 'prefix',
					// 	component: '::span',
					// 	children: [{
					// 		name: 'require',
					// 		component: '::span',
					// 		className: 'ant-form-item-required'
					// 	}]
					// },
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
			},
			{
				name: 'passwordItem',
				component: 'Form.Item',
				className: 'ttk-dzgl-app-forget-password-form-password',
				validateStatus: "{{data.other.error.password?'error':'success'}}",
				help: '{{data.other.error.password}}',
				_visible: '{{data.other.step==1}}',
				label:"密码",
				colon:true,
				required: true,
				children: [{
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
					value: '{{data.form.password}}',
					placeholder: "新密码（6-20位必须包含大写字母、小写字母和数字）",
					type: 'password',
					onChange: `{{function(e){$setField('data.form.password',e.target.value)}}}`,
					onBlur: `{{function(e){$fieldChange('data.form.password',e.target.value)}}}`,
					onFocus: `{{function(e){$setField('data.other.error.password',undefined)}}}`,
					// prefix: {
					// 	name: 'prefix',
					// 	component: '::span',
					// 	children: [{
					// 		name: 'require',
					// 		component: '::span',
					// 		className: 'ant-form-item-required'
					// 	}]
					// }
				}]
			}, {
				name: 'confirmPasswordItem',
				component: 'Form.Item',
				className: 'ttk-dzgl-app-forget-password-form-confirmPassword',
				validateStatus: "{{data.other.error.confirmPassword?'error':'success'}}",
				help: '{{data.other.error.confirmPassword}}',
				_visible: '{{data.other.step==1}}',
				label:"确认密码",
				colon:true,
				required: true,
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
					// prefix: {
					// 	name: 'prefix',
					// 	component: '::span',
					// 	children: [{
					// 		name: 'require',
					// 		component: '::span',
					// 		className: 'ant-form-item-required'
					// 	}]
					// }
				}]
			},{
				name: 'tips',
				component: 'Form.Item',
				className: 'ttk-dzgl-app-forget-password-form-confirmPassword',
				_visible: '{{data.other.step==1}}',
				children: [{
					name: 'confirmPassword',
					component: '::span',
					children:'温馨提示：',
					style: {color: '#ff9300',marginLeft: '10px',},
				},{
					name: 'confirmPassword',
					component: '::span',
					children:'您正在重置金财代账账号的密码。'
				}]
			},{
				name: "form-button",
				component: "::div",
				_visible: '{{data.other.step==1}}',
				className: "ttk-dzgl-app-forget-password-form-footerButton",
				children: [
					{
						name: "submit",
						component: "Button",
						className: "ttk-dzgl-app-forget-password-form-submit",
						onClick: '{{$modify}}',
						disabled: '{{$checkNext()}}',
						type: "softly",
						children: '重置密码',
					},{
						name: "back",
						component: "Button",
						className: "ttk-dzgl-app-forget-password-form-submit",
						onClick: "{{$goLogin}}",
						children: "取消"
					},
				]
		  },{
				name: 'relogin',
				component: '::div',
				className: 'ttk-dzgl-app-forget-password-form-relogin',
				_visible: '{{data.other.step==2}}',
				children:[{
					name: 'success',
					component: '::div',
					children: [{
						name: 'successIcon',
						component: 'Icon',
						fontFamily: 'edficon',
						type: 'chenggongtishi',
						style:{color:'#00b38a'}
					}, {
						name: 'text',
						component: '::span',
						style: {marginLeft: '8px'},
						children: '密码修改成功'
					}]
				},{
					name: "submit",
					component: "Button",
					className: "ttk-dzgl-app-forget-password-form-submit",
					onClick: '{{$goLogin}}',
					type: "primary",
					children:[{
						name: 'btn',
						component: '::span',
						children: '重新登录'
					}, '(','{{data.reLoginTime}} ',')']
				}]
			}, 
		]
		}, {
			name: 'footer',
			className: 'ttk-dzgl-app-forget-password-footer',
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
			className: 'ttk-dzgl-app-forget-password-footer-mobile',
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
