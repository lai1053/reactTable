export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-seluser',
		children: [{
			name: 'root-content',
			component: 'Layout',
			className: 'ttk-es-app-seluser-backgroundColor',
			children: [{
				name: 'header',
				component: '::div',
				className: 'ttk-es-app-seluser-header',
				children: [{
					name: 'inventoryName',
					component: 'Input.Search',
					showSearch: true,
					placeholder: '请输入姓名和手机号码',
					className:'ttk-es-app-ztmanage-content-header-search',
					value:'{{data.entity.fuzzyCondition}}',
					onChange: `{{function(e){$sf('data.entity.fuzzyCondition',e.target.value);$search()}}}`,
                    onPressEnter: '{{$search}}',//按下回车时回调
				}]
			}, {
				name: 'content',
				component: 'Layout',
				className: 'ttk-es-app-seluser-content',
				children: [{
					name: 'dataGrid',
					component: 'DataGrid',
					ellipsis: true,
					headerHeight: 37,
					rowHeight: 37,
					isColumnResizing: false,
					loading: '{{data.loading}}',
					className: '{{$heightCount()}}',
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
								checked: '{{data.list[_rowIndex]&&data.list[_rowIndex].selected}}',
								onChange: '{{$selectRow(_rowIndex)}}'
							}]
						}
					}, {
						name: 'departmentname',
						component: 'DataGrid.Column',
						columnKey: 'departmentname',
						width: 120,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '部门'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							// className: '{{$roleStateStop(data.list[_rowIndex].postState)+" mk-datagrid-cellContent-left"}}',
							value: '{{data.list[_rowIndex]&&data.list[_rowIndex].bmmc}}',
							_power: '({rowIndex})=>rowIndex'
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
							children: '姓名'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							// className: '{{$roleStateStop(data.list[_rowIndex].postState)+" mk-datagrid-cellContent-center"}}',
							value: '{{data.list[_rowIndex]&&data.list[_rowIndex].ygmc}}',
							_power: '({rowIndex})=>rowIndex'
						}
					}, {
						name: 'mobile',
						component: 'DataGrid.Column',
						columnKey: 'mobile',
						width: 137,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '手机号码'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							// className: '{{$roleStateStop(data.list[_rowIndex].postState)+" mk-datagrid-cellContent-left"}}',
							value: '{{data.list[_rowIndex]&&data.list[_rowIndex].account}}',
							_power: '({rowIndex})=>rowIndex'
						}
					}]
				}]
			}]
		 }
	   ]
	}
}

export function getInitState() {
	return {
		data: {
			loading: false,
			list: [],
			columns: [],
            entity:{
                fuzzyCondition:''
			}
		}
	};
}
