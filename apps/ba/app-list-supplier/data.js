export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-list-supplier',
		children: [{
			name: 'root-content',
			component: 'Layout',
			className: 'app-list-supplier-backgroundColor',
			children: [{
				name: 'header',
				component: '::div',
				className: 'app-list-supplier-header',
				children: [{
					name: 'inventoryName',
					component: 'Input.Search',
					showSearch: true,
					placeholder: '请输入编码/名称',
					className:'app-list-project-header-left-search',
					// onSearch:'{{$load}}',
					value:'{{data.entity.fuzzyCondition}}',
					onChange: `{{function(e){$sf('data.entity.fuzzyCondition',e.target.value);$search()}}}`,
				},{
					name: 'tree',
					component: 'TreeSelect',
					allowClear:true,
					className:'app-list-project-header-left-search',
					value:'{{data.entity.categoryHierarchyCode}}',
					dropdownStyle:{ maxHeight: '200px', overflow: 'auto' },
					placeholder:'选择供应商分类',
					showSearch:false,
					treeDefaultExpandedKeys:['genid'],
					onChange:`{{function(v){$sf('data.entity.categoryHierarchyCode',v);$search()}}}`,
					treeData:'{{data.other.category}}',
				},{
					name: 'refresh',
					component: '::div',
					className: 'app-list-supplier-header-left',
					children: [{
						name: 'refresh',
						component: 'Button',
						className: 'refresh',
						children: {
							name: 'userIcon',
							className: 'refresh-btn',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'shuaxin'
						},
						onClick: '{{$load}}'
					}]
				}, {
					name: 'btnGroup',
					component: 'Layout',
					className: 'app-list-supplier-header-right',
					children: [{
						name: 'add',
						component: 'Button',
						children: '新增',
						type: 'primary',
						className: 'btn',
						onClick: '{{$addClick}}'
					}, {
						name: 'del',
						component: 'Button',
						children: '删除',
						className: 'btn',
						onClick: '{{$delClickBatch}}'
					}, {
                        name: 'revenueTypt',
						component: 'Button',
						_visible:'{{$hasLinkConfig}}',
                        children: '科目自动生档案',
                        className: 'btn',
                        onClick: '{{$subjectsCreateCustomer}}'
                    }, {
						name: 'import',
						component: 'Button',
						onClick: '{{$importPerson}}',
						className: 'importIconBtn',
						title: '导入',
						children: [{
							name: 'import',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'daoru',
							style: {
								fontSize: '28px'
							}
						}]
					}]
				}]
			},
				{
					name: 'content',
					component: 'Layout',
					className: 'app-list-supplier-content',
					children: [{
						name: 'dataGrid',
						component: 'DataGrid',
						className: '{{$heightCount()}}',
						ellipsis: true,
						headerHeight: 37,
						rowHeight: 37,
						isColumnResizing: false,
						loading: '{{data.other.loading}}',
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
							flexGrow: 1,
							width: 100,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '编码'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								_power: '({rowIndex})=>rowIndex',
								className: 'mk-datagrid-cellContent-left',
								// children: [{
								// 	name: 'code',
								// 	component: '::a',
								// 	title: '{{data.list[_rowIndex].code}}',
								// 	children: '{{data.list[_rowIndex].code}}',
								// 	onClick: '{{$modifyDetail(data.list[_rowIndex].id)}}'
								// }]
								children: '{{$clickCompent(data.list[_rowIndex])}}'
							}
						}, {
							name: 'name',
							component: 'DataGrid.Column',
							columnKey: 'name',
							flexGrow: 1,
							width: 222,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '名称'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								tip: true,
								// className: 'mk-datagrid-cellContent-left',
								className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
								value: '{{data.list[_rowIndex].name}}',
								_power: '({rowIndex})=>rowIndex'
							}
						}, {
							name: 'taxNumber',
							component: 'DataGrid.Column',
							columnKey: 'taxNumber',
							flexGrow: 1,
							width: 150,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '税号'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								tip: true,
								// className: 'mk-datagrid-cellContent-left',
								className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
								value: '{{data.list[_rowIndex].taxNumber}}',
								_power: '({rowIndex})=>rowIndex'
							}
						}, {
							name: 'payableAccountName',
							component: 'DataGrid.Column',
							columnKey: 'payableAccountName',
							flexGrow: 1,
							width: 152,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '应付科目'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								tip: true,
								// className: 'mk-datagrid-cellContent-left',
								className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
								value: '{{data.list[_rowIndex].payableAccountName}}',
								_power: '({rowIndex})=>rowIndex'
							}
						},{
							name: 'category',
							component: 'DataGrid.Column',
							columnKey: 'contactNumber',
							flexGrow: 1,
							width: 120,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '供应商分类'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								tip: true,
								// className: 'mk-datagrid-cellContent-left',
								className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
								value: '{{data.list[_rowIndex].categoryName}}',
								_power: '({rowIndex})=>rowIndex'
							}
						},{
							name: 'linkman',
							component: 'DataGrid.Column',
							columnKey: 'linkman',
							flexGrow: 1,
							width: 100,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '联系人'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								tip: true,
								// className: 'mk-datagrid-cellContent-left',
								className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
								value: '{{data.list[_rowIndex].linkman}}',
								_power: '({rowIndex})=>rowIndex'
							}
						}, {
							name: 'contactNumber',
							component: 'DataGrid.Column',
							columnKey: 'contactNumber',
							flexGrow: 1,
							width: 100,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '联系电话'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								tip: true,
								// className: 'mk-datagrid-cellContent-left',
								className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
								value: '{{data.list[_rowIndex].contactNumber}}',
								_power: '({rowIndex})=>rowIndex'
							}
						}, 
						// {
						// 	name: 'remark',
						// 	component: 'DataGrid.Column',
						// 	columnKey: 'remark',
						// 	flexGrow: 1,
						// 	width: 257,
						// 	header: {
						// 		name: 'header',
						// 		component: 'DataGrid.Cell',
						// 		children: '备注'
						// 	},
						// 	cell: {
						// 		name: 'cell',
						// 		component: 'DataGrid.Cell',
						// 		tip: true,
						// 		// className: 'mk-datagrid-cellContent-left',
						// 		className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
						// 		value: '{{data.list[_rowIndex].remark}}',
						// 		_power: '({rowIndex})=>rowIndex'
						// 	}
						// },
						 {
							name: 'operation',
							component: 'DataGrid.Column',
							columnKey: 'operation',
							width: 100,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '操作'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								style: { display: 'flex' },
								_power: '({rowIndex})=>rowIndex',
								children: [{
									name: 'isEnable',
									component: 'Icon',
									fontFamily: 'edficon',
									type: '{{data.list[_rowIndex].isEnable ? "tingyong-" : "qiyong-"}}',
									style: {
										fontSize: 23,
										marginRight: '4px',
										cursor: 'pointer'
									},
									title: '{{data.list[_rowIndex].isEnable ? "已启用" : "已停用"}}',
									onClick: '{{$personStatusClick(data.list[_rowIndex], _rowIndex)}}'
								}, {
									name: 'update',
									component: 'Icon',
									fontFamily: 'edficon',
									type: 'bianji',
									style: {
										fontSize: 23,
										cursor: 'pointer'
									},
									title: '编辑',
									onClick: '{{$modifyDetail(data.list[_rowIndex].id)}}'
								}, {
									name: 'remove',
									component: 'Icon',
									fontFamily: 'edficon',
									type: 'shanchu',
									style: {
										fontSize: 23,
										cursor: 'pointer'
									},
									title: '删除',
									onClick: '{{$delClick(data.list[_rowIndex])}}'
								}]
							}
						}]
					}]
				}]
		}, {
			name: 'footer',
			component: '::div',
			className: 'app-list-supplier-footer',
			children: [{
				name: 'pagination',
				component: 'Pagination',
				showSizeChanger: true,
				pageSize: '{{data.pagination.pageSize}}',
				current: '{{data.pagination.current}}',
				total: '{{data.pagination.total}}',
				onChange: '{{$pageChanged}}',
				onShowSizeChange: '{{$pageChanged}}'
			}]
		}]
	};
}

export function getInitState() {
	return {
		data: {
			list: [],
			entity:{
				fuzzyCondition:null
			},
			pagination: {
				current: 1,
				total: 0,
				pageSize: 50
			},
			columns: [],
            other: {
            }
		}
	};
}
