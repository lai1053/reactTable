export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-mapping-account',
		onMouseDown: '{{$mousedown}}',
		children: [
			{
				name: 'header',
				component: '::div',
				className: 'ttk-scm-mapping-account-header',
				children: [
					{
						name: 'inventoryName',
						component: 'Input.Search',
						showSearch: true,
						placeholder: '请输入货物或劳务名称',
						className: 'ttk-scm-mapping-account-header-left-search',
						value: '{{data.inventoryName}}',
						onSearch:`{{$refresh}}`,
						value:'{{data.inventoryName}}',
						onChange: `{{$handleChangeSearch}}`,
						onBlur:`{{$refresh}}`,
					},
					// {
					// 	name: 'refresh',
					// 	component: '::div',
					// 	className: 'ttk-scm-mapping-account-header-left',
					// 	children: [{
					// 		name: 'refresh',
					// 		component: 'Button',
					// 		className: 'refresh',
					// 		children: {
					// 			name: 'userIcon',
					// 			className: 'refresh-btn',
					// 			component: 'Icon',
					// 			fontFamily: 'edficon',
					// 			type: 'shuaxin'
					// 		},
					// 		//onClick: '{{$load}}'
					// 	}]
					// },
					{
						name: 'btnGroup',
						component: 'Layout',
						className: 'ttk-scm-mapping-account-header-right',
						children: [
							{
								name: 'add',
								component: 'Button',
								children: '批量修改',
								type: 'primary',
								className: 'btn',
								onClick: '{{$updateBatchClick}}'
							}
						]
					}
				]
			},
			{
				name: 'dataGrid',
				component: 'DataGrid',
				headerHeight: 37,
				className: 'ttk-scm-mapping-account-content',
				isColumnResizing: true,
				rowHeight: 37,
				enableSequence: false,
				ellipsis: true,
				loading: '{{data.other.loading}}',
				rowsCount: "{{data.form.details && data.form.details.length}}",
				readonly: false,
				columns: [
					{
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
								checked: '{{data.form.details[_rowIndex].selected}}',
								onChange: '{{$selectRow(_rowIndex)}}'
							}]
						}
					},
					{
						name: 'goodsName',
						component: 'DataGrid.Column',
						columnKey: 'goods',
						width: 100,
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
					},
					{
						name: 'propertyName',
						component: 'DataGrid.Column',
						columnKey: 'goods',
						width: 100,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '业务类型'
						},
						cell: {
							name: 'cell',
							component: "DataGrid.Cell",
							className: 'inventoryName',
							value: "{{data.form.details[_rowIndex].propertyName}}",
							_power: '({rowIndex})=>rowIndex',
							tip: true,
						}
					},
					{
						name: 'inventoryName',
						component: 'DataGrid.Column',
						columnKey: 'inventory',
						width: 100,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '档案-存货名称',
							className: 'cell_header'
						},
						cell: {
							name: 'cell',
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
					},
					{
						name: 'accountName',
						component: 'DataGrid.Column',
						columnKey: 'account',
						width: 100,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '科目',
							className: 'cell_header'
						},
						cell: {
							name: 'cell',
							component: 'Select',
							className: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryRelatedAccountName?"":"has-error"}}',
							showSearch: true,
							allowClear: false,
							dropdownClassName: 'celldropdown',
							value: '{{data.form.details[_rowIndex] && data.form.details[_rowIndex].inventoryRelatedAccountName}}',
							filterOption: '{{$filterOption}}',
							onChange: '{{function(v){$onAccountFieldChange(v, _rowIndex)}}}',
							children: {
								name: 'option',
								component: 'Select.Option',
								value: '{{data.other.account && data.other.account[_lastIndex].id}}',
								children: '{{data.other.account && data.other.account[_lastIndex].codeAndName}}',
								_power: 'for in data.other.account'
							},
							dropdownFooter: {
								name: 'add',
								type: 'primary',
								component: 'Button',
								style: { width: '100%', borderRadius: '0' },
								children: '新增',
								onClick: '{{function(){$addSubjects(_rowIndex)}}}'
							},
							_excludeProps: '{{$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
							_power: '({rowIndex}) => rowIndex',
						}
					}
				]
			}
		]
	}
}

export function getInitState() {
	return {
		data: {
			inventoryName: null,
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