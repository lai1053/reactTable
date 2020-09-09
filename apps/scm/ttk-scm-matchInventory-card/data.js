import moment from 'moment'
import { consts } from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-matchInventory-card',
		onMouseDown: '{{$mousedown}}',
		children: {
			name: 'load',
			component: 'Spin',
			tip: '数据处理中...',
			spinning: '{{data.other.loading}}',
			children: [
				{
					name: 'details',
					component: 'DataGrid',
					headerHeight: 37,
					className: 'ttk-scm-matchInventory-card-content',
					// loading: '{{data.other.loading}}',
					isColumnResizing: true,
					rowHeight: 37,
					enableSequence: false,
					ellipsis: true,
					rowsCount: "{{data.form.details && data.form.details.length}}",
					readonly: false,
					columns: [{
						name: 'inventoryName',
						component: 'DataGrid.Column',
						columnKey: 'inventoryName',
						width: 258,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '发票-货物或劳务名称'
						},
						cell: {
							name: 'cell',
							component: "DataGrid.Cell",
							className: 'inventoryName',
							value: "{{data.form.details[_rowIndex].inventoryName}}",
							_power: '({rowIndex})=>rowIndex',
							tip: true,
						}
					}, {
						name: 'name',
						component: 'DataGrid.Column',
						columnKey: 'name',
						width: 264,
						flexGrow: 1,
						// _visible: '{{$isDelivery("delivery")}}',
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '档案-存货名称',
							className:'cell_header'
						},
						cell: {
							name: 'cell',
							//component: '{{$isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
							component: 'Select',
							showSearch: true,
							allowClear: true,
							value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].name}}',
							filterOption: '{{$filterOption}}',
							onChange: '{{function(v){$onFieldChange(v, _rowIndex)}}}',
							children: {
								name: 'option',
								component: 'Select.Option',
								value: '{{data.other.inventory && data.other.inventory[_lastIndex].id}}',
								children: '{{data.other.inventory && data.other.inventory[_lastIndex].name}}',
								_power: 'for in data.other.inventory'
							},
							dropdownFooter: {
								name: 'add',
								type: 'primary',
								component: 'Button',
								style: { width: '100%', borderRadius: '0' },
								children: '新增',
								onClick: '{{function(){$addRecordClick(_rowIndex)}}}'
							},
							_excludeProps: '{{$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
							_power: '({rowIndex}) => rowIndex',
						}
					}
						// ,{
						// 	name: 'name',
						// 	component: 'DataGrid.Column',
						// 	columnKey: 'name',
						// 	width: 85,
						// 	flexGrow: 1,
						// 	_visible: '{{$isDelivery("invoice")}}',
						// 	header: {
						// 		name: 'header',
						// 		component: 'DataGrid.Cell',
						// 		children: '档案-存货名称'
						// 	},
						// 	cell: {
						//         name: 'cell',
						//         component: '{{$isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
						//         className: '{{$getCellClassName(_ctrlPath)}}',
						//         showSearch: true,
						//         value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].name}}',
						//         filterOption: '{{$filterOption}}',
						// 		onChange: '{{function(v){$onFieldChange(v, _rowIndex)}}}',
						//         children: {
						//             name: 'option',
						//             component: 'Select.Option',
						//             value: '{{data.other.inventory && data.other.inventory[_lastIndex].id}}',
						//             children: '{{data.other.inventory && data.other.inventory[_lastIndex].name}}',
						//             _power: 'for in data.other.inventory'
						// 		},
						// 		dropdownFooter: {
						// 			name: 'add',
						// 			type: 'primary',
						// 			component: 'Button',
						// 			style: { width: '100%', borderRadius: '0' },
						// 			children: '新增',
						// 			onClick: '{{function(){$addRecordClick()}}}'
						// 		},
						//         _excludeProps: '{{$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
						//         _power: '({rowIndex}) => rowIndex',
						//     }
						// }
					]
				}]
		}
	}
}

export function getInitState() {
	return {
		data: {
			form: {
				details: [
					blankDetail,
					blankDetail,
					blankDetail
				],
			},
			other: {
				error: {},
				loading: false,
			},

		}
	}
}

export const blankDetail = {
	inventoryName: null,
	name: null
}
