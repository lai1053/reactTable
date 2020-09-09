import moment from 'moment'
import { consts } from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-fileRules-card',
		onMouseDown: '{{$mousedown}}',
		children: {
			name: 'load',
			component: 'Spin',
			tip: '数据处理中...',
			spinning: '{{data.other.loading}}',
			children: [
				// {
				// 	name: 'customer',
				// 	component: '::div',
				// 	className: 'customer',
				// 	children: '{{$renderCustomer()}}'
				// },
				// {
				// 	name: 'customerSet',
				// 	component: 'Checkbox',
				// 	className: 'checkbox',
				// 	children: '{{$renderChild()}}',
				// 	checked: '{{data.form.customerSet}}',
				// 	onChange: '{{function(e){$setInventory("data.form.customerSet",e.target.checked)}}}'
				// },
				// {
				// 	name: 'check',
				// 	component: 'Checkbox',
				// 	className: 'checkbox',
				// 	children: '勾选，应收账款/预收账款非末级时按客户名称字段生成二级科目',
				// 	checked: '{{data.form.accountSet}}',
				// 	onChange: '{{function(e){$setInventory("data.form.accountSet",e.target.checked)}}}'
				// },
				// {
				// 	name: 'match',
				// 	component: '::div',
				// 	className: 'customer',
				// 	children: '匹配存货档案'
				// },
				// {
				// 	name: 'check',
				// 	component: 'Checkbox',
				// 	className: 'checkbox',
				// 	children: '发票采集/导入后，按"货物或劳务名称"作为"存货名称"新增存货档案',
				// 	checked: '{{data.form.inventorySet}}',
				// 	onChange: '{{function(e){$setInventory("data.form.inventorySet",e.target.checked)}}}'
				// },

				{
					name: 'details',
					component: 'DataGrid',
					headerHeight: 37,
					className: 'ttk-scm-fileRules-card-content',
					isColumnResizing: true,
					rowHeight: 37,
					enableSequence: false,
					ellipsis: true,
					rowsCount: "{{data.form.details && data.form.details.length}}",
					readonly: false,
					columns: [{
						name: 'goodsName',
						component: 'DataGrid.Column',
						columnKey: 'goodsName',
						width: 250,
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
						name: 'inventoryName',
						component: 'DataGrid.Column',
						columnKey: 'inventoryName',
						width: 256,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '档案-存货名称',
							className: 'cell_header'
						},
						cell: {
							name: 'cell',
							//	component: '{{$isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
							component: 'Select',
							className: '{{$getCellClassName(_ctrlPath)}}',
							showSearch: true,
							allowClear: true,
							dropdownClassName: 'celldropdown',
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
					}]
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
				]
			},
			other: {
				error: {},
				loading: false
			},
			form: {
				inventorySet: false,
				customerSet: false,
				details: []
			}
		}
	}
}
export const blankDetail = {
	inventoryName: null,
	name: null
}
