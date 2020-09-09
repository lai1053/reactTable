
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-stock-app-voucher',
		children: [
			{
				name: 'ttk-stock-app-spin',
				className: 'ttk-stock-app-spin',
				component: '::div',
				_visible: '{{data.loading}}',
				children: {
					name: 'ttk-stock-app-inventory-picking-fast-spin-icon',
					className: 'ttk-stock-app-inventory-picking-fast-spin-icon',
					component: 'Spin',
					size: 'large',
					tip: '数据加载中......',
					delay: 10
				}
			},
			{
			name: 'header',
			component: 'Layout',
			className: 'ttk-stock-app-voucher-header-title',
			children: [{
				name: 'inv-app-batch-sale-header',
				component: '::div',
				className: 'inv-app-batch-sale-header',
				children: [{
					name: 'header-left',
					className: 'header-left',
					component: '::div',
					style:{
						float:'left',
					},
					children: [{
						name: 'header-filter-input',
						component: 'Input',
						className: 'inv-app-batch-sale-header-filter-input',
						type: 'text',
						placeholder: '请输入存货名称或存货编号',
						onChange: "{{function (e) {$onSearch('data.inputVal', e.target.value)}}}",
						prefix: {
							name: 'search',
							component: 'Icon',
							type: 'search'
						}
					}, 
					{
						name: 'popover',
						component: 'Popover',
						popupClassName: 'inv-batch-sale-list-popover',
						placement: 'bottom',
						title: '',
						content: {
							name: 'popover-content',
							component: '::div',
							className: 'inv-batch-custom-popover-content',
							children: [{
								name: 'filter-content',
								component: '::div',
								className: 'filter-content',
								children: [ 
									{
									name: 'popover-number',
									component: '::div',
									style: {width: '100%'},
									className: 'inv-batch-custom-popover-item',
									children: [{
										name: 'label',
										component: '::span',
										children: '存货类型：',
										className: 'inv-batch-custom-popover-label'
									}, {
										name: 'bankAccountType',
										component: 'Select',
										showSearch: false,
										value: '{{data.form.constom}}',
										getPopupContainer:'{{function(trigger) {return trigger.parentNode}}}',
										onChange: "{{function(v){$sf('data.form.constom',v)}}}",
										children: {
											name: 'selectItem',
											component: 'Select.Option',
											getPopupContainer:'{{function(trigger) {return trigger.parentNode}}}',
											value: '{{data.form.propertyDetailFilter[_rowIndex].name}}',
											children: '{{data.form.propertyDetailFilter[_rowIndex].name}}',
											_power: 'for in data.form.propertyDetailFilter'
										},
										style: {width: '65%'}
									}]
								}
							]
							}, {
								name: 'filter-footer',
								component: '::div',
								className: 'filter-footer',
								children: [
									{
										name: 'search',
										component: 'Button',
										type: 'primary',
										children: '查询',
										onClick: '{{$filterList}}'
									},
									{
									name: 'reset',
									className: 'reset-btn',
									component: 'Button',
									children: '重置',
									onClick: '{{$resetForm}}'
								}]
							}]
						},
						trigger: 'click',
						visible: '{{data.showPopoverCard}}',
						onVisibleChange: "{{$handlePopoverVisibleChange}}",
						children: {
							name: 'filterSpan',
							component: '::span',
							className: 'inv-batch-custom-filter-btn header-item',
							children: {
								name: 'filter',
								component: 'Icon',
								type: 'filter'
							}
						}
					}
				]
				},{
					name: 'statusgroup',
					component: 'Radio.Group',
					className: 'status-group',
					value: '{{data.form.type}}',
					onChange: "{{function(v){$sf('data.form.type',v.target.value)}}}",
					children: [
						{
							name: 'allright',
							component: 'Radio',
							key: 'allright',
							value:0,
							children: '全部'
						},
						{
							name: 'allright',
							component: 'Radio',
							key: 'allright',
							value:1,
							children: '已匹配'
						},{
							name: 'allright',
							component: 'Radio',
							key: 'allright',
							value:2,
							children: '未匹配'
						},
					]
				},{
					name: 'search',
					component: 'Button',
					style:{
						float:'right',
					},
					children: '批设存货科目',
					onClick: '{{$batch}}'
				}],
			},]
		},
		{
			name: 'content',
			component: 'Layout',
			className: 'ttk-stock-app-voucher-content',
			children: [{
				name: 'dataGrid',
				component: 'DataGrid',
				className:'dataGrid',
				headerHeight: 40,
				rowsCount: '{{data.list.length}}',
				rowHeight: 40,
				readonly: false,
				style:{
					minHeight:'270px',
					border: '1px solid #ccc'
				},
				startSequence: 1,
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
							// tip: true,
							_power: '({rowIndex})=>rowIndex',
							children: [{
								name: 'select',
								component: 'Checkbox',
								checked: '{{data.list[_rowIndex].selected}}',
								onChange: '{{$selectRow(_rowIndex)}}'
							}]
						}
					},
					{
						name: 'code',
						component: 'DataGrid.Column',
						columnKey: 'code',
						flexGrow: 1,
						width: 100,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							className: 'dataGrid-tableHeaderNoBoder',
							children: '存货编号'
						},
						cell: {
							name: 'cell',
							align:'left',
							component: 'DataGrid.TextCell',
							className: "{{$getCellClassName(_ctrlPath)}}",
							value: "{{data.list[_rowIndex].inventoryCode}}",
							onChange: "{{function(e){$sf('data.list.' + _rowIndex + '.inventoryCode', e.target.value)}}}",
							_power: '({rowIndex})=>rowIndex',
						}
					},{
						name: 'name',
						component: 'DataGrid.Column',
						columnKey: 'name',
						flexGrow: 1,
						width: 150,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							className: 'dataGrid-tableHeaderNoBoder',
							children: '存货名称'
						},
						cell: {
							name: 'cell',
							align:'left',
							component: 'DataGrid.TextCell',
							className: "{{$getCellClassName(_ctrlPath)}}",
							value: "{{data.list[_rowIndex].inventoryName}}",
							onChange: "{{function(e){$sf('data.list.' + _rowIndex + '.inventoryName', e.target.value)}}}",
							_power: '({rowIndex})=>rowIndex',
						}
					}, {
						name: 'size',
						component: 'DataGrid.Column',
						columnKey: 'size',
						flexGrow: 1,
						width: 100,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							className: 'dataGrid-tableHeader',
							children: '规格型号'
						},
						cell: {
							name: 'cell',
							align:'left',
							align:'left',
							component: 'DataGrid.TextCell',
							className: "{{$getCellClassName(_ctrlPath)}}",
							value: "{{data.list[_rowIndex].specification}}",
							onChange: "{{function(e){$sf('data.list.' + _rowIndex + '.specification', e.target.value)}}}",
							_power: '({rowIndex})=>rowIndex',
						}
					},{
						name: 'work',
						component: 'DataGrid.Column',
						columnKey: 'work',
						flexGrow: 1,
						width: 100,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							className: 'dataGrid-tableHeaderNoBoder',
							children: '单位'
						},
						cell: {
							name: 'cell',
							align:'left',
							component:'DataGrid.TextCell',
							className: "{{$getCellClassName(_ctrlPath)}}",
							value: "{{data.list[_rowIndex].unitName}}",
							onChange: "{{function(e){$sf('data.list.' + _rowIndex + '.unitName', e.target.value)}}}",
							_power: '({rowIndex})=>rowIndex',
						}
					},{
						name: 'number',
						component: 'DataGrid.Column',
						columnKey: 'number',
						flexGrow: 1,
						width: 100,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							className: 'ant-form-item-required',
							children: '存货科目'
						},
						cell: {
							name: 'cell',
							component: 'Row',
							align:'left',
							className: "{{$getCellClassName(_ctrlPath)}}",
							children: {
								name: 'input',
								component: 'Select',
								showSearch: true,
								filterOption: '{{$filterIndustry}}',
								value:  "{{data.list[_rowIndex].kemu}}",
								onSelect: "{{function(e){$selectOption('data.list.' + _rowIndex + '.kemu',e)}}}",
								children: '{{$getSelectOption()}}'
							},
							inputValue:  "{{data.list[_rowIndex].kemu}}",
							_power: '({rowIndex}) => rowIndex',
							
						}
					},
			]
			},]
		},
	]
	}
}

export function getInitState() {
	return {
		data: {
			loading: false,
			columns: [],
			listAll:{
				billBodyNum:2,
				billBodyYbBalance:2
			},
			form: {
				propertyDetailFilter:[
					{
						name:'库存商品',
					},
					{
						name:'原材料',
					},
					{
						name:'周转材料',
					},
					{
						name:'委托加工物资',
					}
				],
				supplierName:'',
				type:0
			},
			tableOption:{
                // x:1
			},
			list: [
				{
					inventoryCode:'1001',
					inventoryName:'测试数据',
					kemu:'001',
					specification:'LQ-735',
					unitName:'台',
				},
				
				{
					inventoryCode:'1002',
					inventoryName:'测试数据',
					kemu:'001',
					specification:'LQ-735',
					unitName:'台',
				},
				{
					inventoryCode:'1003',
					inventoryName:'测试数据',
					kemu:'001',
					specification:'LQ-735',
					unitName:'台',
					
				}
			],
			other: {
				error:{},
			},
			basic:{
				enableDate:''
			}
		}
	}
}