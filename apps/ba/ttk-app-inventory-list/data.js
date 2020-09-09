export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-app-inventory-list',
		children: [{
			name: 'root-content',
			component: 'Layout',
			className: 'ttk-app-inventory-list-backgroundColor',
			children: [{
				name: 'header',
				component: '::div',
				className: 'ttk-app-inventory-list-header',
				children: [{
					name: 'btnGroup',
					component: 'Layout',
					className: 'ttk-app-inventory-list-header-left',
					children: [{
                        name: 'header-filter-input',
                        component: 'Input',
                        className: 'filter-input',
                        type: 'text',
                        placeholder: '请输入存货编号或存货名称',
                        onPressEnter: '{{$refresh}}',
                        onChange: "{{function (e) {$sf('data.inputVal', e.target.value); $searchList()}}}",
                        prefix: {
                            name: 'search',
                            component: 'Icon',
                            type: 'search'
                        }
                    }, {
                        name: 'popover',
                        component: 'Popover',
                        popupClassName: 'ttk-app-inventory-list-popover',
                        placement: 'bottom',
                        title: '',
                        content: {
                            name: 'popover-content',
                            component: '::div',
                            className: 'content',
                            children: [{
                                name: 'filter-content',
                                component: '::div',
                                className: 'filter-content',
                                children: [{
                                    name: 'popover-goods',
                                    component: '::div',
                                    className: 'item',
                                    children: [{
                                        name: 'label',
                                        component: '::span',
                                        children: '存货类型：',
                                        className: 'label'
                                    }, {
                                        name: 'month-select',
                                        component: 'Select',
										value: '{{data.form.propertyId}}',
										placeholder: '请选择货物类型',
										getPopupContainer:'{{function(trigger) {return trigger.parentNode}}}',
                                        onChange: "{{function (e) {$sf('data.form.propertyId', e)}}}",
                                        children: {
                                            name: 'option',
                                            component: '::Select.Option',
                                            children: '{{data.goodsTypes[_rowIndex].name}}',
                                            value: '{{data.goodsTypes[_rowIndex].id}}',
                                            _power: 'for in data.goodsTypes'
                                        }
                                    }]
                                }]
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
                                        onClick: "{{function () {$sf('data.showPopoverCard', false); $searchList('filter')}}}",
                                    },
                                    {
                                    name: 'reset',
                                    className: 'reset-btn',
                                    component: 'Button',
                                    children: '重置',
                                    onClick: "{{function (e) {$sf('data.form.propertyId', 0)}}}",
                                }]
                            }]
                        },
                        trigger: 'click',
                        visible: '{{data.showPopoverCard}}',
                        onVisibleChange: "{{$handlePopoverVisibleChange}}",
                        children: {
                            name: 'filterSpan',
                            component: '::span',
                            className: 'filter-btn header-item',
                            children: {
                                name: 'filter',
                                component: 'Icon',
                                type: 'filter'
                            }
                        }
                    }]
				},{
					name: 'btnGroup',
					component: 'Layout',
					className: 'ttk-app-inventory-list-header-right',
					children: [{
						name: 'add',
						component: 'Button',
						children: '新增',
						type: 'primary',
						className: 'btn',
						onClick: '{{$addModel}}'
					}, {
						name: 'del',
						component: 'Button',
						children: '删除',
						className: 'btn',
						onClick: '{{$delClickBatch}}'
					},{
						name: 'mores',
						component: 'Dropdown',
						className: 'btn',
						overlay: {
							name: 'more-item',
							component: 'Menu',
							onClick: '{{$moreClick}}',
							children: [{
								name: 'import',
								component: 'Menu.Item',
								key: 'import',
								children: '导入'
							},{
								name: 'export',
								component: 'Menu.Item',
								key: 'export',
								children: '导出'
							},{
								name: 'copy',
								component: 'Menu.Item',
								key: 'copy',
								children: '复制科目'  
							},{
								name: 'setType',
								component: 'Menu.Item',
								key: 'setType',
								children: '设置存货类型'
							}]
						},
						children: {
							name: 'morename',
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
					}]
				}]
			}, {
				name: 'content',
				component: 'Layout',
				className: 'ttk-app-inventory-list-content',
				children: [{
					name: 'dataGrid',
					component: 'DataGrid',
					ellipsis: true,
					headerHeight: 37,
					rowHeight: 37,
					isColumnResizing: false,
					readonly: true,
					// onRow: '{{}}',
					// onRow: '{record => {
					// 	return {
					// 	  onDoubleClick: event => {},
					// 	}
					//   }}'',
					onRowDoubleClick: '{{$onRowDoubleClick}}',
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
						name: 'code',
						component: 'DataGrid.Column',
						columnKey: 'code',
						width: 100,
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
							children: '{{data.list[_rowIndex].code}}',
						}
					}, {
						name: 'name',
						component: 'DataGrid.Column',
						columnKey: 'name',
						flexGrow: 1,
						width: 100,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '存货名称'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							className: 'mk-datagrid-cellContent-left',
							tip: true,
							_power: '({rowIndex})=>rowIndex',
							children: '{{data.list[_rowIndex].name }}'
						}
					}, {
						name: 'specification',
						component: 'DataGrid.Column',
						columnKey: 'specification',
						width: 140,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '规格型号'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: 'mk-datagrid-cellContent-left',
							children: '{{data.list[_rowIndex].specification }}',
							_power: '({rowIndex})=>rowIndex'
						}
					}, {
						name: 'propertyName',
						component: 'DataGrid.Column',
						columnKey: 'propertyName',
						width: 140,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '存货类型'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: 'mk-datagrid-cellContent-left',
							_power: '({rowIndex})=>rowIndex',
							children: '{{data.list[_rowIndex].propertyName }}'
						}
					}, {
						name: 'unitName',
						component: 'DataGrid.Column',
						columnKey: 'unitName',
						width: 140,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '计量单位组'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: 'mk-datagrid-cellContent-left',
							_power: '({rowIndex})=>rowIndex',
							children: '{{data.list[_rowIndex].unitName}}'
						}
					},{
						name: 'inventoryRelatedAccountName',
						component: 'DataGrid.Column',
						columnKey: 'inventoryRelatedAccountName',
						width: 150,
						flexGrow: 1,
						header: {
							name: 'header',
							component: 'DataGrid.Cell',
							children: '存货科目'
						},
						cell: {
							name: 'cell',
							component: 'DataGrid.Cell',
							tip: true,
							className: 'mk-datagrid-cellContent-left',
							_power: '({rowIndex})=>rowIndex',
							children: '{{data.list[_rowIndex].inventoryRelatedAccountName}}'
						}
					},{
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
							className: 'content-caozuo',
							// children: '{{data.list[_rowIndex].isEnable ? "停用" : "启用"}}',
							children: '{{$renderOper(_rowIndex, data.list[_rowIndex])}}',
							// onClick: '{{function(){$setStatus(data.list[_rowIndex], _rowIndex)}}}'
						}
					}]
				}]
			}]
		}, {
			name: 'footer',
			component: '::div',
			className: 'ttk-app-inventory-list-footer',
			children: [{
				name: 'pagination',
				component: 'Pagination',
				showSizeChanger: true,
				pageSizeOptions: ['50', '100', '200', '300'],
				pageSize: '{{data.pagination.pageSize}}',
				current: '{{data.pagination.currentPage}}',
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
			pagination: {
				currentPage: 1,
				total: 0,
				pageSize: 50
			},
			columns: [],
            other:{
				property: [],
				loading: false
			},
			goodsTypes: [],
			form: {
				propertyId: 0
			},
			search: {
				id: 0
			}
		}
	};
}
