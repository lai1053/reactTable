export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: '{{$heightCount()}}',
		children: [{
			name: 'left',
			component: 'Card',
			className: 'edfx-deptPers-left',
			title: '部门',
			extra: {
				name: 'header',
				component: '::div',
				children: [{
					name: 'add',
					component: 'Button',
					style: { marginRight: '8px' },
					icon: 'plus',
					onClick: '{{$addDept}}'
				}, {
					name: 'modify',
					component: 'Button',
					style: { marginRight: '8px' },
					icon: 'edit',
					onClick: '{{$editDept}}'
				}, {
					name: 'del',
					component: 'Button',
					icon: 'close',
					onClick: '{{$delDept}}'
				}]
			},
			children: {
				name: 'tree',
				component: 'Tree',
				className: 'edfx-deptPers-tree',
				defaultExpandedKeys: '{{["genid"]}}',
				selectedKeys: '{{data.treeSelectedKey}}',
				onSelect: '{{$selectType}}',
				children: '{{$renderTreeNodes(data.other.tree)}}'
			}
		}, {
			name: 'resizer',
			component: 'Resizer'
		}, {
			name: 'content',
			component: 'Card',
			className: 'edfx-deptPers-content',
			title: '{{data.persName}}',
			extra: {
				name: 'header',
				component: '::div',
				className: 'edfx-deptPers-content-header',
				children: [{
					name: 'inventoryName',
					component: 'Input.Search',
					showSearch: true,
					placeholder: '请输入姓名',
					className:'edfx-deptPers-content-header-search',
					// onSearch:'{{function(){$load()}}}',
					value:'{{data.entity.fuzzyCondition}}',
					onChange: `{{function(e){$sf('data.entity.fuzzyCondition',e.target.value);$search()}}}`,
				},{
					name: 'del',
					component: 'Button',
					children: '新增',
					className: 'btn',
					type: 'primary',
					onClick: '{{$addPerson}}'
				}, /*{
                    name: 'del',
                    component: 'Button',
                    children: '导入人员',
                    className: 'btn btnMarginRight',
                    onClick: '{{$importPerson}}'
                }, {
                    name: 'batch',
                    component: 'Dropdown',
                    overlay: {
                        name: 'menu',
                        component: 'Menu',
                        onClick: '{{$batchMenuClick}}',
                        children: [{
                            name: 'tempt',
                            component: 'Menu.Item',
                            key: 'tempt',
                            children: '模版下载'
                        }]
                    },
                    children: {
                        name: 'internal',
                        component: 'Button',
                        className: 'edfx-deptPers-content-header-more',
                        children: [{
                            name: 'more',
                            component: 'Icon',
                            type: 'down'
                        }]
                    }
                },*/ {
					name: 'add',
					component: 'Button',
					className: 'btn',
					_visible: '{{data.status.isDeptCreater && !(data.appVersion == 107 && sessionStorage["dzSource"] == 1) && data.appVersion != 114}}',
					children: '企业移交',
					onClick: '{{$transPrises}}'
				}, {
					name: 'setting',
					component: 'Button',
					className: 'btn',
					children: '删除',
					onClick: '{{$delBatch}}'
				}, {
					name: 'import',
					component: 'Button',
					onClick: '{{$importPerson}}',
					className: 'importIconBtn',
					title: '导入',
					children: [{
						name: 'import',
						component: 'Icon',
						fontFamily: 'edficon',
						type: 'daoru',
						style: {
							fontSize: '28px'
						}
					}]
				}, {
					name: 'export',
					component: 'Button',
					onClick: '{{$exportPerson}}',
					className: 'exportIconBtn',
					title: '导出',
					children: [{
						name: 'more',
						component: 'Icon',
						fontFamily: 'edficon',
						type: 'daochu',
						style: {
							fontSize: '28px'
						}
					}]
				}]
			},
			children: [{
				name: 'dataGrid',
				component: 'DataGrid',
				className: 'edfx-deptPers-content-content',
				ellipsis: true,
				headerHeight: 37,
				rowHeight: 37,
				loading: '{{data.other.loading}}',
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
							// disabled: '{{(data.list[_rowIndex].isOrgCreator && data.list[_rowIndex].isOrgCreator == true) || (data.list[_rowIndex].id && data.list[_rowIndex].id == data.user.personid)}}',
							component: 'Checkbox',
							checked: '{{data.list[_rowIndex].selected}}',
							onChange: '{{$selectRow(_rowIndex)}}'
						}]
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
						children: '姓名'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						className: 'mk-datagrid-cellContent-left',
						_power: '({rowIndex})=>rowIndex',
						// children: [{
						// 	name: 'name',
						// 	component: '::a',
						// 	title: '{{data.list[_rowIndex].name}}',
						// 	children: '{{data.list[_rowIndex].name}}',
						// 	onClick: '{{$modifyDetail(data.list[_rowIndex].id)}}'
						// }]
						children: '{{$clickCompent(data.list[_rowIndex])}}'
					}
				}, {
					name: 'mobile',
					component: 'DataGrid.Column',
					columnKey: 'mobile',
					flexGrow: 1,
					width: 100,
                    _visible: '{{data.appVersion != 114}}',
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '手机号'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						tip: true,
						// className: 'mk-datagrid-cellContent-left',
						className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
						value: '{{data.list[_rowIndex].mobile}}',
						_power: '({rowIndex})=>rowIndex'
					}
				}, {
					name: 'email',
					component: 'DataGrid.Column',
					columnKey: 'email',
					flexGrow: 1,
					width: 100,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '邮箱'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						tip: true,
						// className: 'mk-datagrid-cellContent-left',
						className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
						value: '{{data.list[_rowIndex].email}}',
						_power: '({rowIndex})=>rowIndex'
					}
				}, {
					name: 'role',
					component: 'DataGrid.Column',
					columnKey: 'role',
					flexGrow: 1,
					width: 124,
                    _visible: '{{data.appVersion != 114}}',
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '角色'
					},
					cell: {
						name: 'cell',
						tip: true,
						component: 'DataGrid.Cell',
						// className: 'mk-datagrid-cellContent-left',
						className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
						value: '{{$roleShow(data.list[_rowIndex])}}',
						_power: '({rowIndex})=>rowIndex'
					}
				}, {
					name: 'departmentName',
					component: 'DataGrid.Column',
					columnKey: 'departmentName',
					flexGrow: 1,
					width: 100,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '部门'
					},
					cell: {
						name: 'cell',
						tip: true,
						component: 'DataGrid.Cell',
						// className: 'mk-datagrid-cellContent-left',
						className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
						value: '{{data.list[_rowIndex].departmentName}}',
						_power: '({rowIndex})=>rowIndex'
					}
				}, {
					name: 'jobDuty',
					component: 'DataGrid.Column',
					columnKey: 'jobDuty',
					flexGrow: 1,
					width: 100,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '职位'
					},
					cell: {
						name: 'cell',
						tip: true,
						component: 'DataGrid.Cell',
						// className: 'mk-datagrid-cellContent-left',
						className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
						value: '{{data.list[_rowIndex].jobDuty}}',
						_power: '({rowIndex})=>rowIndex'
					}
				}, {
					name: 'employeeName',
					component: 'DataGrid.Column',
					columnKey: 'employeeName',
					flexGrow: 1,
					width: 100,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '雇员'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						tip: true,
						// className: 'mk-datagrid-cellContent-left',
						className: '{{$isEnable(data.list[_rowIndex].isEnable)+" mk-datagrid-cellContent-left"}}',
						value: '{{data.list[_rowIndex].employeeName}}',
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
							disabled: '{{(data.list[_rowIndex].isOrgCreator && data.list[_rowIndex].isOrgCreator == true) || (data.list[_rowIndex].id && data.list[_rowIndex].id == data.user.personid)}}',
							type: '{{data.list[_rowIndex].isEnable ? "tingyong-" : "qiyong-"}}',
							style: {
								fontSize: 23,
								marginRight: '4px',
								cursor: 'pointer'
							},
							title: '{{data.list[_rowIndex].isEnable ? "已启用" : "已停用"}}',
							onClick: '{{function(){(data.list[_rowIndex].isOrgCreator && data.list[_rowIndex].isOrgCreator == true) || (data.list[_rowIndex].id && data.list[_rowIndex].id == data.user.personid) ? "" : $personStatusClick(data.list[_rowIndex], _rowIndex)}}}'
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
							disabled: '{{(data.list[_rowIndex].isOrgCreator && data.list[_rowIndex].isOrgCreator == true) || (data.list[_rowIndex].id && data.list[_rowIndex].id == data.user.personid)}}',
							style: {
								fontSize: 23,
								cursor: 'pointer'
							},
							title: '删除',
							onClick: '{{function(){(data.list[_rowIndex].isOrgCreator && data.list[_rowIndex].isOrgCreator == true) || (data.list[_rowIndex].id && data.list[_rowIndex].id == data.user.personid)? "" : $personDelClick(data.list[_rowIndex])}}}'
						}]
					}
				}]
			}, {
				name: 'footer',
				component: '::div',
				className: 'edfx-deptPers-content-footer',
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
		}]
	};
}

export function getInitState() {
	return {
		data: {
			persName: '人员',
			user: {},
			list: [],
			entity:{
				fuzzyCondition:""
			},
			departId:'',
			departCode:'',
			isDelDept: true,
			pagination: {
				current: 1,
				total: 0,
				pageSize: 50
			},
			filter: {},
			other: {},
			status: {
				isDeptCreater: ''
			},
			expandedKeys: [],
			treeSelectedKey: []
		}

	};
}
