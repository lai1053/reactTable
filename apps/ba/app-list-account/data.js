export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-list-account',
		children: [{
			name: 'root-content',
			component: 'Layout',
			className: 'app-list-account-backgroundColor',
			children: [{
				name: 'header',
				component: '::div',
				className: 'app-list-account-header',
				children: [{
					name: 'inventoryName',
					component: 'Input.Search',
					showSearch: true,
					placeholder: '请输入账户编码/账户名称',
					className:'app-list-account-header-left-search',
					// onSearch:'{{$load}}',
					value:'{{data.entity.fuzzyCondition}}',
					onChange: `{{function(e){$sf('data.entity.fuzzyCondition',e.target.value);$search()}}}`,
				},{
					name: 'refresh',
					component: '::div',
					className: 'app-list-account-header-left',
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
					className: 'app-list-account-header-right',
					children: [{
						name: 'add',
						component: 'Button',
						children: '新增',
						type: 'primary',
						className: 'btn app-list-account-addBtn',
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
					className: 'app-list-account-content',
					children: [{
						name: 'dataGrid',
						component: 'DataGrid',
						ellipsis: true,
						headerHeight: 37,
						rowHeight: 37,
						isColumnResizing: false,
						loading: '{{data.other.loading}}',
						className: '{{$heightCount()}}',
						// startSequence: '{{(data.pagination.currentPage-1)*data.pagination.pageSize + 1}}',
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
								tip: true,
								_power: '({rowIndex})=>rowIndex',
								children: [{
									name: 'select',
									component: 'Checkbox',
									checked: '{{data.list[_rowIndex].selected}}',
									onChange: '{{$selectRow(_rowIndex)}}'
								}]
							}
						}, {
							name: 'bankAccountTypeName',
							component: 'DataGrid.Column',
							columnKey: 'bankAccountTypeName',
							width: 120,
							flexGrow: 1,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '账户类型'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								tip: true,
								// className: 'mk-datagrid-cellContent-left',
								className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
								value: '{{data.list[_rowIndex].bankAccountTypeName}}',
								_power: '({rowIndex})=>rowIndex'
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
								children: '账户编码'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								tip: true,
								// className: 'mk-datagrid-cellContent-left',
								className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
								value: '{{data.list[_rowIndex].code}}',
								_power: '({rowIndex})=>rowIndex'
							}
						}, {
							name: 'name',
							component: 'DataGrid.Column',
							columnKey: 'name',
							width: 137,
							flexGrow: 1,
							// isResizable: true,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '账户名称'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								className: 'mk-datagrid-cellContent-left',
								// className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
								_power: '({rowIndex})=>rowIndex',
								children: '{{$clickCompent(data.list[_rowIndex])}}'
							}
						}, {
							name: 'isDefault',
							component: 'DataGrid.Column',
							columnKey: 'isDefault',
							width: 120,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '默认账户'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								className: '{{$isEnable(data.list[_rowIndex].isEnable)}}',
								style: { display: 'flex' },
								_power: '({rowIndex})=>rowIndex',
								children: [{
									name: 'isDefault',
									component: 'Icon',
									type: 'check',
									_visible: '{{data.list[_rowIndex].isDefault ? true : false}}',
									style: {
										fontSize: 22
									},
									title: '默认账户'
								}]
							}
						}, {
							name: 'beginningBalance',
							component: 'DataGrid.Column',
							columnKey: 'beginningBalance',
							width: 120,
							flexGrow: 1,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '期初余额'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								tip: true,
								// className: 'mk-datagrid-cellContent-right no-enable',
								className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-right"}}',
								value: '{{$numberFormat(data.list[_rowIndex].beginningBalance,2)}}',
								_power: '({rowIndex})=>rowIndex'
							}
						}, {
							name: 'accountName',
							component: 'DataGrid.Column',
							columnKey: 'accountName',
							width: 120,
							flexGrow: 1,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '对应科目'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								tip: true,
								// className: 'mk-datagrid-cellContent-right no-enable',
								className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
								value: '{{data.list[_rowIndex].accountName}}',
								_power: '({rowIndex})=>rowIndex'
							}
						},{
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
									disabled: '{{data.list[_rowIndex].bankAccountTypeId == 3000050001}}',
									style: {
										fontSize: 23,
										marginRight: '4px',
										cursor: 'pointer'
									},
									title: '{{data.list[_rowIndex].isEnable ? "已启用" : "已停用"}}',
									onClick: '{{function(){data.list[_rowIndex].bankAccountTypeId != 3000050001?$personStatusClick(data.list[_rowIndex], _rowIndex):""}}}'
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
									disabled: '{{data.list[_rowIndex].bankAccountTypeId == 3000050001}}',
									type: 'shanchu',
									style: {
										fontSize: 23,
										cursor: 'pointer'
									},
									title: '删除',
									onClick: '{{function(){data.list[_rowIndex].bankAccountTypeId != 3000050001?$delClick(data.list[_rowIndex]):""}}}'
								}]
							}
						}]
					}]
				}]
		}, {
			name: 'footer',
			component: '::div',
			className: 'app-list-account-footer',
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
		}, {
			name: 'stepTips',
			component: 'Tour',
			run: "{{data.other.stepEnabled}}",
			locale: { back: '上一步', close: '关 闭', last: '完 成', next: '下一步', skip: '忽 略' },
			scrollToFirstStep: true,
			disableCloseOnEsc: true,
			disableOverlayClose: true,
			continuous: true,
			showProgress: false,
			showSkipButton: true,
			callback:"{{$onExit}}",
			steps: [{
				target: '.app-list-account-addBtn',
				content: ['点击新增，', {
					name: 'span',
					component: '::span',
					className: 'ttk-rc-intro-style',
					children: '新增现金银行账户'
				}],
				placement: 'left',
				disableBeacon: true,
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
				stepEnabled: false
			}
		}
	};
}
