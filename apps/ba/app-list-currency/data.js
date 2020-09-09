export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-list-currency',
		children: [{
			name: 'root-content',
			component: 'Layout',
			className: 'app-list-currency-backgroundColor',
			children: [{
				name: 'header',
				component: '::div',
				className: 'app-list-currency-header',
				children: [{
					name: 'inventoryName',
					component: 'Input.Search',
					showSearch: true,
					placeholder: '请输入货币编码/货币名称',
					className:'app-list-currency-header-left-search',
					// onSearch:'{{$load}}',
					value:'{{data.entity.fuzzyCondition}}',
					onChange: `{{function(e){$sf('data.entity.fuzzyCondition',e.target.value);$search()}}}`,
				},{
					name: 'refresh',
					component: '::div',
					className: 'app-list-currency-header-left',
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
					className: 'app-list-currency-header-right',
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
					}]
				}]
			},
				{
					name: 'content',
					component: 'Layout',
					className: 'app-list-currency-content',
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
							width: 120,
							flexGrow: 1,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '货币编码'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								className: 'mk-datagrid-cellContent-left',
								_power: '({rowIndex})=>rowIndex',
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
							width: 137,
							flexGrow: 1,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '货币名称'
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
							name: 'exchangeRate',
							component: 'DataGrid.Column',
							columnKey: 'exchangeRate',
							width: 120,
							flexGrow: 1,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '汇率'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								tip: true,
								className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-right"}}',
								value: '{{data.list[_rowIndex].exchangeRate}}',
								_power: '({rowIndex})=>rowIndex'
							}
						}, {
							name: 'isBaseCurrency',
							component: 'DataGrid.Column',
							columnKey: 'isBaseCurrency',
							width: 120,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '本位币'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								className: '{{$isEnable(data.list[_rowIndex].isEnable)}}',
								style: { display: 'flex' },
								_power: '({rowIndex})=>rowIndex',
								children: [{
									name: 'isBaseCurrency',
									component: 'Icon',
									type: 'check',
									_visible: '{{data.list[_rowIndex].isBaseCurrency ? true : false}}',
									style: {
										fontSize: 22
									},
									title: '本位币'
								}]
							}
						}, {
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
									disabled: '{{data.list[_rowIndex].isBaseCurrency == true}}',
									title: '{{data.list[_rowIndex].isEnable ? "已启用" : "已停用"}}',
									onClick: '{{data.list[_rowIndex].isBaseCurrency ? "" : $personStatusClick(data.list[_rowIndex], _rowIndex)}}'
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
		},

			{
				name: 'footer',
				component: '::div',
				className: 'app-list-currency-footer',
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
				fuzzyCondition:""
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
