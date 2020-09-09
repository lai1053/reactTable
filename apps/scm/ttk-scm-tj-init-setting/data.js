import moment from 'moment'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-tj-init-setting',
		children: {
			name: 'mail',
			component: 'Spin',
			tip: '加载中...',
			delay: 0.01,
			spinning: '{{data.loading}}',
			children: {
				name: 'form',
				component: 'Form',
				layout: 'inline',
				className: 'ttk-scm-tj-init-setting-form',
				children: [{
					name: 'barItem',
					component: '::div',
					className: 'ttk-scm-tj-init-setting-form-bar',
					children: [{
						name: 'step1',
						component: '::div',
						className: 'ttk-scm-tj-init-setting-form-bar-step step1',
						children: [{
							name: 'title',
							className: 'ttk-scm-tj-init-setting-form-bar-step-icon',
							component: '::div',
							children: ['1']
						}, {
							name: 'description',
							component: '::span',
							className: 'ttk-scm-tj-init-setting-form-bar-step-description',
							children: ['连接服务器']
						}]
					}, {
						name: 'line1',
						className: '{{data.other.step >= 2 ? "ttk-scm-tj-init-setting-form-bar-line active" : "ttk-scm-tj-init-setting-form-bar-line"}}',
						component: '::span',
					}, {
						name: 'step2',
						component: '::div',
						className: 'ttk-scm-tj-init-setting-form-bar-step step2',
						children: [{
							name: 'title',
							className: '{{ data.other.step>=2 ? "ttk-scm-tj-init-setting-form-bar-step-icon active" : "ttk-scm-tj-init-setting-form-bar-step-icon" }}',
							component: '::div',
							children: ['2']
						}, {
							name: 'description',
							component: '::span',
							className: "{{data.other.step>=2 ? 'ttk-scm-tj-init-setting-form-bar-step-description active' : 'ttk-scm-tj-init-setting-form-bar-step-description' }}",
							children: ['连接账套']
						}]
					}, {
						name: 'line2',
						className: '{{data.other.step >= 3 ? "ttk-scm-tj-init-setting-form-bar-line active" : "ttk-scm-tj-init-setting-form-bar-line"}}',
						component: '::span',
					}, {
						name: 'step3',
						component: '::div',
						className: 'ttk-scm-tj-init-setting-form-bar-step step3',
						children: [{
							name: 'title',
							className: '{{ data.other.step==3 ? "ttk-scm-tj-init-setting-form-bar-step-icon active" : "ttk-scm-tj-init-setting-form-bar-step-icon" }}',
							component: '::div',
							children: ['3']
						}, {
							name: 'description',
							component: '::span',
							className: "{{data.other.step==3 ? 'ttk-scm-tj-init-setting-form-bar-step-description active' : 'ttk-scm-tj-init-setting-form-bar-step-description' }}",
							children: ['绑定成功']
						}]
					}]
				},
				{
					name: 'step1-tip',
					className: 'step1-tip',
					component: "::div",
					_visible: '{{data.other.step==1}}',
					children: [{
						name: 'word',
						component: '::span',
						className: 'word',
						children: '注：连接服务器之前，请先在服务器端安装配置软件'
					},
					{
						name: 'btn',
						component: '::div',
						className: 'download',
						children: [{
							name: 'a',
							component: "::a",
							children: '下载配置软件',
							onClick: '{{$downloadSoftware}}'
						},
						{
							name: 'icon',
							component: 'Icon',
							className: 'operation',
							fontFamily: 'edficon',
							type: 'bangzhutishi',
							onClick: '{{$settingClick}}'
						}
						]
					}
					]
				},
				{
					name: 'step1',
					className: 'step-container step1-container',
					component: "::div",
					_visible: '{{data.other.step==1}}',
					children: [{
						name: 'software',
						component: '::div',
						className: 'software-row',
						children: [{
							name: 'appName',
							component: 'Form.Item',
							label: '财务软件',
							required: true,
							validateStatus: "{{data.other.error.appName? 'error':'success'}}",
							help: '{{data.other.error.appName}}',
							children: {
								name: 'appName',
								component: 'Select',
								placeholder: '对接产品',
								disabled: '{{data.other.action=="update"}}',
								value: '{{data.form.appName}}',
								style: {
									width: 126,
									marginRight: 10
								},
								children: {
									name: 'option',
									component: 'Select.Option',
									className: 'app-option',
									value: '{{data.other.app && data.other.app[_rowIndex].value }}',
									title: '{{data.other.app && data.other.app[_rowIndex].name }}',
									children: '{{data.other.app && data.other.app[_rowIndex].name }}',
									_power: 'for in data.other.app'
								},
								onChange: "{{function(value){$fieldotherChange('data.form.appName',value)}}}",
							}
						},
						{
							name: 'appVersion',
							component: 'Form.Item',
							label: '',
							required: true,
							validateStatus: "{{data.other.error.appVersion? 'error':'success'}}",
							help: '{{data.other.error.appVersion}}',
							children: {
								name: 'appVersion',
								component: 'Select',
								placeholder: '版本号',
								style: {
									width: 100,
									marginRight: 10
								},
								value: '{{data.form.appVersion}}',
								children: {
									name: 'option',
									component: 'Select.Option',
									className: 'appVersion-option',
									value: '{{data.other.appVersion && data.other.appVersion[_rowIndex].value }}',
									title: '{{data.other.appVersion && data.other.appVersion[_rowIndex].name }}',
									children: '{{data.other.appVersion && data.other.appVersion[_rowIndex].name }}',
									_power: 'for in data.other.appVersion'
								},
								onChange: "{{function(value){$fieldotherChange('data.form.appVersion',value)}}}",
							}
						},
						{
							name: 'dbVersion',
							component: 'Form.Item',
							label: '',
							required: true,
							validateStatus: "{{data.other.error.dbVersion? 'error':'success'}}",
							help: '{{data.other.error.dbVersion}}',
							children: {
								name: 'dbVersion',
								component: 'Select',
								placeholder: '数据库版本',
								style: {
									width: 160
								},
								value: '{{data.form.dbVersion}}',
								children: {
									name: 'option',
									component: 'Select.Option',
									className: 'dbVersion-option',
									value: '{{data.other.dbVersion && data.other.dbVersion[_rowIndex].value }}',
									title: '{{data.other.dbVersion && data.other.dbVersion[_rowIndex].name }}',
									children: '{{data.other.dbVersion && data.other.dbVersion[_rowIndex].name }}',
									_power: 'for in data.other.dbVersion'
								},
								onChange: "{{function(value){$fieldotherChange('data.form.dbVersion',value)}}}",
							}
						},
						]
					},
					{
						name: 'foreseeipport',
						component: '::div',
						className: 'ipport-row',
						children: [{
							name: 'foreseeClientHost',
							component: 'Form.Item',
							label: '配置软件地址',
							required: true,
							className: 'ipport-row-foreseeClientHost',
							validateStatus: "{{data.other.error.foreseeClientHost ? 'error':'success'}}",
							help: '{{data.other.error.foreseeClientHost}}',
							children: [{
								name: 'foreseeClientHost',
								component: 'Input',
								placeholder: "可输入内部IP",
								value: '{{data.form.foreseeClientHost}}',
								onChange: "{{function(e){$fieldotherChange('data.form.foreseeClientHost',e.target.value)}}}",
							}]
						},
						{
							name: 'foreseeClientPort',
							component: 'Form.Item',
							className: 'port-row',
							label: '端口号',
							required: true,
							validateStatus: "{{data.other.error.foreseeClientPort? 'error':'success'}}",
							help: '{{data.other.error.foreseeClientPort}}',
							children: [{
								name: 'foreseeClientPort',
								component: 'Input',
								//maxlength: 5,
								placeholder: "端口号",
								value: '{{data.form.foreseeClientPort}}',
								onChange: "{{function(e){$fieldotherChange('data.form.foreseeClientPort',e.target.value)}}}",
							}]
						},
						]
					},
					{
						name: 'dbUsername',
						component: 'Form.Item',
						label: '数据库用户名',
						required: true,
						validateStatus: "{{data.other.error.dbUsername? 'error':'success'}}",
						help: '{{data.other.error.dbUsername}}',
						children: [{
							name: 'dbUsername',
							component: 'Input',
							placeholder: "用户名",
							value: '{{data.form.dbUsername}}',
							onChange: "{{function(e){$fieldotherChange('data.form.dbUsername',e.target.value)}}}",
						}]
					},
					{
						name: 'test',
						className: 'test-row',
						component: '::div',
						children: [{
							name: 'dbPassword',
							component: 'Form.Item',
							label: '数据库密码',
							required: true,
							validateStatus: "{{data.other.error.dbPassword?'error':'success'}}",
							help: '{{data.other.error.dbPassword}}',
							children: [{
								name: 'dbPassword',
								component: 'Input',
								placeholder: "密码",
								type: 'password',
								value: '{{data.form.dbPassword}}',
								onChange: "{{function(e){$fieldotherChange('data.form.dbPassword',e.target.value)}}}",
							}]
						},
						{
							name: 'dbPassword',
							component: 'Form.Item',
							label: '',
							required: true,
							children: [{
								name: 'dbPassword',
								component: 'Button',
								className: 'testButton',
								//type: 'primary',
								onClick: '{{$dbTest}}',
								children: '测试连接'
							}]
						},
						]
					},

					{
						name: 'moreInfo',
						component: '::div',
						className: 'tj-init-setting-more',
						children: [{
							name: 'more',
							component: '::span',
							className: 'app-asset-card-more-ico',
							children: [{
								name: 'left',
								component: '::span',
								style: {
									fontSize: 12
								},
								children: '高级'
							}, {
								name: 'icon',
								component: 'Icon',
								className: 'operation',
								showStyle: 'showy',
								fontFamily: 'edficon',
								type: '{{data.other.moreInfo ? "shang" : "xia"}}',
								style: {
									fontSize: 26
								},
							}],
							onClick: '{{$moreClick}}'
						}]
					},
					{
						name: 'bsipport',
						component: '::div',
						_visible: '{{data.other.moreInfo==true&&data.form.appName=="Tplus"}}',
						className: 'ipport-row',
						children: [{
							name: 'bsAppHost',
							component: 'Form.Item',
							label: '财务软件访问地址',
							//	required: true,
							//	validateStatus: "{{data.other.error.bsAppHost ? 'error':'success'}}",
							//	help: '{{data.other.error.dbHost}}',
							children: [{
								name: 'bsAppHost',
								component: 'Input',
								placeholder: "财务软件访问地址",
								value: '{{data.form.bsAppHost}}',
								onChange: "{{function(e){$fieldotherChange('data.form.bsAppHost',e.target.value)}}}",
							}]
						},
						{
							name: 'bsAppPort',
							component: 'Form.Item',
							className: 'port-row',
							label: '端口号',
							//required: true,
							validateStatus: "{{data.other.error.bsAppPort? 'error':'success'}}",
							help: '{{data.other.error.bsAppPort}}',
							children: [{
								name: 'bsAppPort',
								component: 'Input',
								//maxlength: 4,
								placeholder: "端口号",
								value: '{{data.form.bsAppPort}}',
								onChange: "{{function(e){$fieldotherChange('data.form.bsAppPort',e.target.value)}}}",
							}]
						},
						]
					},
					{
						name: 'dbipport',
						component: '::div',
						_visible: '{{data.other.moreInfo==true}}',
						className: 'ipport-row',
						children: [{
							name: 'dbHost',
							component: 'Form.Item',
							label: '财务软件数据库地址',
							//required: true,
							//validateStatus: "{{data.other.error.dbHost ? 'error':'success'}}",
							//help: '{{data.other.error.dbHost}}',
							children: [{
								name: 'dbHost',
								component: 'Input',
								placeholder: "财务软件数据库地址",
								value: '{{data.form.dbHost}}',
								onChange: "{{function(e){$fieldotherChange('data.form.dbHost',e.target.value)}}}",
							}]
						},
						{
							name: 'dbPort',
							component: 'Form.Item',
							className: 'port-row',
							label: '端口号',
							//required: true,
							validateStatus: "{{data.other.error.dbPort? 'error':'success'}}",
							help: '{{data.other.error.dbPort}}',
							children: [{
								name: 'dbPort',
								component: 'Input',
								//maxlength: 4,
								placeholder: "端口号",
								value: '{{data.form.dbPort}}',
								onChange: "{{function(e){$fieldotherChange('data.form.dbPort',e.target.value)}}}",
							}]
						},
						]
					},
					]
				},
				{
					name: 'step2',
					className: 'step-container step2-container',
					component: "::div",
					_visible: '{{data.other.step==2}}',
					children: [{
						name: 'appUserName',
						component: 'Form.Item',
						label: '用户名',
						className: 'appUser',
						required: true,
						validateStatus: "{{data.other.error.appUserName?'error':'success'}}",
						help: '{{ data.other.error.appUserName}}',
						children: [{
							name: 'appUserName',
							component: 'Input',
							disabled: '{{data.other.action=="update"}}',
							style: {
								width: 298
							},
							value: '{{data.form.appUserName}}',
							onChange: "{{function(e){$fieldotherChange('data.form.appUserName',e.target.value)}}}",
							onBlur: '{{$handleBlur}}'
						}]
					},
					{
						name: 'appPassword',
						component: 'Form.Item',
						label: '密码',
						_visible: '{{data.form.appName=="Tplus"}}',
						//required: true,
						className: 'appUser',
						//validateStatus: "{{data.other.error.appPassword ? 'error':'success'}}",
						//help: '{{data.other.error.appPassword}}',
						children: [{
							name: 'appPassword',
							component: 'Input',
							disabled: '{{data.other.action=="update"}}',
							style: {
								width: 298
							},
							type: 'password',
							value: '{{data.form.appPassword}}',
							onChange: "{{function(e){$fieldotherChange('data.form.appPassword',e.target.value)}}}",
							onBlur: '{{$handleBlur}}'
						}]
					},
					{
						name: 'appAccountNumber',
						component: 'Form.Item',
						label: '账套',
						required: true,
						validateStatus: "{{data.other.error.appAccountNumber?'error':'success'}}",
						help: '{{data.other.error.appAccountNumber}}',
						children: [{
							name: 'appAccountNumber',
							component: 'Select',
							disabled: '{{data.other.action=="update"}}',
							style: {
								width: 298
							},
							value: '{{data.form.appAccountNumber}}',
							onChange: "{{function(value){$fieldotherChange('data.form.appAccountNumber',value)}}}",
							children: {
								name: 'option',
								component: 'Select.Option',
								className: 'app-option',
								value: '{{data.other.accoutList && data.other.accoutList[_rowIndex].accNum }}',
								title: '{{data.other.accoutList && data.other.accoutList[_rowIndex].accName }}',
								children: '{{data.other.accoutList && data.other.accoutList[_rowIndex].accName }}',
								_power: 'for in data.other.accoutList'
							}
						}]
					},
					]
				},
				{
					name: 'step3',
					className: 'step-container step3',
					component: "::div",
					_visible: '{{data.other.step==3}}',
					children: [{
						name: 'success',
						className: 'success',
						component: '::div',
						children: [{
							name: 'successIcon',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'chenggongtishi'
						},
						{
							name: 'success',
							component: "::span",
							children: '绑定成功！'
						}
						]
					},
					// {
					// 	name: 'info',
					// 	className: 'info',
					// 	component: '::div',
					// 	children: '对接信息'
					// },
					{
						name: 'appName',
						component: '::div',
						className: 'inforow',
						style: {
							marginTop: 17
						},
						children: [{
							name: 'title',
							component: '::span',
							children: "财务软件："
						},
						{
							name: 'value',
							component: '::span',
							children: [
								{
									name: 'span1',
									component: '::span',
									children: '{{data.form.appName}}'
								},
								{
									name: 'span2',
									component: '::span',
									_visible: '{{data.form.appVersion?true:false}}',
									children: 'V'
								},
								{
									name: 'span3',
									component: '::span',
									_visible: '{{data.form.appVersion?true:false}}',
									children: '{{data.form.appVersion}}'
								}
							]
						}]
					},
					{
						name: 'addressInfo',
						component: '::div',
						className: 'inforow',
						style: {
							marginTop: 17
						},
						children: [{
							name: 'title',
							component: '::span',
							style: {
								paddingRight: 12
							},
							children: "地址信息"
						}
						]
					},
					{
						name: 'clientHost',
						component: '::div',
						className: 'inforow',
						children: [{
							name: 'title',
							component: '::span',
							children: "配置软件地址："
						},
						{
							name: 'value',
							component: '::span',
							children: '{{data.form.foreseeClientHost+":"+data.form.foreseeClientPort}}'
						}]
					},
					{
						name: 'bsAppHost',
						component: '::div',
						className: 'inforow',
						_visible: '{{data.form.appName=="Tplus"}}',
						children: [{
							name: 'title',
							component: '::span',
							children: "财务软件访问地址："
						},
						{
							name: 'value',
							component: '::span',
							children: [
								{
									name: "span1",
									component: '::span',
									children: '{{data.form.bsAppHost&&data.form.bsAppHost}}'
								},
								{
									name: "span2",
									component: '::span',
									children: ':'
								},
								{
									name: "span3",
									component: '::span',
									children: '{{data.form.bsAppPort&&data.form.bsAppPort}}'
								}
							]
						}
						]
					},
					{
						name: 'dbHost',
						component: '::div',
						className: 'inforow',
						children: [{
							name: 'title',
							component: '::span',
							children: "财务软件数据库地址："
						},
						{
							name: 'value',
							component: '::span',
							children: [
								{
									name: "span1",
									component: '::span',
									children: '{{data.form.dbHost&&data.form.dbHost}}'
								},
								{
									name: "span2",
									component: '::span',
									children: ':'
								},
								{
									name: "span3",
									component: '::span',
									children: '{{data.form.dbPort&&data.form.dbPort}}'
								}
							]
							//children: '{{data.form.dbHost+":"+data.form.dbPort}}'
						}
						]
					},
					{
						name: 'accountInfo',
						component: '::div',
						className: 'inforow',
						style: {
							marginTop: 17,
						},
						children: [{
							name: 'title',
							component: '::span',
							style: {
								paddingRight: 12
							},
							children: "账套信息"
						}
						]
					},
					{
						name: 'username',
						component: '::div',
						className: 'inforow',
						children: [{
							name: 'title',
							component: '::span',
							children: "用户名："
						},
						{
							name: 'value',
							component: '::span',
							children: '{{data.form.appUserName}}'
						}
						]
					},
					{
						name: 'zt',
						component: '::div',
						className: 'inforow',
						children: [{
							name: 'title',
							component: '::span',
							children: "账套："
						},
						{
							name: 'value',
							component: '::span',
							children: '{{data.form.appAccountName}}'
						}
						]
					},
					]
				},
				{
					name: 'reRefreshTime',
					component: '::a',
					className: 'refresh-time',
					_visible: '{{data.reRefreshTime!==undefined&&data.reRefreshTime>0 && data.other.step==3}}',
					children: '{{"返回首页 (" + data.reRefreshTime + ")"}}',
					onClick: '{{ $returnPortal }}'
				},
				{
					name: 'footer',
					component: '::div',
					className: 'ttk-scm-tj-init-setting-footer',
					children: [{
						name: 'btnGroup',
						component: '::div',
						className: 'ttk-scm-tj-init-setting-footer-btnGroup',
						children: [{
							name: 'update',
							component: 'Button',
							_visible: '{{data.other.step ==3&&data.other.action=="add"}}',
							className: 'ttk-scm-tj-init-setting-footer-btnGroup-item cancel',
							children: "修改地址",
							onClick: '{{$updateIp}}',
						},
						{
							name: 'cancelUpdate',
							component: 'Button',
							_visible: '{{data.other.step<3 &&data.other.action=="update"}}',
							className: 'ttk-scm-tj-init-setting-footer-btnGroup-item cancel',
							children: "取消修改",
							onClick: '{{$load}}',
						},
						{
							name: 'cancel',
							component: 'Button',
							_visible: '{{data.other.step >=2}}',
							className: '{{ data.other.step==3 ? "ttk-scm-tj-init-setting-footer-btnGroup-item cancel" : "ttk-scm-tj-init-setting-footer-btnGroup-item" }}',
							children: "{{data.other.step==3? '解除绑定' : '上一步'}}",
							onClick: '{{$backLastStep}}',
						},
						{
							name: 'confirm',
							component: 'Button',
							className: 'ttk-scm-tj-init-setting-footer-btnGroup-item',
							type: 'primary',
							children: "{{data.other.step==3? '关闭':'下一步'}}",
							onClick: '{{$nextStep}}'
						}
						]
					}]
				},
				]
			}
		},

	}
}

