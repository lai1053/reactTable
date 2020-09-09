export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-list-unit',
		children: [{
			name: 'root-content',
			component: 'Layout',
			className: 'app-list-unit-backgroundColor',
			children: [{
				name: 'header',
				component: '::div',
				className: 'app-list-unit-header',
				children: [{
					name: 'refresh',
					component: '::div',
					className: 'app-list-unit-header-left',
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
					className: 'app-list-unit-header-right',
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
			}, {
				name: 'content',
				component: 'Layout',
				className: 'app-list-unit-content',
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
						// isResizable: true,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '编码'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							className: 'mk-datagrid-cellContent-left',
							_power: '({rowIndex})=>rowIndex',
							children: [{
								name: 'code',
								component: '::a',
								title: '{{data.list[_rowIndex].code}}',
								children: '{{data.list[_rowIndex].code}}',
								onClick: '{{$modifyDetail(data.list[_rowIndex].id)}}'
							}]
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
							children: '名称'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							// className: 'mk-datagrid-cellContent-left',
							value: '{{data.list[_rowIndex].name}}',
							_power: '({rowIndex})=>rowIndex'
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
			className: 'app-list-unit-footer',
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
