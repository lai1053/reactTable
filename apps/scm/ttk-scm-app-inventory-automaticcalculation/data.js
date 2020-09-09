export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-inventory-automaticcalculation',
		children: [{
			name: 'root-content',
			component: 'Layout',
			className: 'ttk-scm-app-inventory-automaticcalculation-backgroundColor',
			children: [{
				name: 'title',
				component: '::span',
				className: 'title',
				children: '{{ (data.type=="costSaleRatio" ? "以销定产 按销售单价占比核算 " : "以销售定产 按成本占收入比例核算 ") + (data.defaultCostRate).toFixed(2) + "%" }}'
			}, {
				name: 'header',
				component: '::div',
				className: 'ttk-scm-app-inventory-automaticcalculation-header',
				children: [{
					name: 'period',
					component: 'DatePicker.MonthPicker',
					value: '{{$stringToMoment(data.period)}}',
					onChange: "{{$periodChange}}",
					disabledDate: '{{function(value){return $disabledDate(value)}}}',
				}, {
					name: 'inventoryName',
					component: 'Input.Search',
					showSearch: true,
					placeholder: '名称/规格型号/编码',
					className:'ttk-scm-app-inventory-automaticcalculation-header-search',
					value:'{{data.search}}',
					//enterButton:true,
					onChange: `{{$handleChangeSearch}}`,
					onSearch: `{{$fixPosition}}`,
				}]
			}, {
				name: 'content',
				component: 'Layout',
				className: 'ttk-scm-app-inventory-automaticcalculation-content',
				children: [{
					name: 'dataGrid',
					component: 'DataGrid',
					ellipsis: true,
					headerHeight: 37,
					rowHeight: 37,
					isColumnResizing: false,
					loading: '{{data.other.loading}}',
					rowsCount: '{{$getListRowsCount()}}',
					scrollToRow: '{{data.other.detailsScrollToRow}}',
					columns: [{
						name: 'seq',
						component: 'DataGrid.Column',
						columnKey: 'seq',
						width: 44,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '序号'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: '{{_rowIndex == data.other.detailsScrollToRow?"mk-datagrid-cellContent-center currentScrollRow":"mk-datagrid-cellContent-center"}}',
							value: '{{data.list[_rowIndex].seq}}',
							_power: '({rowIndex})=>rowIndex'
						}
					}, {
						name: 'invPropName',
						component: 'DataGrid.Column',
						columnKey: 'invPropName',
						width: 100,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '存货分类'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: '{{_rowIndex == data.other.detailsScrollToRow?"mk-datagrid-cellContent-left currentScrollRow":"mk-datagrid-cellContent-left"}}',
							value: '{{data.list[_rowIndex].invPropName}}',
							_power: '({rowIndex})=>rowIndex'
						}
					}, {
						name: 'inventoryCode',
						component: 'DataGrid.Column',
						columnKey: 'inventoryCode',
						width: 60,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '存货编码'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: '{{_rowIndex == data.other.detailsScrollToRow?"mk-datagrid-cellContent-center currentScrollRow":"mk-datagrid-cellContent-center"}}',
							value: '{{data.list[_rowIndex].inventoryCode}}',
							_power: '({rowIndex})=>rowIndex'
						}
					}, {
						name: 'inventoryName',
						component: 'DataGrid.Column',
						columnKey: 'inventoryName',
						width: 100,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '存货名称'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: '{{_rowIndex == data.other.detailsScrollToRow?"mk-datagrid-cellContent-left currentScrollRow":"mk-datagrid-cellContent-left"}}',
							value: '{{data.list[_rowIndex].inventoryName}}',
							_power: '({rowIndex})=>rowIndex'
						}
					}, {
						name: 'specification',
						component: 'DataGrid.Column',
						columnKey: 'specification',
						width: 90,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '规格型号'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: '{{_rowIndex == data.other.detailsScrollToRow?"mk-datagrid-cellContent-left currentScrollRow":"mk-datagrid-cellContent-left"}}',
							value: '{{data.list[_rowIndex].specification}}',
							_power: '({rowIndex})=>rowIndex'
						}
					}, {
						name: 'unitName',
						component: 'DataGrid.Column',
						columnKey: 'unitName',
						width: 60,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '计量单位'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: '{{_rowIndex == data.other.detailsScrollToRow?"mk-datagrid-cellContent-center currentScrollRow":"mk-datagrid-cellContent-center"}}',
							value: '{{data.list[_rowIndex].unitName}}',
							_power: '({rowIndex})=>rowIndex'
						}
					}, {
						name: 'quantity',
						component: 'DataGrid.Column',
						columnKey: 'quantity',
						width: 100,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '销售数量'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: '{{_rowIndex == data.other.detailsScrollToRow?"mk-datagrid-cellContent-right currentScrollRow":"mk-datagrid-cellContent-right"}}',
							value: '{{Number(data.list[_rowIndex].quantity) ? (Math.round(Number(data.list[_rowIndex].quantity)*1000000)/1000000).toFixed(6) : "0.000000"}}',
							_power: '({rowIndex})=>rowIndex'
						}
					}, {
						name: 'amount',
						component: 'DataGrid.Column',
						columnKey: 'amount',
						width: 101,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '{{ data.type=="costSaleRatio" ? "销售单价" : "销售收入" }}'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: '{{_rowIndex == data.other.detailsScrollToRow?"mk-datagrid-cellContent-right currentScrollRow":"mk-datagrid-cellContent-right"}}',
							value: '{{Number(data.list[_rowIndex].amount) ? data.list[_rowIndex].amount : (data.type=="costSaleRatio" ? "0.000000" : "0.00")}}',
							_power: '({rowIndex})=>rowIndex'
						}
					}, {
						name: 'costRate',
						component: 'DataGrid.Column',
						columnKey: 'costRate',
						width: 100,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '成本率'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							//tip: true,
							className: '{{_rowIndex == data.other.detailsScrollToRow?"mk-datagrid-cellContent-right currentScrollRow":"mk-datagrid-cellContent-right"}}',
							//value: '{{data.list[_rowIndex].costRate}}',
							_power: '({rowIndex})=>rowIndex',
							children: [{
								name: 'tempAmount',
								component: 'Input.Number',
								precision: 2,
								className: '{{ data.list[_rowIndex].costRateError ? "error" : "" }}',
								value: '{{data.list[_rowIndex].costRate ? data.list[_rowIndex].costRate+"%" : ""}}',
								onBlur: '{{ function(e){ $amountBlur(data.list[_rowIndex], "costRate", e, _rowIndex) } }}',
							}]
						}
					}, {
						name: 'tempAmount',
						component: 'DataGrid.Column',
						columnKey: 'tempAmount',
						width: 110,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '{{ data.type=="costSaleRatio" ? "出库单价" : "预计销售成本金额" }}'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							//tip: true,
							className: '{{_rowIndex == data.other.detailsScrollToRow?"mk-datagrid-cellContent-right currentScrollRow":"mk-datagrid-cellContent-right"}}',
							//value: '{{data.list[_rowIndex].tempAmount}}',
							_power: '({rowIndex})=>rowIndex',
							children: [{
								name: 'tempAmount',
								component: 'Input.Number',
								disabled: '{{ !Number(data.list[_rowIndex].amount) }}',
								precision: '{{ data.type=="costSaleRatio" ? 6 : 2 }}',
								value: '{{Number(data.list[_rowIndex].tempAmount) ? data.list[_rowIndex].tempAmount : (data.type=="costSaleRatio" ? "0.000000" : "0.00")}}',
								onBlur: '{{ function(e){ $amountBlur(data.list[_rowIndex], "tempAmount", e, _rowIndex) } }}',
							}]
						}
					}]
				}, {
					name: 'noData',
					component: '::div',
					_visible: '{{!data.list.length && data.noDataVisible}}',
					className: 'noData',
					children: '无销项发票生成的销售出库单，无法计算销售成本'
				}]
			}]
		}]
	};
}

export function getInitState() {
	return {
		data: {
			list: [],
			noDataVisible: false,
			period: '',
			defaultCostRate: 0,
			search: '',
			other: {
				loading: false,
				detailsScrollToRow: undefined,
				matchIndex: -1,
				matchBacktoZero: true
			}
		}
	};
}
