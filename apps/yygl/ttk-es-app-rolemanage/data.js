export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-rolemanage',
		children: [{
			name: 'root-content',
			component: 'Layout',
			className: 'ttk-es-app-rolemanage-backgroundColor',
			children: [
			//  {
			// 	name: 'header',
			// 	component: '::div',
			// 	className: 'ttk-es-app-rolemanage-header',
			// 	children: [{
			// 		name: 'btnGroup',
			// 		component: 'Layout',
			// 		className: 'ttk-es-app-rolemanage-header-right',
			// 		children: [{
			// 			name: 'add',
			// 			component: 'Button',
			// 			children: '新增',
			// 			type: 'primary',
			// 			className: 'btn',
			// 			onClick: '{{$addClick}}'
			// 		}]
			// 	}]
			// }, 
			{
				name: 'content',
				component: 'Layout',
				className: 'ttk-es-app-rolemanage-content',
				children: [{
					name: 'dataGrid',
					component: 'DataGrid',
					ellipsis: true,
					headerHeight: 37,
					rowHeight: 37,
					isColumnResizing: false,
					loading: '{{data.other.loading}}',
					className: '{{$heightCount()}}',
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
						name: 'postName',
						component: 'DataGrid.Column',
						columnKey: 'postName',
						width: 120,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '岗位名称'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							className: '{{$roleStateStop(data.list[_rowIndex].postState)+" mk-datagrid-cellContent-left"}}',
							value: '{{data.list[_rowIndex].postName}}',
							_power: '({rowIndex})=>rowIndex'
						}
					}, {
						name: 'postSign',
						component: 'DataGrid.Column',
						columnKey: 'postSign',
						width: 137,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '系统预设岗位'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: '{{$roleStateStop(data.list[_rowIndex].postState)+" mk-datagrid-cellContent-center"}}',
							value: '{{data.list[_rowIndex].postSign}}',
							_power: '({rowIndex})=>rowIndex'
						}
					}, {
						name: 'postType',
						component: 'DataGrid.Column',
						columnKey: 'postType',
						width: 137,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '岗位类型'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: '{{$roleStateStop(data.list[_rowIndex].postState)+" mk-datagrid-cellContent-left"}}',
							value: '{{$roleTypeInfo(data.list[_rowIndex].postType)}}',
							_power: '({rowIndex})=>rowIndex'
						}
					}, {
						name: 'postState',
						component: 'DataGrid.Column',
						columnKey: 'postState',
						width: 137,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '状态'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: '{{$roleStateStop(data.list[_rowIndex].postState)+" mk-datagrid-cellContent-center"}}',
							value: '{{data.list[_rowIndex].postState==1?"正常":"停用"}}',
							_power: '({rowIndex})=>rowIndex'
						}
					}, {
						name: 'operation',
						component: 'DataGrid.Column',
						columnKey: 'operation',
						width: 150,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '操作'
						},
						cell: {
							name: 'cell',
							style: { display: 'flex' },
							component: 'DataGrid.Cell',
							_power: '({rowIndex})=>rowIndex',
							children: [{
								name: 'update',
								component: '::span',
								children:'编辑',
								title: '编辑',
								style: {
									cursor: 'pointer',
									color:'#0066b3'
								},
								_visible:'{{data.list[_rowIndex].postSign == "是"&&$btnShowInfo(data.list[_rowIndex].postName)}}',
								onClick: '{{$modifyDetail(data.list[_rowIndex].id)}}'
							},{
								name: 'splitLine',
								component: '::span',
								children:' | ',
								style: {
									margin: '0px 4px'
								},
								_visible:'{{data.list[_rowIndex].postSign == "是"&&$btnShowInfo(data.list[_rowIndex].postName)}}',
							},{
								name: 'postState',
								component: '::span',
								style: {
									cursor: 'pointer',
									color:'#0066b3'
								},
								_visible:'{{data.list[_rowIndex].postSign == "是"&&$btnEnable(data.list[_rowIndex].postName)}}',
								children:'{{data.list[_rowIndex].postState =="1" ? "停用" : "启用"}}',
								title: '{{data.list[_rowIndex].postState =="1"  ? "停用" : "启用"}}',
								onClick: '{{$personStatusClick(data.list[_rowIndex], _rowIndex)}}'
							},{
								name: 'splitLine',
								component: '::span',
								children:' | ',
								style: {
									margin: '0px 4px'
								},
								_visible:'{{data.list[_rowIndex].postSign == "是"&&$btnShowInfo(data.list[_rowIndex].postName)}}'
							},{
								name: 'remove',
								component: '::span',
								style: {
									cursor: 'pointer',
									color:'#0066b3'
							    },
								children:'删除',
								title: '删除',
								_visible:'{{data.list[_rowIndex].postSign == "是"&&$btnShowInfo(data.list[_rowIndex].postName)}}',
								onClick: '{{$delClick(data.list[_rowIndex])}}'
							}]
						}
					}]
				}]
			}]
		}, {
			name: 'footer',
			component: '::div',
			className: 'ttk-es-app-rolemanage-footer',
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
	}
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
			columns: []
		}
	};
}
