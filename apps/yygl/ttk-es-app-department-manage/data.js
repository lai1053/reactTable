export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: '{{$heightCount()}}',
		children: [{
			name: 'left',
			component: 'Card',
			className: 'ttk-es-app-department-manage-left',
			title: '部门列表',
			children: {
				name: 'tree',
				component: 'Tree',
				className: 'ttk-es-app-department-manage-tree',
				defaultExpandedKeys: '{{["genid"]}}',
				selectedKeys: '{{data.treeSelectedKey}}',
				onSelect: '{{$selectType}}',
				children: '{{$renderTreeNodes(data.other.tree)}}'
			}
		}, {
			name: 'resizer',
			component: 'Resizer'
		}, {
			name: 'content',
			component: 'Card',
			className: 'ttk-es-app-department-manage-content',
			title: '{{data.persName}}',
			extra: {
				name: 'header',
				component: '::div',
				className: 'ttk-es-app-department-manage-content-header',
				children: [{
					name: 'addDepartMent',
					component: 'Button',
					children: '新增',
					className: 'btn',
					type: 'primary',
					onClick: '{{$addDept}}'
				}
				//,{
				// 	name: 'delDepartMent',
				// 	component: 'Button',
				// 	className: 'btn',
				// 	children: '删除',
				// 	onClick: '{{$delBatchDepart}}'
				// }
			]
			},
			children: [{
				name: 'dataGrid',
				component: 'DataGrid',
				className: 'ttk-es-app-department-manage-content-content',
				ellipsis: true,
				headerHeight: 37,
				rowHeight: 37,
				loading: '{{data.other.loading}}',
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
					name: 'name',
					component: 'DataGrid.Column',
					columnKey: 'name',
					flexGrow: 1,
					width: 137,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '部门名称'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						className: 'mk-datagrid-cellContent-left',
						_power: '({rowIndex})=>rowIndex',
						children: '{{data.list[_rowIndex].name}}'
					}
				}, {
					name: 'operation',
					component: 'DataGrid.Column',
					columnKey: 'operation',
					flexGrow: 1,
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
							component: '::span',
							type: 'bianji',
							style: {
								cursor: 'pointer',
								color:'#0066b3'
							},
							children:"编辑",
							title: '编辑',
							onClick: '{{$editDept(data.list[_rowIndex].id)}}'
						},{
								name: 'splitLine',
								component: '::span',
								children:' | ',
								style: {
									margin: '0px 4px'
							    }
						}, {
							name: 'remove',
							component: '::span',
							style: {
								cursor: 'pointer',
								color:'#0066b3'
							},
							children:"删除",
							title: '删除',
							onClick: '{{$delDeptClick(data.list[_rowIndex])}}'
						}]
					}
				}]
			}, {
				name: 'footer',
				component: '::div',
				className: 'ttk-es-app-department-manage-content-footer',
				children: [{
					name: 'pagination',
					component: 'Pagination',
					showSizeChanger: true,
					pageSize: '{{data.pagination.pageSize}}',
					current: '{{data.pagination.current}}',
					total: '{{data.pagination.total}}',
					onChange: '{{$pageChanged}}',
                    showTotal: '{{$pageTotal}}',
					onShowSizeChange: '{{$pageChanged}}'
				}]
			}]
		}]
	};
}

export function getInitState() {
	return {
		data: {
			persName: '',
			user: {},
			list: [],
			entity:{
				fuzzyCondition:""
			},
			departId:'',
			departCode:'',
			isDelDept: true,
			pagination: {
				current: 1,
				total: 0,
				pageSize: 50
			},
			filter: {},
			other: {
				selectDepart: undefined,
				tree: []
			},
			status: {
				isDeptCreater: ''
			},
			expandedKeys: [],
			treeSelectedKey: []
		}

	};
}
