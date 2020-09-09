import moment from 'moment'
export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-scm-app-estimate-list',
		children: [{
			name: 'header',
			component: '::div',
			className: 'ttk-scm-app-estimate-list-header',
			children: [{
				name: 'left',
				component: '::div',
				className: 'ttk-scm-app-estimate-list-header-leftBtn',
				children: [{
					name: 'date',
					component: 'DatePicker.MonthPicker',
					value: '{{data.form.accountingPeriod}}',
					disabled: true,
					// onChange: '{{function(value){$dateChange(value)}}}',
					// disabledDate: '{{function(value){return $handleDisabledDate(value)}}}'
				}, {
					name: 'select',
					component: 'Select',
					value: '{{data.form.inventoryPropertyId}}',
					onChange: '{{function(value){$selectChange(value)}}}',
					placeholder: '存货分类',
					allowClear: true,
					showSearch: false,
					children: {
						name: 'option',
						component: 'Select.Option',
						value: '{{data.other.inventoryPropertyOption && data.other.inventoryPropertyOption[_lastIndex].id}}',
						children: '{{data.other.inventoryPropertyOption && data.other.inventoryPropertyOption[_lastIndex].name}}',
						_power: 'for in data.other.inventoryPropertyOption'
					},
				}]
			}, {
				name: 'rightBtn',
				component: '::div',
				className: 'ttk-scm-app-estimate-list-header-rightBtn',
				children: [{
					name: 'link',
					component: 'Button',
					children: '自动生成暂估单',
					type: 'primary',
					onClick: '{{$autoCreate}}'
				}, {
					name: 'print',
					component: 'Icon',
					fontFamily: 'edficon',
					className: 'btn print dayin',
					type: 'dayin',
					onClick: '{{$print}}',
					title: '打印',
					style: {
						fontSize: 28,
						lineHeight: '30px'
					},
				}, {
					name: 'export',
					component: 'Icon',
					fontFamily: 'edficon',
					className: 'btn export daochu',
					type: 'daochu',
					title: '导出',
					onClick: '{{$export}}',
					style: {
						fontSize: 28,
						lineHeight: '28px'
					},
				}]
			}]
		}, {
			name: 'container',
			component: '::div',
			className: 'ttk-scm-app-estimate-list-container',
			children: [{
				name: 'dataGrid',
				component: 'DataGrid',
				headerHeight: 37,
				rowHeight: 37,
				ellipsis: true,
				loading: '{{data.other.loading}}',
				rowsCount: "{{data.list ? data.list.length : 0}}",
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
				}, {
					name: 'propertyName',
					component: 'DataGrid.Column',
					// flexGrow: 1,
					columnKey: 'propertyName',
					width: 90,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '存货分类'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						_power: '({rowIndex})=>rowIndex',
						className: 'mk-datagrid-cellContent-left',
						children: [{
							name: 'propertyName',
							component: '::span',
							title: '{{data.list[_rowIndex].propertyName}}',
							children: '{{data.list[_rowIndex].propertyName}}',
						}]
					}
				}, {
					name: 'inventoryCode',
					component: 'DataGrid.Column',
					// flexGrow: 1,
					columnKey: 'inventoryCode',
					width: 90,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '存货编码'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						_power: '({rowIndex})=>rowIndex',
						className: 'mk-datagrid-cellContent-left',
						children: [{
							name: 'inventoryCode',
							component: '::span',
							title: '{{data.list[_rowIndex].inventoryCode}}',
							children: '{{data.list[_rowIndex].inventoryCode}}',
						}]
					}
				}, {
					name: 'inventoryName',
					component: 'DataGrid.Column',
					flexGrow: 1,
					columnKey: 'inventoryName',
					width: 120,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '存货名称'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						_power: '({rowIndex})=>rowIndex',
						className: 'mk-datagrid-cellContent-left',
						children: [{
							name: 'inventoryName',
							component: '::span',
							title: '{{data.list[_rowIndex].inventoryName}}',
							children: '{{data.list[_rowIndex].inventoryName}}',
						}]
					}
				}, {
					name: 'unitName',
					component: 'DataGrid.Column',
					// flexGrow: 1,
					columnKey: 'unitName',
					width: 90,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '计量单位'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						_power: '({rowIndex})=>rowIndex',
						className: 'center',
						children: [{
							name: 'unitName',
							component: '::span',
							title: '{{data.list[_rowIndex].unitName}}',
							children: '{{data.list[_rowIndex].unitName}}',
						}]
					}
				}, {
					name: 'periodBeginQuantity',
					component: 'DataGrid.Column',
					flexGrow: 1,
					columnKey: 'periodBeginQuantity',
					width: 120,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '期初数量'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						_power: '({rowIndex})=>rowIndex',
						className: 'right',
						children: [{
							name: 'periodBeginQuantity',
							component: '::span',   
							title: '{{$renderQuantity(data.list[_rowIndex].periodBeginQuantity)}}',
							children: '{{$renderQuantity(data.list[_rowIndex].periodBeginQuantity)}}',
						}]
					}
				}, {
					name: 'receiveQuantity',
					component: 'DataGrid.Column',
					flexGrow: 1,
					columnKey: 'receiveQuantity',
					width: 120,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '采购数量'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						_power: '({rowIndex})=>rowIndex',
						className: 'right',
						children: [{
							name: 'receiveQuantity',
							component: '::span',
							title: '{{$renderQuantity(data.list[_rowIndex].receiveQuantity)}}',
							children: '{{$renderQuantity(data.list[_rowIndex].receiveQuantity)}}',
						}]
					}
				}, {
					name: 'dispatchQuantity',
					component: 'DataGrid.Column',
					flexGrow: 1,
					columnKey: 'dispatchQuantity',
					width: 120,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '销售数量'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						_power: '({rowIndex})=>rowIndex',
						className: 'right',
						children: [{
							name: 'dispatchQuantity',
							component: '::span',
							title: '{{$renderQuantity(data.list[_rowIndex].dispatchQuantity)}}',
							children: '{{$renderQuantity(data.list[_rowIndex].dispatchQuantity)}}',
						}]
					}
				}, {
					name: 'periodEndQuantity',
					component: 'DataGrid.Column',
					flexGrow: 1,
					columnKey: 'periodEndQuantity',
					width: 120,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '期末数量'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						_power: '({rowIndex})=>rowIndex',
						className: 'right',
						children: [{
							name: 'periodEndQuantity',
							component: '::span',
							// title: '{{$renderQuantity(data.list[_rowIndex].periodBeginQuantity, data.list[_rowIndex].receiveQuantity, data.list[_rowIndex].dispatchQuantity)}}',
							title: '{{$renderQuantity(data.list[_rowIndex].periodEndQuantity)}}',
							children: '{{$renderQuantity(data.list[_rowIndex].periodEndQuantity)}}',
							// children: '{{$renderQuantity(data.list[_rowIndex].periodBeginQuantity, data.list[_rowIndex].receiveQuantity, data.list[_rowIndex].dispatchQuantity)}}',
						}]
					}
				}, {
					name: 'temporaryEstimationQty',
					component: 'DataGrid.Column',
					flexGrow: 1,
					columnKey: 'temporaryEstimationQty',
					width: 120,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '暂估数量'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						_power: '({rowIndex})=>rowIndex',
						className: 'right',
						children: [{
							name: 'temporaryEstimationQty',
							component: '::span',
							title: '{{$renderQuantity(data.list[_rowIndex].temporaryEstimationQty)}}',
							children: '{{$renderQuantity(data.list[_rowIndex].temporaryEstimationQty)}}',
						}]
					}
				}, {
					name: 'amount',
					component: 'DataGrid.Column',
					flexGrow: 1,
					columnKey: 'amount',
					width: 120,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '暂估金额'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						_power: '({rowIndex})=>rowIndex',
						className: 'right',
						children: [{
							name: 'amount',
							component: '::span',
							title: '{{data.list[_rowIndex].amount}}',
							children: {
								name: 'amount',
								component: 'Input.Number',
								value: '{{data.list[_rowIndex].amount}}',
								executeBlur: true,
								onChange: '{{function(value){$amountChange(value, _rowIndex)}}}',//$amountBlur(data.list[_rowIndex].amount, _rowIndex)
								onBlur: '{{function(value){$amountBlur(value, _rowIndex)}}}'
							}
						}]
					}
				}]
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			form:{
				// inventoryPropertyId: undefined,
				accountingPeriod: moment()
			},
			other: {
				inventoryPropertyOption: []
			},
			list: []
		}
	}
}