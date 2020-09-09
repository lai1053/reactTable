export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: '{{data.isFirstEntry ? "app-list-userdefinecard first-entry": "app-list-userdefinecard"}}',
		children: [{
			name: 'card',
			component: '::div',
			className: 'app-list-userdefinecard-card',
			_visible: '{{data.other.entry == "name"}}',
			children: {
				name: 'card',
				component: '::div',
				className: 'app-list-userdefinecard-card-son',
				children: [{
					name: 'cardLeft',
					component: '::div',
					className: 'divLeft',
					children: {
						name: 'create',
						component: 'Icon',
						fontFamily: 'edficon',
						type: 'zidingyidanganxinzeng',
						style: {
							fontSize: 60,
							color: '#EC826A'
						},
					}
				}, {
					name: 'cardRight',
					component: '::div',
					className: 'divRight',
					children: [{
						name: 'title',
						component: '::p',
						className: 'pMargin',
						children: '亲！系统预置了部门、人员、供应商、客户、项目、存货6个辅助核算'
					}, {
						name: 'root',
						component: '::p',
						children: '我们支持更多...'
					}, {
						name: 'root',
						component: 'Button',
						className: 'btn',
						type: 'primary',
						children: '新增自定义档案',
						onClick: '{{$addArchives}}',
					}, {
						name: 'root',
						component: '::div',
						className: 'line',
						children: ''
					}, {
						name: 'root',
						component: '::p',
						className: 'pMargin',
						children: '使用说明：'
					}, {
						name: 'root',
						component: '::p',
						children: [{
							name: 'root',
							component: '::span',
							children: '增加档案后，在'
						}, {
							name: 'root',
							component: '::a',
							children: '科目档案',
							onClick: '{{$openSubject}}',
						}, {
							name: 'root',
							component: '::span',
							children: '选择对应科目，启用对应辅助核算项目'
						}]
					}]
				},]
			}

		}, {
			name: 'root',
			component: 'Layout',
			className: 'app-list-userdefinecard-grid',
			_visible: '{{data.other.entry == "list"}}',
			children: [{
				name: 'root-content',
				component: 'Layout',
				className: 'app-list-userdefinecard-backgroundColor',
				children: [{
					name: 'header',
					component: '::div',
					className: 'app-list-userdefinecard-grid-header',
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
						onClick: '{{$refresh}}'
					}, {
						name: 'btnGroup',
						component: 'Layout',
						className: 'app-list-userdefinecard-grid-header-right',
						children: [{
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
						}]
					}]
				}, {
					name: 'content',
					component: 'Layout',
					className: 'app-list-userdefinecard-grid-content',
					children: [{
						name: 'departmentWidth',
						component: '::div',
						className: 'app-list-userdefinecard-department',
						children: {
							name: 'tabNav',
							component: 'Tabs',
							activeKey: '{{data.tabKey}}',
							onChange: `{{$tabChange}}`,
							children: [{
								name: "option",
								component: 'Tabs.TabPane',
								tab: [{
									name: 'tab',
									component: '::div',
									children: '{{ data.other.userDefineArchives && data.other.userDefineArchives[_rowIndex].name }}'
								}, {
									name: 'del',
									component: 'Icon',
									className: 'delArchives',
									fontFamily: 'edficon',
									disabled:'{{!!data.modelStatus}}',
									type: 'guanbi',
									style: {
										fontSize: 18
									},
									title: '删除',
									onClick: '{{!!data.modelStatus ? "" : $delArchives}}'
								}],
								key: "{{ data.other.userDefineArchives && data.other.userDefineArchives[_rowIndex].id}}",
								_power: 'for in data.other.userDefineArchives'
							}, {
								name: "add",
								component: 'Tabs.TabPane',
								tab: {
									name: 'add',
									component: 'Icon',
									className: 'addArchives',
									fontFamily: 'edficon',
									type: 'gaojichaxunlidejia',
									style: {
										fontSize: 22
									},
									title: '新增',
									onClick: '{{$addArchives}}'
								},
								key: "add",
							}]
						}
					}, {
						name: 'dataGrid',
						component: 'DataGrid',
						className: '{{$heightCount()}}',
						ellipsis: true,
						headerHeight: 37,
						rowHeight: 37,
						isColumnResizing: false,
						loading: '{{data.other.loading}}',
						startSequence: '{{(data.pagination.currentPage-1)*data.pagination.pageSize + 1}}',
						rowsCount: "{{$getListRowsCount()}}",
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
							name: 'code',
							component: 'DataGrid.Column',
							columnKey: 'code',
							flexGrow: 1,
							width: 120,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '编码'
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
								children: '名称'
							},
							cell: {
								name: 'cell',
								component: "DataGrid.Cell",
								tip: true,
								// className: 'mk-datagrid-cellContent-left',
								className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
								value: "{{data.list[_rowIndex].name}}",
								_power: '({rowIndex})=>rowIndex',
							}
						}, {
							name: 'remark',
							component: 'DataGrid.Column',
							columnKey: 'remark',
							flexGrow: 1,
							width: 257,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '备注'
							},
							cell: {
								name: 'cell',
								component: "DataGrid.Cell",
								tip: true,
								// className: 'mk-datagrid-cellContent-left',
								className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
								value: "{{data.list[_rowIndex].remark}}",
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
					}
					]
				}]
			}, {
				name: 'footer',
				component: '::div',
				className: 'app-list-userdefinecard-grid-footer',
				children: [{
					name: 'pagination',
					component: 'Pagination',
					showSizeChanger: true,
					pageSize: '{{data.pagination.pageSize}}',
					current: '{{data.pagination.current}}',
					total: '{{data.pagination.total}}',
					onChange: '{{$pageChanged}}',
					onShowSizeChange: '{{$pageChanged}}',
				}]
			}]
		}],
	}
}

export function getInitState() {
	return {
		data: {
			list: [],
			tabKey: '',
			other: {
				entry: '',
				userDefineArchives: []
			},
			modelStatus:'',
			pagination: {
				current: 1,
				total: 0,
				pageSize: 50
			},
		}
	}
}
