export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-card-revenueType',
		children: [{
			name: 'root-content',
			component: 'Layout',
			onMouseDown: '{{$mousedown}}',
			children: [{
				name: 'footerText',
				component: '::div',
				className: 'app-card-revenueType-footerText',
				children: [{
					name: 'del',
					component: '::span',
					children: '注：',
					style: { dispaly: 'inline-block' }
				}, {
					name: 'del',
					component: '::span',
					children: [
						{
							name: 'add',
							component: '::p',
							children: '1.修改新增存货收入类型，只影响新增存货收入类型，不修改已有存货收入类型',
							style: { marginBottom: '5px' }
						}, {
							name: 'del',
							component: '::p',
							children: '2.修改已有存货收入类型，影响新增存货收入类型，修改已有存货收入类型',
							style: { marginBottom: '0px' }
						}
					],
					style: { dispaly: 'inline-block' }
				}]
			},{
				name: 'content',
				component: 'Layout',
				className: 'app-card-revenueType-content',
				children: [{
					name: 'details',
					component: 'DataGrid',
					ellipsis: true,
					headerHeight: 37,
					rowHeight: 37,
					isColumnResizing: false,
					// showBtnWidth: true,
					// isFix: true,
					className: 'app-card-revenueType-content-formDetails',
					// readonly: false,
					loading: '{{data.other.loading}}',
					onAddrow: '{{$addBottomRow("details",8)}}',
					onDelrow: '{{$delRow("details",true)}}',
					startSequence: 1,
					enableSequenceAddDelrow: true,
					enableSequence: true,
					readonly: false,
					rowsCount: '{{data.form.details.length}}',
					columns: [{
						name: 'code',
						component: 'DataGrid.Column',
						columnKey: 'code',
						width: 100,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							// className: 'borderLeft topBorder',
							children: '存货及服务分类'
						},
						cell: {
							name: 'cell',
							className: '{{$getCellClassName(_ctrlPath) + "selectStyle"}}',
							_power: '({rowIndex})=>rowIndex',
							// component: '{{$isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
							component: 'Select',
							showSearch: false,
							optionFilterProp: 'children',
							value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].name}}',
							onChange: '{{function(name){$inventoryChange(name,_rowIndex)}}}',
							children: {
								name: 'selectItem',
								component: 'Select.Option',
								value: '{{data.other.inventory[_lastIndex].id}}',
								disabled: '{{data.other.inventory[_lastIndex].disabled}}',
								children: '{{data.other.inventory[_lastIndex].name}}',
								_power: 'for in data.other.inventory'
							}
						}
					},
						{
							name: 'name',
							component: 'DataGrid.Column',
							columnKey: 'name',
							width: 100,
							flexGrow: 1,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								className: 'topBorder',
								children: '默认收入类型  '
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.Cell',
								className: '{{"mk-datagrid-cellContent-left"}}',
								tip: true,
								value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].defaultRevenueType}}',
								_power: '({rowIndex})=>rowIndex'
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
								className: 'topBorder',
								children: '修改收入类型'
							},
							cell: {
								name: 'cell',
								// component: '{{$isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
								component: 'Select',
								className: '{{$getCellClassName(_ctrlPath) + "selectStyle"}}',
								_power: '({rowIndex})=>rowIndex',
								showSearch: false,
								optionFilterProp: 'children',
								onChange: '{{function(id){$revenueTypeChange(id,_rowIndex)}}}',
								value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].revenueTypeName}}',
								children: {
									name: 'selectItem',
									component: 'Select.Option',
									value: '{{data.other.revenueType[_lastIndex].id}}',
									children: '{{data.other.revenueType[_lastIndex].name}}',
									_power: 'for in data.other.revenueType'
								}
							}
						}]
				}
				]
			}, {
				name: 'footer',
				component: '::div',
				className: 'app-card-revenueType-footer',
				children: [{
					name: 'add',
					component: 'Button',
					children: '修改新增存货收入类型',
					type: 'primary',
					className: 'btn',
					onClick: '{{$newClick}}'
				}, {
					name: 'del',
					component: 'Button',
					children: '修改已有存货收入类型',
					className: 'btn',
					onClick: '{{$oldClick}}'
				}]
			}]
		}]
	};
}

export function getInitState() {
	return {
		data: {
			form: {
				details: [
					blankDetail
				]
			},
			other: {
				revenueType: [{ 'id': 2001003001, 'code': 'SR001', 'name': '主营业务收入' }, {
					'id': 2001003002,
					'code': 'SR002',
					'name': '其他业务收入'
				}, { 'id': 2001003003, 'code': 'SR003', 'name': '营业外收入' }],
				inventory: []
			}
		}
	};
}

export const blankDetail = {
	id: null,
	name: null,
	revenueType: null,
	revenueTypeName: null,
	defaultRevenueType: null
};
