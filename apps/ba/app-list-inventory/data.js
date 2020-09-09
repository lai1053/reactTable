export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-list-inventory',
		children: [{
			name: 'root-content',
			component: 'Layout',
			className: 'app-list-inventory-backgroundColor',
			children: [{
				name: 'header',
				component: '::div',
				className: 'app-list-inventory-header',
				children: [{
					name: 'inventoryName',
					component: 'Input.Search',
					showSearch: true,
					placeholder: '请输入存货编码/存货名称',
					className:'app-list-inventory-header-left-search',
					// onSearch:'{{$load}}',
					value:'{{data.entity.fuzzyCondition}}',
					onChange: `{{function(e){$sf('data.entity.fuzzyCondition',e.target.value);$search()}}}`,
				},{
                    name: 'property',
                    component: 'Select',
                    placeholder: '请选择存货及服务分类',
                    allowClear: true,
                    className:'app-list-inventory-header-left-search',
                    onChange: `{{function(value){$sf('data.entity.propertyId',value);$search()}}}`,
                    dropdownClassName: 'app-list-inventory-dropdown',
                    children: {
                        name: 'selectItem',
                        component: 'Select.Option',
                        value: '{{data.other.property[_rowIndex].id}}',
                        children: '{{data.other.property[_rowIndex].name}}',
                        _power: 'for in data.other.property'
                    }
                },{
					name: 'refresh',
					component: '::div',
					className: 'app-list-inventory-header-left',
					children: [{
						name: 'refresh',
						component: 'Button',
						className: 'refresh',
						children: {
							name: 'userIcon',
							className: 'refresh-btn',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'shuaxin'
						},
						onClick: '{{$load}}'
					}]
				}, {
					name: 'btnGroup',
					component: 'Layout',
					className: 'app-list-inventory-header-right',
					children: [
					// 	{
					// 	name: '11',
					// 	component: 'Button',
					// 	children: '存货dz',
					// 	className: 'btn',
					// 	onClick: '{{$adddz1}}'
					// }, {
					// 	name: '22',
					// 	component: 'Button',
					// 	children: '计量单位dz',
					// 	className: 'btn',
					// 	onClick: '{{$adddz2}}'
					// },
					{
						name: 'add',
						component: 'Button',
						children: '新增',
						type: 'primary',
						className: 'btn',
						onClick: '{{$addClick}}'
					}, {
						name: 'del',
						component: 'Button',
						children: '删除',
						className: 'btn',
						onClick: '{{$delClickBatch}}'
					}, {
						name: 'batch',
						component: 'Button',
						children: '批量修改',
						className: 'btn',
						onClick: '{{function(){$moreClick({key:"batchChange"})}}}'
					}, {
						name: 'revenueTypt',
						component: 'Button',
						children: '科目自动生档案',
						className: 'btn',
						onClick: '{{$subjectsCreateInventory}}'
					}, {
						name: 'revenueTypt',
						component: 'Button',
						children: '设置默认收入类型',
						className: 'btn',
						onClick: '{{$revenueTypeChange}}'
					}/*,{
						name: 'batch3',
						component: 'Dropdown',
						className: 'btn',
						overlay: {
							name: 'menu',
							component: 'Menu',
							onClick: '{{$moreClick}}',
							children: [{
									name: 'batchChange',
									component: 'Menu.Item',
									key: 'batchChange',
									children: '批量修改'
								}]
						},
						children: {
							name: 'internal',
							component: 'Button',
							children: [{
								name: 'word',
								component: '::span',
								children: '更多'
							}, {
								name: 'more',
								component: 'Icon',
								type: 'down'
							}]
						}
					}*/]
				}]
			}, {
				name: 'content',
				component: 'Layout',
				className: 'app-list-inventory-content',
				children: [{
					name: 'dataGrid',
					component: 'DataGrid',
					className: '{{$heightCount()}}',
					ellipsis: true,
					headerHeight: 37,
					rowHeight: 37,
					isColumnResizing: false,
					loading: '{{data.other.loading}}',
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
						name: 'propertyName',
						component: 'DataGrid.Column',
						columnKey: 'propertyName',
						flexGrow: 1,
						width: 100,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '存货及服务分类'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							// className: 'mk-datagrid-cellContent-left',
							className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
							_power: '({rowIndex})=>rowIndex',
							children: '{{data.list[_rowIndex].propertyName }}'
						}
					}, {
						name: 'code',
						component: 'DataGrid.Column',
						columnKey: 'code',
						flexGrow: 1,
						width: 68,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '存货编码'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							className: 'mk-datagrid-cellContent-left',
							_power: '({rowIndex})=>rowIndex',
							// children: [{
							// 	name: 'code',
							// 	component: '::a',
							// 	title: '{{data.list[_rowIndex].code}}',
							// 	children: '{{data.list[_rowIndex].code}}',
							// 	onClick: '{{$modifyDetail(data.list[_rowIndex].id)}}'
							// }]
							children: '{{$clickCompent(data.list[_rowIndex])}}'
						}
					}, {
						name: 'name',
						component: 'DataGrid.Column',
						columnKey: 'name',
						flexGrow: 1,
						width: 137,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '存货名称'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							// className: 'mk-datagrid-cellContent-left',
							className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
							_power: '({rowIndex})=>rowIndex',
							children: '{{data.list[_rowIndex].name }}'
						}
					}, {
						name: 'specification',
						component: 'DataGrid.Column',
						columnKey: 'specification',
						flexGrow: 1,
						width: 120,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '规格型号'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							// className: 'mk-datagrid-cellContent-left',
							className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
							_power: '({rowIndex})=>rowIndex',
							children: '{{data.list[_rowIndex].specification }}'
						}
					}, {
						name: 'unitName',
						component: 'DataGrid.Column',
						columnKey: 'unitName',
						width: 76,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '计量单位'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							// className: 'mk-datagrid-cellContent-left',
							className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-center"}}',
							_power: '({rowIndex})=>rowIndex',
							children: '{{data.list[_rowIndex].unitName}}'
						}
					}, {
						name: 'rateName',
						component: 'DataGrid.Column',
						columnKey: 'rateName',
						width: 80,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '税率'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							// className: 'mk-datagrid-cellContent-right',
							className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-right"}}',
							_power: '({rowIndex})=>rowIndex',
							children: '{{data.list[_rowIndex].rateName}}'
						}
					},
					// {
					// 	name: 'taxClassificationId',
					// 	component: 'DataGrid.Column',
					// 	columnKey: 'taxClassificationId',
					// 	flexGrow: 1,
					// 	width: 152,
					// 	header: {
					// 		name: 'header',
					// 		component: 'DataGrid.Cell',
					// 		children: '税收分类编码'
					// 	},
					// 	cell: {
					// 		name: 'cell',
					// 		component: 'DataGrid.Cell',
					// 		tip: true,
					// 		// className: 'mk-datagrid-cellContent-left',
					// 		className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
					// 		_power: '({rowIndex})=>rowIndex',
					// 		children: '{{data.list[_rowIndex].taxClassificationId}}'
					// 	}
					// },
					 {
						name: 'inventoryRelatedAccountName',
						_visible: '{{data.queryByparamKeys.CertificationGeneration_InventoryAccount != "default"}}',
						component: 'DataGrid.Column',
						columnKey: 'inventoryRelatedAccountName',
						flexGrow: 1,
						width: 152,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '存货对应科目'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							// className: 'mk-datagrid-cellContent-left',
							className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
							_power: '({rowIndex})=>rowIndex',
							children: '{{data.list[_rowIndex].inventoryRelatedAccountName}}'
						}
					},{
						name: 'salesCostAccountName',
						_visible: '{{data.queryByparamKeys.CertificationGeneration_SalesCostAccount != "default"}}',
						component: 'DataGrid.Column',
						columnKey: 'salesCostAccountName',
						flexGrow: 1,
						width: 152,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '销售成本对应科目'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							// className: 'mk-datagrid-cellContent-left',
							className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
							_power: '({rowIndex})=>rowIndex',
							children: '{{data.list[_rowIndex].salesCostAccountName}}'
						}
					},
					//  {
					// 	name: 'taxClassificationName',
					// 	component: 'DataGrid.Column',
					// 	columnKey: 'taxClassificationName',
					// 	flexGrow: 1,
					// 	width: 92,
					// 	header: {
					// 		name: 'header',
					// 		component: 'DataGrid.Cell',
					// 		children: '税收分类名称'
					// 	},
					// 	cell: {
					// 		name: 'cell',
					// 		component: 'DataGrid.Cell',
					// 		tip: true,
					// 		// className: 'mk-datagrid-cellContent-left',
					// 		className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
					// 		_power: '({rowIndex})=>rowIndex',
					// 		children: '{{data.list[_rowIndex].taxClassificationName}}'
					// 	}
					// },
					{
						name: 'revenueTypeName',
						component: 'DataGrid.Column',
						columnKey: 'revenueTypeName',
						flexGrow: 1,
						width: 128,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '收入类型'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							// className: 'mk-datagrid-cellContent-left',
							className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
							_power: '({rowIndex})=>rowIndex',
							children: '{{data.list[_rowIndex].revenueTypeName}}'
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
							style: { display: 'flex' },
							_power: '({rowIndex})=>rowIndex',
							children: [{
								name: 'isEnable',
								component: 'Icon',
								fontFamily: 'edficon',
								type: '{{data.list[_rowIndex].isEnable ? "tingyong-" : "qiyong-"}}',
								style: {
									fontSize: 23,
									marginRight: '4px',
									cursor: 'pointer'
								},
								title: '{{data.list[_rowIndex].isEnable ? "已启用" : "已停用"}}',
								onClick: '{{$personStatusClick(data.list[_rowIndex], _rowIndex)}}'
							}, {
								name: 'update',
								component: 'Icon',
								fontFamily: 'edficon',
								type: 'bianji',
								style: {
									fontSize: 23,
									cursor: 'pointer'
								},
								title: '编辑',
								onClick: '{{$modifyDetail(data.list[_rowIndex].id)}}'
							}, {
								name: 'remove',
								component: 'Icon',
								fontFamily: 'edficon',
								type: 'shanchu',
								style: {
									fontSize: 23,
									cursor: 'pointer'
								},
								title: '删除',
								onClick: '{{$delClick(data.list[_rowIndex])}}'
							}]
						}
					}]
				}]
			}]
		}, {
			name: 'footer',
			component: '::div',
			className: 'app-list-inventory-footer',
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
	};
}

export function getInitState() {
	return {
		data: {
			list: [],
			entity:{
				fuzzyCondition:null,
                propertyId: null
			},
			pagination: {
				current: 1,
				total: 0,
				pageSize: 50
			},
			columns: [],
            other:{
                property: []
			},
			queryByparamKeys:{
				CertificationGeneration_InventoryAccount: "default",
				CertificationGeneration_SalesCostAccount: "default"
			}
		}
	};
}
