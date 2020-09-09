export function getMeta() {
	return {
		name: "root",
		component: "Layout",
		className: "edfx-app-login",
		children: [
			{
				name: "header",
				className: "edfx-app-login-header",
				component: "Layout",
				children: [
					{
						name: "header-left",
						component: "Layout",
						className: "edfx-app-login-header-left",
						children: [
							{
								name: "logo",
								component: "::img",
								className: "edfx-app-login-header-left-logo",
								onClick: "{{$goLanding}}",
								// src: "{{appBasicInfo.assetUrl  + '/logo_login.png'}}"
								src:
									"{{appBasicInfo.assetUrl ?  appBasicInfo.assetUrl + '/logo_login.png' : './vendor/img/transparent/logo_login.png'}}"
								// },
								// {
								// 	name: 'sitename',
								// 	component: '::span',
								// 	className: 'edfx-app-login-header-left-sitename',
								// 	children: '金财管家'
							},
							{
								name: "split",
								component: "::div",
								className: "edfx-app-login-header-left-split"
							},
							{
								name: "item",
								className: "edfx-app-login-header-left-login",
								component: "::span",
								children: "企业登录"
							}
						]
					},
					{
						name: "header-client",
						component: "::span",
						onClick: "{{$gotoLoad}}",
						_visible: "{{$gjClientV()}}",
						className: "edfx-app-login-header-client",
						children: "客户端下载"
					},
					{
						name: "header-lineV",
						className: "edfx-app-login-header-lineV",
						_visible: "{{$gjClientV()}}",
						component: "::div"
					},
					{
						name: "header-phone",
						component: "Dropdown",
						placement: "bottomCenter",
						_visible: "{{$gjClientV()}}",
						overlayClassName: "edfx-app-login-header-phoneoverlay",
						className: "edfx-app-login-header-phone",
						style: {
							padding: "0px 16px 0 10px",
							cursor: "pointer",
							position: "relative"
						},
						overlay: {
							name: "item",
							component: "::div",
							className: "container",
							children: [
								{
									name: "imgItem",
									component: "::div",
									className: "qrcodeImg"
								},
								{
									name: "item",
									component: "::div",
									className: "content",
									children: "微信扫一扫手机端登录"
								}
							]
						},
						children: {
							name: "content",
							component: "::div",
							children: [
								{
									name: "invite",
									component: "::span",
									className: "headBarBtn",
									children: "移动端登录"
								}
							]
						}
					},
					/*, {
                                    name: 'header-load',
                                    component: 'Dropdown.AntButton',
                                    className: 'edfx-app-login-header-load',
                                    onClick: '{{$loadClient}}',
                                    style: { marginLeft: '8px' },
                                    // _visible: false,
                                    _visible: '{{$loadCondition()}}',
                                    overlay: {
                                        name: 'menu',
                                        component: 'Menu',
                                        className: 'edfx-app-login-header-load-ul',
                                        onClick: '{{$loadClientMore}}',
                                        children: '{{$getClientChildren()}}'
                                    },
                                    children: '{{$loadText()}}'
                    			}*/
					{
						name: "header-right",
						className: "edfx-app-login-header-right",
						component: "::a",
						onClick: "{{$goRegisterA}}",
						children: ["立即注册"]
					}
				]
			},
			{
				name: "content",
				className: "edfx-app-login-content",
				component: "Layout",
				children: [
					{
						name: "bgs",
						className: "edfx-app-login-content-bgs",
						component: "::div",
						children: "{{$renderCal()}}"
					},
					{
						name: "container",
						className: "container",
						component: "::div",
						children: {
							name: "form",
							component: "Form",
							className: "edfx-app-login-content-form",
							onSubmit: "{{$login}}",
							children: [
								{
									name: "item1",
									component: "Form.Item",
									className:
										"edfx-app-login-content-form-title",
									children: "登 录"
								},
								{
									name: "item2",
									component: "Form.Item",
									validateStatus:
										"{{data.other.error.mobile?'error':'success'}}",
									help: "{{data.other.error.mobile}}",
									className:
										"edfx-app-login-content-form-mobile",
									children: [
										{
											name: "mobile",
											component: "Input",
											autoFocus: "autoFocus",
											placeholder: "请输入手机号",
											onFocus:
												"{{function(e){$setField('data.other.error.mobile', undefined)}}}",
											onChange:
												"{{function(e){$fieldChange('data.form.mobile', e.target.value)}}}",
											onBlur:
												"{{function(e){$fieldChange('data.form.mobile', e.target.value, 'login')}}}",
											value: "{{data.form.mobile}}",
											prefix: {
												name: "userIcon",
												component: "Icon",
												fontFamily: "edficon",
												type: "yonghu"
											}
										}
									]
								},
								{
									name: "item3",
									component: "Form.Item",
									validateStatus:
										"{{data.other.error.password?'error':'success'}}",
									help: "{{data.other.error.password}}",
									className:
										"edfx-app-login-content-form-password",
									children: [
										{
											name: "stopAutocompletePassword",
											component: "Input",
											type: "password",
											tabindex: "-1",
											autocomplete: "new-password",
											style: {
												position: "absolute",
												top: "-9999px"
											}
										},
										{
											name: "password",
											component: "Input",
											placeholder: "请输入密码",
											type: "password",
											onFocus:
												"{{function(e){$setField('data.other.error.password', undefined)}}}",
											onChange: `{{function(e){$setField('data.other.error.password', undefined);$setField('data.other.userInput', true);$setField('data.form.password', e.target.value)}}}`,
											onBlur: `{{function(e){$fieldChange('data.form.password', e.target.value)}}}`,
											value: "{{data.form.password}}",
											prefix: {
												name: "passwordIcon",
												component: "Icon",
												fontFamily: "edficon",
												type: "mima"
											}
										}
									]
								},
								{
									name: "item4",
									component: "Form.Item",
									className:
										"edfx-app-login-content-form-login",
									children: [
										{
											name: "loginBtn",
											component: "Button",
											type: "softly",
											// disabled: '{{$checkLogin()}}',
											children: "登录",
											onClick: "{{$login}}"
										}
									]
								},
								{
									name: "item5",
									component: "Form.Item",
									className:
										"edfx-app-login-content-form-more",
									children: [
										{
											name: "remember",
											component: "Checkbox",
											className:
												"edfx-app-login-content-form-more-remember",
											checked: "{{data.form.remember}}",
											onChange: `{{function(e){$fieldChange('data.form.remember', e.target.checked)}}}`,
											children: "一周内自动登录"
										},
										{
											name: "register",
											className:
												"edfx-app-login-content-form-more-register",
											component: "::a",
											style: { float: "right" },
											onClick: "{{$goRegisterB}}",
											children: "立即注册"
										},
										{
											name: "",
											component: "::i",
											style: {
												float: "right",
												margin: "0 10px",
												fontStyle: "normal",
												fontSize: "13px",
												lineHeight: "36px"
											},
											children: "|"
										},
										{
											name: "forgot",
											className:
												"edfx-app-login-content-form-more-forget",
											component: "::a",
											style: { float: "right" },
											onClick: "{{$goForgot}}",
											children: "忘记密码"
										}
									]
								}
							]
						}
					}
				]
			},
			{
				name: "footer",
				className: "edfx-app-login-footer",
				component: "Layout",
				children: [
					{
						name: "item1",
						component: "::p",
						children: [
							{
								name: "item1",
								component: "::span",
								children: "{{appBasicInfo.name}}"
							},
							{
								name: "version",
								id: "lbl-version",
								component: "::span",
								children: "{{data.other.version}}"
							},
							{
								name: "item2",
								component: "::span",
								children:
									'{{" 版权所有 © 2018 " + (appBasicInfo.companyName || "") +" "}}'
							},
							{
								name: "item3",
								component: "::span",
								children: "{{appBasicInfo.copyright1}}"
							},
							{
								name: "item4",
								component: "::a",
								target: "_blank",
								style: { color: "#a1a1a1" },
								href: "{{appBasicInfo.beianDomain}}",
								children: "{{appBasicInfo.copyright2}}"
							},
							{
								name: "item5",
								component: "::span",
								children: "{{appBasicInfo.copyright3}}"
							}
						]
					}
				]
			},
			{
				name: "footer",
				className: "edfx-app-login-footer-mobile",
				component: "Layout",
				children: [
					{
						name: "item1",
						component: "::p",
						children: [
							{
								name: "item1",
								component: "::span",
								children:
									'{{"版权所有 © 2019 " + (appBasicInfo.companyNameShort || "")}}'
							}
						]
					}
				]
			},
			{
				name: "browserCheck",
				className: "edfx-app-login-browserCheck",
				_visible: "{{data.other.checkTips ? true :false}}",
				component: "::div",
				children: {
					name: "browserCheck-middle",
					className: "edfx-app-login-browserCheck-middle",
					component: "::span",
					children: [
						{
							name: "warning-ico",
							component: "::img",
							className: "edfx-app-login-browserCheck-img",
							src: require("./img/warning.png")
						},
						{
							name: "warning-test",
							component: "::span",
							className: "edfx-app-login-browserCheck-title",
							children: "建议使用PC端登录"
						},
						{
							name: "warning-close",
							component: "::img",
							onClick: "{{$closeTips}}",
							className: "edfx-app-login-browserCheck-close",
							src: require("./img/close.png")
						}
					]
				}
			}
			/*{
            			name: 'stepTips',
            			component: 'Step',
            			enabled: true,
            			stepsEnabled: true,
            			initialStep: 0,
            			steps: [
            				{
            					element: '.edfx-app-login-content-form-more-register',
            					intro: '点我注册账号',
            				}, {
            					element: '.edfx-app-login-content-form-more-forget',
            					intro: '忘记密码怎么办?',
            				}
            			],
            			onExit: "{{$onExit}}"
            		}*/
		]
	}
}

export function getInitState() {
	return {
		data: {
			form: {
				account: "",
				password: "",
				mobile: "",
				remember: false
			},
			other: {
				error: {},
				selectedImgIndex: 0,
				imgs: [],
				userInput: false,
				checkTips: false,
				version: ""
			}
		}
	}
}
