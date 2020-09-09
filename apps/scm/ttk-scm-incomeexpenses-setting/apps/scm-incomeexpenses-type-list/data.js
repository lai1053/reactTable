import moment from 'moment'
import {consts} from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
        className: 'scm-incomeexpenses-type-list',
        children: {
			name: 'content',
			component: 'Layout',
			className: 'app-list-unit-content',
			children: [{
				name: 'scm-incomeexpenses-type-list-btn',
				component: '::div',
				className: 'scm-incomeexpenses-type-list-btn',
				children:[{
					name: 'add',
					component: 'Button',
					type: 'primary',
					children: '新增',
					className: 'btn',
					onClick: '{{$newClick}}'
				}]
			},{
				name: 'dataGrid',
				component: 'DataGrid',
				//className: '{{$heightCount()}}',
				ellipsis: true,
				headerHeight: 37,
				rowHeight: 37,
				isColumnResizing: false,
				loading: '{{data.other.loading}}',
				rowsCount: "{{$getListRowsCount()}}",
				columns: [/*{
					name: 'select',
					component: 'DataGrid.Column',
					columnKey: 'operation',
					width: 60,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: [{
							name: 'chexkbox',
							component: 'Checkbox',
							checked: '{{$isSelectAll("dataGrid")}}',
							onChange: '{{$selectAll("dataGrid")}}',
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
							onChange: "{{$selectRow(_rowIndex)}}"
						}]
					}
				}, */{
					name: 'code',
					component: 'DataGrid.Column',
					columnKey: 'code',
					width: 120,
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
						//value: "{{data.list[_rowIndex].code}}",
						_power: '({rowIndex})=>rowIndex',
						children: [{
							name: 'code',
							component: '::a',
							children: "{{data.list[_rowIndex].code}}",
							onClick: '{{function(){$editClick(data.list[_rowIndex])}}}'
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
						children: '{{data.other.incomeexpensesTabId=="3001002" ? "收款大类" : "付款大类"}}'
					},
					cell: {
						name: 'cell',
						component: "DataGrid.Cell",
						className: 'mk-datagrid-cellContent-left',
						tip: true,
						// className: 'mk-datagrid-cellContent-left',
						value: "{{data.list[_rowIndex].name}}",
						_power: '({rowIndex})=>rowIndex',
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
						_power: '({rowIndex})=>rowIndex',
						children: [{
							name: 'update',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'bianji',
							style: {
								fontSize: 22,
								marginTop: '7px'
							},
							title: '编辑',
							onClick: '{{function(){$editClick(data.list[_rowIndex])}}}'
						}, {
							name: 'remove',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'shanchu',
							disabled: '{{data.list[_rowIndex].isSystem}}',
							style: {
								fontSize: 22,
								marginTop: '7px'
							},
							title: '删除',
							onClick: '{{function(){data.list[_rowIndex].isSystem ? null : $delClick(data.list[_rowIndex])}}}'
						}]
					}
				}]
			}]
		}
    }
}

export function getInitState() {
	return {
		data: {
			form: {
				code: '',
				name: ''
			},
			list: [],
			other: {
				error: {},
				loading: false,
			},
		}
	}
}

