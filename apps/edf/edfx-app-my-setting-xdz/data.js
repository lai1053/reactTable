export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'edfx-app-my-setting-xdz',
		children: [{
			name: 'main',
			component: 'Tabs',
			className: 'edfx-app-org-xdz-main',
			animated: false,
			forceRender: false,
			activeKey: '{{data.other.activeTabKey}}',
			onChange: '{{$handleTabChange}}',
			children: [
			{
				name: 'tab1',
				component: 'Tabs.TabPane',
				forceRender: false,
				tab: '基本资料',
				className: 'jbzlTab',
				key: '1',
				children: [
					{
						name: 'basic',
						component: '::div',
						children: [{
							name: 'jbzlForm',
							component: 'Form',
							children: [{
								name: 'headSculpture',
								component: '::div',
								className: 'headSculpture',
								key: '{{data.other.imgKey}}',
								children: '{{$renderUploadImg()}}'
							},
							{
								name: 'line1',
								component: '::div',
								className: 'itemLine',
								children: [{
									name: 'nickname',
									component: 'Form.Item',
									colon: false,
									label: '姓名：',
									className: 'nickname',
									// validateStatus: "{{data.error.enableDate?'error':'success'}}",
									// help: '{{data.error.enableDate}}',
									required: '{{data.other.editState?true:false}}',
									children: [{
										name: 'popover',
										component: 'Popover',
										content: '{{data.other.message.nickname||""}}',
										// content: '{{data.other.message.nickname||""}}',
										placement: 'right',
										overlayClassName: 'helpPopover',
										defaultVisible: true,
										_visible: '{{data.other.editState&&data.other.message.nickname?true:false}}',
										children: [{
											name: 'input',
											component: 'Input',
											// disabled: '{{data.other.isReadOnly}}',
											_visible: '{{data.other.editState&&data.other.message.nickname?true:false}}',
											width: 228,
											className: 'formItemInput',
											value: '{{data.formData.nickname}}',
											onChange: '{{function(e){$setFormItem("data.formData.nickname", e.target.value)}}}',
										}]
									},{
										name: 'input',
										component: 'Input',
										// disabled: '{{data.other.isReadOnly}}',
										_visible: '{{data.other.editState?true:false}}',
										_visible: '{{data.other.editState&&!data.other.message.nickname?true:false}}',
										width: 228,
										className: 'formItemInput',
										value: '{{data.formData.nickname}}',
										onChange: '{{function(e){$setFormItem("data.formData.nickname", e.target.value)}}}',
									},{
										name: 'nicknametxt',
										component: '::div',
										className: 'formItemTxt',
										// disabled: '{{data.other.isReadOnly}}',
										_visible: '{{data.other.editState?false:true}}',
										children: '{{data.formData.nickname}}',
									}]
								}, {
									name: 'department',
									component: 'Form.Item',
									colon: false,
									label: '部门：',
									children: [{
										name: 'departmenttxt',
										component: '::div',
										className: 'formItemTxt',
										// disabled: '{{data.other.isReadOnly}}',
										children: '{{data.other.department}}',
									}]
								}]
							},{
								name: 'line2',
								component: '::div',
								className: 'itemLine',
								children: [{
									name: 'mobile',
									component: 'Form.Item',
									colon: false,
									label: '手机：',
									className: 'mobile',
									// validateStatus: "{{data.error.enableDate?'error':'success'}}",
									// help: '{{data.error.enableDate}}',
									required: '{{data.other.editState?true:false}}',
									children: [{
										name: 'input',
										component: 'Input',
										// disabled: '{{data.other.isReadOnly}}',
										_visible: '{{data.other.editState?true:false}}',
										width: 228,
										className: 'formItemInput formItemInputTel',
										value: '{{data.formData.mobile}}',
										// onChange: '{{function(e){$setField("data.basic.gssbmm", e.target.value)}}}',
									},{
										name: 'mobileButton',
										component: 'Button',
										_visible: '{{data.other.editState?true:false}}',
										width: 228,
										className: 'formItemInputButton',
										onClick: '{{$changeMobile}}',
										children: ' ',
									},{
										name: 'mobiletxt',
										component: '::div',
										className: 'formItemTxt',
										// disabled: '{{data.other.isReadOnly}}',
										_visible: '{{data.other.editState?false:true}}',
										children: '{{data.formData.mobile}}',
									}]
								},{
									name: 'email',
									component: 'Form.Item',
									colon: false,
									label: '邮箱：',
									className: 'email',
									// validateStatus: "{{data.error.enableDate?'error':'success'}}",
									// help: '{{data.error.enableDate}}',
									required: '{{data.other.editState?true:false}}',
									children: [{
											name: 'popover',
											component: 'Popover',
											content: '{{data.other.message.email||""}}',
											// content: '{{data.other.message.email||""}}',
											placement: 'right',
											overlayClassName: 'helpPopover',
											defaultVisible: true,
											_visible: '{{data.other.editState&&data.other.message.email?true:false}}',
											children: [{
											name: 'input',
											component: 'Input',
											// disabled: '{{data.other.isReadOnly}}',
											_visible: '{{data.other.editState&&data.other.message.email?true:false}}',
											width: 228,
											className: 'formItemInput',
											value: '{{data.formData.email}}',
											onChange: '{{function(e){$setFormItem("data.formData.email", e.target.value)}}}',
										}]
									},{
										name: 'input',
										component: 'Input',
										// disabled: '{{data.other.isReadOnly}}',
										_visible: '{{data.other.editState&&!data.other.message.email?true:false}}',
										width: 228,
										className: 'formItemInput',
										value: '{{data.formData.email}}',
										onChange: '{{function(e){$setFormItem("data.formData.email", e.target.value)}}}',
									},{
										name: 'emailtxt',
										component: '::div',
										className: 'formItemTxt',
										// disabled: '{{data.other.isReadOnly}}',
										_visible: '{{data.other.editState?false:true}}',
										children: '{{data.formData.email}}',
									}]
								}]
							},{
								name: 'line3',
								component: '::div',
								className: 'itemLine itemLineLast',
								children: [{
									name: 'positions',
									component: 'Form.Item',
									colon: false,
									label: '岗位：',
									className: 'positions',
									children: '{{$renderPositions( data.other.positions, data.other.editState )}}'
								}]
							}
							]
						}]

					}
				]
			}, {
				name: 'tab2',
				component: 'Tabs.TabPane',
				forceRender: false,
				className: 'xgmmTab',
				tab: '修改密码',
				key: '2',
				children: [{
					name: 'form',
					component: 'Form',
					className: 'changePassword',
					children: [{
						name: 'oldPassword',
						component: 'Form.Item',
						colon: false,
						label: '原密码：',
						validateStatus: "{{data.error.oldPassword?'error':'success'}}",
						help: '{{data.error.oldPassword}}',
						children: {
							name: 'input',
							component: 'Input',
							type: 'password',
							value: '{{data.tab2Form.oldPassword}}',
							placeholder: '请输入原密码',
							style: {width: '270px', height:'30px'},
							onFocus: '{{function() {$setField("data.error.oldPassword",undefined)}}}',
							// onBlur: `{{function (e){$fieldChange('data.tab2Form.oldPassword',e.target.value)}}}`,
							onBlur: `{{function (e){$setFormItem('data.tab2Form.oldPassword',e.target.value)}}}`,
						}
					}, {
						name: 'password',
						component: 'Form.Item',
						colon: false,
						label: '新密码：',
						validateStatus: "{{data.error.password?'error':'success'}}",
						help: '{{data.error.password}}',
						children: [{
							name: 'input',
							type: 'password',
							value: '{{data.tab2Form.password}}',
							placeholder: '请输入新密码',
							component: 'Input',
							style: {width: '270px', height:'30px'},
							onChange: `{{function(e){$setField('data.tab2Form.password',e.target.value)}}}`,
							onFocus: '{{function() {$setField("data.error.password",undefined)}}}',
							// onBlur: `{{function (e){$fieldChange('data.tab2Form.password',e.target.value)}}}`,
							onBlur: `{{function (e){$setFormItem('data.tab2Form.password',e.target.value)}}}`,
						},{
							name: 'passwordMassage',
							component: '::div',
							className: 'passwordMassage',
							children: '{{$getPasswordMassage()}}'

						}]
					}, {
						name: 'rePassword',
						component: 'Form.Item',
						colon: false,
						label: '确认新密码：',
						validateStatus: "{{data.error.rePassword?'error':'success'}}",
						help: '{{data.error.rePassword}}',
						children: {
							name: 'input',
							value: '{{data.tab2Form.rePassword}}',
							placeholder: "请确认新密码",
							type: 'password',
							component: 'Input',
							style: {width: '270px', height:'30px'},
							onChange: `{{function(e){$setField('data.tab2Form.rePassword',e.target.value)}}}`,
							onFocus: '{{function() {$setField("data.error.rePassword",undefined)}}}',
							// onBlur: `{{function (e){$fieldChange('data.tab2Form.rePassword',e.target.value)}}}`,
							onBlur: `{{function (e){$setFormItem('data.tab2Form.rePassword',e.target.value)}}}`,
						}
					}]
				}]
			}, {
				name: 'tab3',
				component: 'Tabs.TabPane',
				className: 'djjlTab',
				forceRender: false,
				tab: '登录记录',
				key: '3',
				children: [{
					name:'tab3Content',
					component: '::div',
					className: 'tab3Content',
					children: [{
						name: 'body',
						component: 'Table',
						className: 'tab3Content-table',
						bordered: true,
						pagination: false,
						scroll: '{{ {y: 416} }}',
						scroll: '{{$getTabScroll(3)}}',
						enableSequenceColumn: true,
						bordered: true,
						noCalculate: true,
						columns: '{{$renderTab3Columns()}}',
						dataSource: '{{data.tab3list}}'
					}]
				}]
			}, {
				name: 'tab4',
				component: 'Tabs.TabPane',
				forceRender: false,
				className: 'wdzjTab',
				tab: '我的中介',
				key: '4',
				children: [{
					name:'tab4Content',
					component: '::div',
					className: 'tab4Content',
					children: [{
						name: 'body',
						component: 'Table',
						className: 'tab4Content-table',
						bordered: true,
						pagination: false,
						scroll: '{{ {y: 416} }}',
						scroll: '{{$getTabScroll(4)}}',
						allowColResize: false,
						enableSequenceColumn: true,
						bordered: true,
						noCalculate: true,
						columns: '{{$renderColumns()}}',
						dataSource: '{{data.tab4list}}'
					}]
				}]
			}]
		},{
			name: 'tab1Footer',
			component: '::div',
			className: 'tab1Footer',
			_visible: '{{data.other.activeTabKey=="1"}}',
			children: [
				{
					name: 'tab1EditBtn',
					component: 'Button',
					type: 'primary',
					children: '编辑',
					_visible: '{{data.other.editState?false:true}}',
					onClick: '{{$handleTab1Edit}}',
					className: 'tab1EditBtn footerBtn',
				},
				{
					name: 'tab1SaveBtn',
					component: 'Button',
					type: 'primary',
					children: '保存',
					_visible: '{{data.other.editState?true:false}}',
					onClick: '{{$handleTab1Save}}',
					className: 'tab1EditBtn footerBtn',
				},
				{
					name: 'tab1CancelBtn',
					component: 'Button',
					children: '取消',
					onClick: '{{$handleCancel}}',
					className: 'tab1EditBtn footerBtn',
				}
			]
		},{
			name: 'tab2Footer',
			component: '::div',
			className: 'tab1Footer',
			_visible: '{{data.other.activeTabKey=="2"}}',
			children: [
				{
					name: 'tab1SaveBtn',
					component: 'Button',
					type: 'primary',
					children: '保存',
					onClick: '{{$handleTab2Save}}',
					className: 'tab1EditBtn footerBtn',
				},
				{
					name: 'tab1CancelBtn',
					component: 'Button',
					children: '取消',
					onClick: '{{$handleCancel}}',
					className: 'tab1EditBtn footerBtn',
				}
			]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			// form: { sex: '0' },
			// other: {
			// 	error: {

			// 	}
			// }
			headSculptureUrl: './img/defaultImg.png',
			formData: {
			},
			tab2Form: {

			},
			tab3list: [
			],
			tab4list: [
			],
			other: {
				activeTabKey: '1',
				editState: false,
				positions: [],
				imgKey: Math.random(),
				message: {

				}
			},
			error: {

			}
		}
	}
}