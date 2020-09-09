export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-personaltaxcode',
		children: [{
			name: 'root-content',
			component: 'Layout',
			className: 'ttk-es-app-personaltaxcode-backgroundColor',
			children: [ {
				name: 'content',
				component: 'Layout',
				className: 'ttk-es-app-personaltaxcode-content',
				children: [{
					name: 'dataGrid',
					component: 'DataGrid',
					ellipsis: true,
					headerHeight: 37,
					rowHeight: 37,
					isColumnResizing: false,
					className: '{{$heightCount()}}',
					rowsCount: '{{$getListRowsCount()}}',
					columns: [{
						name: 'name',
						component: 'DataGrid.Column',
						columnKey: 'name',
						width: 120,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '客户名称'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							className: 'mk-datagrid-cellContent-left',
							value: '{{data.list[_rowIndex].dlxxName}}',
							_power: '({rowIndex})=>rowIndex'
						}
					}, {
						name: 'loginType',
						component: 'DataGrid.Column',
						columnKey: 'loginType',
						width: 120,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '登录方式'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							children:[{
								name: 'typeSelect',
								component: 'Select',
								className:'ant-input-affix-wrapper',
								value: "{{data.list[_rowIndex].gsslfs ? data.list[_rowIndex].gsslfs : '3'}}",
								placeholder:'请选择',
								children:{
									name:'option',
									component:'::Select.Option',
									children:'{{data.loginTypeOptionData[_lastIndex].name}}',
									value:'{{data.loginTypeOptionData[_lastIndex].code}}',
									_power:'for in data.loginTypeOptionData'
								},
								onChange: "{{function(id){$loginTypeChange(id,_rowIndex)}}}",
							}],
							_power: '({rowIndex})=>rowIndex'
						}
					}, {
						name: 'gsAccount',
						component: 'DataGrid.Column',
						columnKey: 'gsAccount',
						width: 120,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '个税账号'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							children:[{
								name:'gsInput',
								component:'Input',
                                className: "{{(data.list[_rowIndex].validateStatus && !data.list[_rowIndex].gssmzh) ? 'has-error' : ''}}",
								type:'text',
								visibilityToggle:false,//是否显示切换按钮
								placeholder: '请输入证件号/手机号/用户名',
								value:"{{data.list[_rowIndex].gssmzh}}",
								onChange:'{{function(e) {return $changegText(e, _rowIndex,"gssmzh")}}}',
								style: "{{(data.list[_rowIndex].gsslfs === '1') ? {display: 'inline-block'} : {display: 'none'}}}"
								//style: { display: ("{{data.list[_rowIndex].dlfs}}" == "0" ? "inline-block" : "none")}
							  }
							],
							 _power: '({rowIndex})=>rowIndex'
						}
					}, {
						name: 'pwd',
						component: 'DataGrid.Column',
						columnKey: 'value',
						width: 137,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '个税密码'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							children:[{
								name:'sptitle1',
								component:'Input',
                                className: "{{(data.list[_rowIndex].validateStatus && !data.list[_rowIndex].gssbmm) ? 'ttk-es-app-personaltaxcode-content-password has-error' : (data.list[_rowIndex].mw1 ? 'ttk-es-app-input' : 'ttk-es-app-personaltaxcode-content-password')}}",
								type:'password',
								placeholder: '请输入个税申报密码',
								timeout: true,
								autoComplete:'new-password',
								value:"{{data.list[_rowIndex].mw1 ? data.list[_rowIndex].gssbmm : data.list[_rowIndex].gssbmm1}}",
								onChange:'{{function(e) {return $changegText(e, _rowIndex,"gssbmm")}}}',
								onKeyDown:'{{function(e) {return $keyDownText(_rowIndex,"mw1")}}}',
								style: "{{(data.list[_rowIndex].gsslfs === '2') ? {display: 'inline-block'} : {display: 'none'}}}"
							  },{
								name: 'gsPassword',
								component: 'Input',
								type:'password',
								placeholder:'请输入自然人系统个税密码',
								timeout: true,
								autoComplete:'new-password',
								className: "{{(data.list[_rowIndex].validateStatus && !data.list[_rowIndex].gssmmm) ? 'ttk-es-app-personaltaxcode-content-password has-error' : (data.list[_rowIndex].mw2 ? 'ttk-es-app-input' : 'ttk-es-app-personaltaxcode-content-password')}}",
								value: '{{data.list[_rowIndex].mw2 ? data.list[_rowIndex].gssmmm : data.list[_rowIndex].gssmmm1}}',
								onChange: '{{function(e) {return $changegText(e,_rowIndex,"gssmmm")}}}',
								onKeyDown:'{{function(e) {return $keyDownText(_rowIndex,"mw2")}}}',
								style: "{{(data.list[_rowIndex].gsslfs === '1') ? {display: 'inline-block'} : {display: 'none'}}}"
							  }
							//   {
							// 	name:'shiming',
							// 	component:'Input',
                            //     className: "{{(data.list[_rowIndex].validateStatus && !data.list[_rowIndex].gssmmm) ? 'ttk-es-app-personaltaxcode-content-password has-error' : 'ttk-es-app-personaltaxcode-content-password'}}",
							// 	type:'{{data.list[_rowIndex].passwordType}}',
							// 	visibilityToggle: true,//是否显示切换按钮
							// 	placeholder: '请输入自然人系统个税密码',
							// 	value:"{{data.list[_rowIndex].gssmmm}}",
							// 	onChange:'{{function(e) {return $changegText(e, _rowIndex,"gssmmm")}}}',
							// 	onBlur:'{{function(e) {return $handleBlur(e, _rowIndex)}}}',
							// 	style: "{{(data.list[_rowIndex].gsslfs === '1') ? {display: 'inline-block'} : {display: 'none'}}}"
							//   }
							],
							 _power: '({rowIndex})=>rowIndex'
						}
					} ]
				}]
			}]
		}, {
			name: 'footer',
			component: '::div',
			className: 'ttk-es-app-personaltaxcode-footer',
			children: [
				{
				name: 'btnGroup',
				component: 'Layout',
				className: 'ttk-es-app-personaltaxcode-footer-center',
				children: [{
					name:'tips',
					component:'::div',
					className:'ttk-es-app-personaltaxcode-footer-center-tips',
					children:[{
						name:'tips0',
						component:'::p',
						children:[{
							name:'sptitle1',
							component:'::span',
							className:'ttk-es-app-personaltaxcode-footer-center-tips-sptitletips',
							children:"温馨提示："
						},
					   ]
					 },
					 {
						name:'tips1',
						component:'::p',
						children: '1、实名登录，请输入已取得办税授权的实名制个税账号和个税密码，支持身份证件号码、手机号码、用户名；'
					  },
					  {
						name:'tips2',
						component:'::p',
						children: '2、申报密码登录，请输入个税密码，即自然人系统个税申报密码；'
					  },
					 {
						name:'tips3',
						component:'::p',
						children: '3、新开业客户，请先到“自然人系统”修改密码。'
					  },
					//  {
					//    name:'tips2',
					//    component:'::p',
					//    children:[{
					// 			name:'sptitle11',
					// 			component:'::span',
					// 			className:'ttk-es-app-personaltaxcode-footer-center-tips-sptitletips',
					// 			children:""
					// 		},{
					// 			name:'sptitle12',
					// 			component:'::span',
					// 			children:"2、新开业客户，请先到“自然人系统”修改密码"
					// 		} 
					// 	]
					//  },
					 {
						name:'btnsave',
						component:'::div',
						className:'ttk-es-app-personaltaxcode-footer-center-footerbtn',
						children:[
							{
								name: 'add',
								component: 'Button',
								children: '保存',
								type: 'primary',
								className: 'ttk-es-app-personaltaxcode-footer-center-footerbtn-btn',
								onClick: '{{$addClick}}'
							}
						]
					  }
					]
				   }]
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			list: [],
			loginTypeOptionData:[]
		}
	};
}
