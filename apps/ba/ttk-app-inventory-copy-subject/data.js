export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-app-inventory-copy-subject',
		children: [{
			name: 'header',
			component: '::div',
			className: 'ttk-app-inventory-copy-subject-header',
			children:[{
				name: 'step1',
				component: '::div',
				children: [{
					name: 'step0',
					component: '::span',
					_visible: '{{data.other.tab1}}',
					style: {marginRight: '8px'},
					children: '①'
				},{
					name: 'step00',
					component: 'Icon',
					type: 'check',
					_visible: '{{!data.other.tab1}}',
					style: {marginRight: '8px'}
				}, '选择存货业务'],
				className: 'step step1',
			},{
				name: 'san1',
				component: '::div',
				children: '',
				className: 'san san1',
			},{
				name: 'san2',
				component: '::div',
				children: '',
				className: 'san san2',
			},{
				name: 'step2',
				component: '::div',
				children: [{
					name: 'step11',
					component: '::span',
					children: '②',
					style: {marginRight: '8px'},
				},{
					name: 'step22',
					component: '::span',
					children: '配置存货参数'
				}],
				className: '{{data.other.tab1 ? "step step2" : "step step2-select"}}',
			}]
		},{
			name: 'body',
			component: '::div',
			children:[{
				name: 'text1',
				component: '::div',
				className: 'ttk-app-inventory-copy-subject-body',
				_visible: '{{data.other.tab1}}',
				children: [{
					name: 'text1-account',
					component: 'Form.Item',
					label: '存货科目',
					children: {
						name: 'account',
						component: 'Select',
						placeholder: '请选择存货科目',
						filterOptionExpressions: 'code,name,helpCode,helpCodeFull',
						value: '{{data.form.accountId}}',
						onChange: `{{function(v){$sf("data.form.accountId", v)}}}`,
						children: {
							name: 'selectItem',
							component: 'Select.Option',
							value: '{{data.glAccounts[_rowIndex].id}}',
							children: `{{data.glAccounts[_rowIndex].code + " " + data.glAccounts[_rowIndex].gradeName}}`,
							disabled: '{{data.glAccounts[_rowIndex].generatedInve}}',
							title: `{{data.glAccounts[_rowIndex].code + " " + data.glAccounts[_rowIndex].gradeName}}`,
							_power: 'for in data.glAccounts'
						}
					}
				},{
					name: 'text1-name',
					component: 'Form.Item',
					label: '存货名称',
					children: [{
						name: 'name',
						component: 'Radio.Group',
						value: '{{data.form.inventoryName}}',
						onChange: '{{function(e){$sf("data.form.inventoryName", e.target.value)}}}',
						children: {
							name: 'option',
							component: 'Radio',
							value: '{{data.inventoryName[_rowIndex].id}}',
							children: '{{data.inventoryName[_rowIndex].name}}',
							_power: 'for in data.inventoryName'
						}
					}]
				},
				{
					name: 'text1-specification',
					component: 'Form.Item',
					label: '规格型号',
					children: [{
						name: 'check',
						component: 'Checkbox',
						disabled: '{{data.form.inventoryName != "1"}}',
						checked: '{{data.form.inventoryName != "1" ? 1 : data.form.specification}}',
						onChange: '{{function(e){$sf("data.form.specification", e.target.checked)}}}',
						children: '末级科目'
					}]
				},
				{
					name: 'text1-balance',
					component: 'Form.Item',
					label: '同步科目余额',
					children: [{
						name: 'check',
						component: 'Checkbox',
						checked: '{{data.form.tongbu}}',
						// disabled: '{{data.isJieZhuan}}',
						disabled: true,
						onChange: '{{function(e){$sf("data.form.tongbu", e.target.checked)}}}',
						children: '是否将科目余额同步到存货期初'
					}]
				}]
			},{
				name: 'text2',
				component: '::div',
				className: 'ttk-app-inventory-copy-subject-body2',
				_visible: '{{!data.other.tab1}}',
				children: [{
					name: 'update',
					component: '::div',
					className: 'body2-btn',
					children: [{
						name: 'update1',
						component: 'Button',
						children: '批设计量单位',
						onClick: '{{$updateUnit}}'
					}]
				},{
					name: 'dataGrid',
					component: 'DataGrid',
					ellipsis: true,
					headerHeight: 37,
					rowHeight: 37,
					isColumnResizing: false,
					// loading: '{{data.other.loading}}',
					className: 'body2-body',
					startSequence: '{{(data.pagination.currentPage-1)*data.pagination.pageSize + 1}}',
					rowsCount: '{{$getListRowsCount()}}',
					columns: [{
						name: 'select',
						component: 'DataGrid.Column',
						columnKey: 'operation',
						width: 34,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: [{
								name: 'chexkbox',
								component: 'Checkbox',
								checked: '{{$isSelectAll("dataGrid")}}',
								onChange: '{{$selectAll("dataGrid")}}'
							}]
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							_power: '({rowIndex})=>rowIndex',
							children: [{
								name: 'select',
								component: 'Checkbox',
								checked: '{{data.list[_rowIndex].selected}}',
								onChange: '{{$selectRow(_rowIndex)}}'
							}]
						}
					}, {
						name: 'code',
						component: 'DataGrid.Column',
						columnKey: 'code',
						width: 100,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '存货编码'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							className: 'mk-datagrid-cellContent-left',
							_power: '({rowIndex})=>rowIndex',
							children: '{{data.list[_rowIndex].code}}',
							title: '{{data.list[_rowIndex].code}}'
						}
					}, {
						name: 'name',
						component: 'DataGrid.Column',
						columnKey: 'name',
						flexGrow: 1,
						width: 100,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							className: 'ant-form-item-required',
							children: '存货名称'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							className: 'mk-datagrid-cellContent-left',
							tip: true,
							_power: '({rowIndex})=>rowIndex',
							children: [{
								name: 'name1',
								component: 'Input',
								onChange: '{{function(v){$changeList(_rowIndex, "name", v)}}}',
								value: '{{data.list[_rowIndex].name }}',
								title: '{{data.list[_rowIndex].name }}'
							}]
						}
					}, {
						name: 'specification',
						component: 'DataGrid.Column',
						columnKey: 'specification',
						width: 100,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '规格型号'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: 'mk-datagrid-cellContent-left',
							_power: '({rowIndex})=>rowIndex',
							children: [{
								name: 'name1',
								component: 'Input',
								value: '{{data.list[_rowIndex].specification }}',
								title: '{{data.list[_rowIndex].specification }}',
								onChange: '{{function(v){$changeList(_rowIndex, "specification", v)}}}'
							}]
						}
					}, {
						name: 'inventoryTypeName',
						component: 'DataGrid.Column',
						columnKey: 'inventoryTypeName',
						width: 100,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '存货类型'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: 'mk-datagrid-cellContent-left',
							_power: '({rowIndex})=>rowIndex',
							children: '{{data.list[_rowIndex].inventoryTypeName }}',
							title: '{{data.list[_rowIndex].inventoryTypeName }}'
						}
					}, {
						name: 'groupUnit',
						component: 'DataGrid.Column',
						columnKey: 'groupUnit',
						width: 100,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							className: 'ant-form-item-required',
							children: '计量单位组'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							// tip: true,
							className: 'body2-body-select',
							children: {
								name: 'unitId',
								component: 'Select',
								placeholder: '请选择计量单位组',
								filterOptionExpressions: 'code,name,groupName,helpCode,helpCodeFull',
								value: '{{data.list[_rowIndex].unitId}}',
								title: '{{data.list[_rowIndex].unitId}}',
								onChange: `{{function(v){$changeUnit(v, _rowIndex)}}}`,
								children: {
									name: 'selectItem',
									component: 'Select.Option',
									value: '{{data.other.unitList[_lastIndex].id}}',
									children: '{{data.other.unitList[_lastIndex].groupName}}',
									title: '{{data.other.unitList[_lastIndex].groupName}}',
									_power: 'for in data.other.unitList'
								}
							},
							_power: '({rowIndex})=>rowIndex'
						}
					}, {
						name: 'accountCodeAndName',
						component: 'DataGrid.Column',
						columnKey: 'accountCodeAndName',
						width: 100,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '存货科目'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: 'mk-datagrid-cellContent-left',
							_power: '({rowIndex})=>rowIndex',
							children: '{{data.list[_rowIndex].accountCodeAndName}}',
							title: '{{data.list[_rowIndex].accountCodeAndName}}'
						}
					}, {
						name: 'periodEndQuantity',
						component: 'DataGrid.Column',
						columnKey: 'periodEndQuantity',
						width: 90,
						_visible: '{{data.form.tongbu}}',
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '数量'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: 'mk-datagrid-cellContent-left',
							_power: '({rowIndex})=>rowIndex',
							children: '{{data.list[_rowIndex].periodEndQuantity}}',
							title: '{{data.list[_rowIndex].periodEndQuantity}}'
						}
					}, {
						name: 'periodEndPrice',
						component: 'DataGrid.Column',
						columnKey: 'periodEndPrice',
						width: 90,
						_visible: '{{data.form.tongbu}}',
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '单价'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: 'mk-datagrid-cellContent-left',
							_power: '({rowIndex})=>rowIndex',
							children: '{{data.list[_rowIndex].periodEndPrice}}',
							title: '{{data.list[_rowIndex].periodEndPrice}}'
						}
					}, {
						name: 'periodEndAmount',
						component: 'DataGrid.Column',
						columnKey: 'periodEndAmount',
						_visible: '{{data.form.tongbu}}',
						width: 90,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '金额'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: 'mk-datagrid-cellContent-left',
							_power: '({rowIndex})=>rowIndex',
							children: '{{data.list[_rowIndex].periodEndAmount}}',
							title: '{{data.list[_rowIndex].periodEndAmount}}'
						}
					}]
				}
				// ,{
				// 	name: 'footer',
				// 	component: '::div',
				// 	className: 'body2-footer',
				// 	children: [{
				// 		name: 'pagination',
				// 		component: 'Pagination',
				// 		showSizeChanger: true,
				// 		pageSizeOptions: ['50', '100', '200', '300'],
				// 		pageSize: '{{data.pagination.pageSize}}',
				// 		current: '{{data.pagination.current}}',
				// 		total: '{{data.pagination.total}}',
				// 		onChange: '{{$pageChanged}}',
				// 		onShowSizeChange: '{{$pageChanged}}'
				// 	}]
				// }
			]
			}]
		}, {
			name: 'footer1',
			component: '::div',
			className: 'ttk-app-inventory-copy-subject-footer',
			children:[{
				name: 'last',
				component: 'Button',
				children: '{{data.other.tab1 ? "下一步" : "上一步"}}',
				type: 'primary',
				onClick: '{{function(){$next(data.other.tab1)}}}'
			},{
				name: 'save',
				component: 'Button',
				children: '保存',
				_visible: '{{!data.other.tab1}}',
				onClick: '{{$onOk}}'
			},{
				name: 'cancel',
				component: 'Button',
				children: '取消',
				onClick: '{{$onCancel}}'
			}]
		}]
	}
}

export function getInitState() {
	return {
		data:{
			other:{
				tab1: true,
				unitList: [{id: 1, name: 'as'}],
				loading: false
			},
			list: [{groupUnit: ''}],
			pagination: {
				current: 1,
				total: 0,
				pageSize: 50
			},
			form: {
				inventoryName: 1,
				specification: 0,
				tongbu: false
			},
			glAccounts:[],
			inventoryName: [{
				id: 1,
				name: '末级科目'
			},{
				id: 2,
				name: '上一级科目'
			},{
				id: 3,
				name: '上二级科目'
			}],
			pagination: {
				current: 1,
				total: 0,
				pageSize: 50
			}
		}
	}
}