export function getInitState(option) {

	let state = {
		data: {
			form: {
				appName: undefined,
				appVersion: undefined,
				dbVersion: undefined,
				dbHost: null,
				dbPort: null,
				dbUsername: null,
				dbPassword: null,
				bsAppHost: null,
				bsAppPort: null,
				foreseeClientHost: null,
				foreseeClientPort: '8867',
				appUserName: null,
				appPassword: null,
				appAccountNumber: null,
				appLoginDate: null,
				ttkUserName: null,
				ttkPassword: null,
				ttkOrgId: null,
				ttkLoginDate: null
			},
			other: {
				moreInfo: false,
				step: 1,
				action: 'add',
				hasbind: false, //是否已经绑定
				isCommon: true,
				error: {
					appName: null,
					appVersion: null,
					dbVersion: null,
					dbHost: null,
					dbPort: null,
					dbUsername: null,
					dbPassword: null,
					bsAppHost: null,
					bsAppPort: null,
					foreseeClientHost: null,
					foreseeClientPort: null,
					appUserName: null,
					appPassword: null,
					appAccountNumber: null,
					appLoginDate: null,
					ttkUserName: null,
					ttkPassword: null,
					ttkOrgId: null,
					ttkLoginDate: null,
					appAccountName: null,
				},
				accoutList: [],
				appVersion: [],
				appVersionArr: [
				],
				dbVersion: [],
				app: [
					{
						name: 'T+',
						value: 'Tplus',
						appVersion: [
							{
								name: '12.2',
								value: '12.2',
								dbVersion: [
									{
										name: 'SQL Server 2005 SP2',
										value: 'SQLServer2005SP2',
									},
									{
										name: 'SQL Server 2008 R2',
										value: 'SQLServer2008R2'

									},
									{
										name: 'SQL Server 2012',
										value: 'SQLServer2012'

									},
									{
										name: 'SQL Server 2016',
										value: 'SQLServer2016',
									}
								]
							},
							{
								name: '12.3',
								value: '12.3',
								dbVersion: [
									{
										name: 'SQL Server 2008 R2',
										value: 'SQLServer2008R2'
									},
									{
										name: 'SQL Server 2012',
										value: 'SQLServer2012'
									},
									{
										name: 'SQL Server 2014',
										value: 'SQLServer2014'
									},
									{
										name: 'SQL Server 2016',
										value: 'SQLServer2016'
									}
								]
							},
							{
								name: '13.0',
								value: '13.0',
								dbVersion: [
									{
										name: 'SQL Server 2008 R2',
										value: 'SQLServer2008R2'
									},
									{
										name: 'SQL Server 2012',
										value: 'SQLServer2012'
									},
									{
										name: 'SQL Server 2014',
										value: 'SQLServer2014'
									},
									{
										name: 'SQL Server 2016',
										value: 'SQLServer2016'
									},
									{
										name: 'SQL Server 2017',
										value: 'SQLServer2017'
									}
								]
							}
						]
					},
					{
						name: 'T3标准版',
						value: 'T3标准版',
						appVersion: [
							{

								name: '10.8.2',
								value: '10.8.2',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'MSDE 2000',
										value: 'MSDE2000'
									}
								]
							},
							{

								name: '10.9',
								value: '10.9',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'MSDE 2000',
										value: 'MSDE2000'
									}
								]
							},
							{

								name: '11.0',
								value: '11.0',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'MSDE 2000',
										value: 'MSDE2000'
									}
								]
							},
							{

								name: '11.1',
								value: '11.1',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'MSDE 2000',
										value: 'MSDE2000'
									}
								]
							},
							{

								name: '11.2',
								value: '11.2',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'MSDE 2000',
										value: 'MSDE2000'
									}
								]
							},

						]
					},
					{
						name: 'T3普及版',
						value: 'T3普及版',
						appVersion: [
							{

								name: '10.8.2',
								value: '10.8.2',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'MSDE 2000',
										value: 'MSDE2000'
									}
								]
							},
							{

								name: '10.9',
								value: '10.9',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'MSDE 2000',
										value: 'MSDE2000'
									}
								]
							},
							{

								name: '11.0',
								value: '11.0',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'MSDE 2000',
										value: 'MSDE2000'
									}
								]
							},
							{

								name: '11.1',
								value: '11.1',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'MSDE 2000',
										value: 'MSDE2000'
									}
								]
							},
							{

								name: '11.2',
								value: '11.2',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'MSDE 2000',
										value: 'MSDE2000'
									}
								]
							},
						]
					},
					{

						name: 'T6',
						value: 'T6',
						appVersion: [
							{

								name: '6.2.1',
								value: '6.2.1',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'SQL Server 2008R2',
										value: 'SQLServer2008R2'
									},
									{
										name: 'MSDE 2000',
										value: 'MSDE2000'
									}
								]
							},
							{

								name: '6.3',
								value: '6.3',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'SQL Server 2008 R2',
										value: 'SQLServer2008R2'
									},
									{
										name: 'MSDE 2000',
										value: 'MSDE2000'
									}
								]
							},
							{

								name: '6.5',
								value: '6.5',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'SQL Server 2008 R2',
										value: 'SQLServer2008R2'
									},
									{
										name: 'MSDE 2000',
										value: 'MSDE2000'
									}
								]
							},
							{

								name: '7.0',
								value: '7.0',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'SQL Server 2008 R2',
										value: 'SQLServer2008R2'
									},
									{
										name: 'MSDE 2000',
										value: 'MSDE2000'
									}
								]
							},
							{

								name: '7.1',
								value: '7.1',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'SQL Server 2008 R2',
										value: 'SQLServer2008R2'
									},
									{
										name: 'MSDE 2000',
										value: 'MSDE2000'
									}
								]
							},
						]
					},
					{
						id: 6,
						name: 'K3WISE',
						value: 'K3WISE',
						appVersion: [
							{

								name: '13.0',
								value: '13.0',
								dbVersion: [
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'SQL Server 2012',
										value: 'SQLServer2012'
									}
								]
							},
							{

								name: '13.1',
								value: '13.1',
								dbVersion: [
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'SQL Server 2012',
										value: 'SQLServer2012'
									}
								]
							},
							{

								name: '14.0',
								value: '14.0',
								dbVersion: [
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'SQL Server 2012',
										value: 'SQLServer2012'
									}
								]
							},
							{

								name: '14.1',
								value: '14.1',
								dbVersion: [
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'SQL Server 2012',
										value: 'SQLServer2012'
									}
								]
							},
							{

								name: '14.2',
								value: '14.2',
								dbVersion: [
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'SQL Server 2012',
										value: 'SQLServer2012'
									}
								]
							},
							{

								name: '14.3',
								value: '14.3',
								dbVersion: [
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'SQL Server 2012',
										value: 'SQLServer2012'
									},
									{
										name: 'SQL Server 2014',
										value: 'SQLServer2014'
									},
									{
										name: 'SQL Server 2016',
										value: 'SQLServer2016'
									}
								]
							},
							{

								name: '15.0',
								value: '15.0',
								dbVersion: [
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'SQL Server 2012',
										value: 'SQLServer2012'
									},
									{
										name: 'SQL Server 2014',
										value: 'SQLServer2014'
									},
									{
										name: 'SQL Server 2016',
										value: 'SQLServer2016'
									}
								]
							},
						]
					},
					{
						id: 7,
						name: 'KIS专业版',
						value: 'KIS专业版',
						appVersion: [
							{

								name: '14.0',
								value: '14.0',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'SQL Server 2008 R2',
										value: 'SQLServer2008R2'
									},
									{
										name: 'SQL Server 2012',
										value: 'SQLServer2012'
									}
								]
							},
							{

								name: '14.1',
								value: '14.1',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'SQL Server 2008 R2',
										value: 'SQLServer2008R2'
									},
									{
										name: 'SQL Server 2012',
										value: 'SQLServer2012'
									}
								]
							},
							{

								name: '15.0',
								value: '15.0',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'SQL Server 2008 R2',
										value: 'SQLServer2008R2'
									},
									{
										name: 'SQL Server 2012',
										value: 'SQLServer2012'
									}
								]
							},
							{

								name: '15.1',
								value: '15.1',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'SQL Server 2008 R2',
										value: 'SQLServer2008R2'
									},
									{
										name: 'SQL Server 2012',
										value: 'SQLServer2012'
									}
								]
							},
						]
					},
					{
						id: 8,
						name: 'KIS旗舰版',
						value: 'KIS旗舰版',
						appVersion: [
							{

								name: '4.2',
								value: '4.2',
								dbVersion: [
									{

										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{

										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
								]
							},
							{

								name: '5.0',
								value: '5.0',
								dbVersion: [
									{

										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{

										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'SQL Server 2012',
										value: 'SQLServer2012'
									},
								]
							},
							{

								name: '6.0',
								value: '6.0',
								dbVersion: [
									{

										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{

										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'SQL Server 2012',
										value: 'SQLServer2012'
									},
								]
							},
						]
					},
					{
						id: 9,
						name: 'KIS商贸版',
						value: 'KIS商贸版',
						appVersion: [

							{

								name: '7.0',
								value: '7.0',
								dbVersion: [
									{

										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{

										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{

										name: 'SQL Server 2008 R2',
										value: 'SQLServer2008R2'
									},
									{

										name: 'SQL Server 2012',
										value: 'SQLServer2012'
									}
								]
							},
							{

								name: '8.0',
								value: '8.0',
								dbVersion: [
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
									{
										name: 'SQL Server 2008 R2',
										value: 'SQLServer2008R2'
									},
									{
										name: 'SQL Server 2012',
										value: 'SQLServer2012'
									}
								]
							},
						]
					},
					{
						id: 10,
						name: 'U8',
						value: 'U8',
						appVersion: [
							{

								name: '10.1',
								value: '10.1',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
								]
							},
							{

								name: '11.0',
								value: '11.0',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{

										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
								]
							},
							{

								name: '12.0',
								value: '12.0',
								dbVersion: [
									{
										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{
										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{
										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
								]
							},
							{

								name: '12.1',
								value: '12.1',
								dbVersion: [
									{

										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{

										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{

										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
								]
							},
							{

								name: '12.51',
								value: '12.51',
								dbVersion: [
									{

										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{

										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{

										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
								]
							},
							{

								name: '13.0',
								value: '13.0',
								dbVersion: [
									{

										name: 'SQL Server 2000',
										value: 'SQLServer2000'
									},
									{

										name: 'SQL Server 2005',
										value: 'SQLServer2005'
									},
									{

										name: 'SQL Server 2008',
										value: 'SQLServer2008'
									},
								]
							},
						]
					}
				]
			},
			loading: true,
			reRefreshTime: undefined
		}
	}
	return state
}