export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: '{{$heightCount()}}',
		children: [{
			name: 'left',
			component: 'Card',
			className: 'ttk-es-app-usermanage-left',
			title: '部门列表',
			children: {
				name: 'tree',
				component: 'Tree',
				className: 'ttk-es-app-usermanage-tree',
				defaultExpandedKeys: '{{["genid"]}}',
				selectedKeys: '{{data.treeSelectedKey}}',
				onSelect: '{{$selectType}}',
				//showLine: true,//树形菜单线的效果
				children: '{{$renderTreeNodes(data.other.tree)}}'
			}
		}, {
			name: 'resizer',
			component: 'Resizer'
		}, {
			name: 'content',
			component: 'Card',
			className: 'ttk-es-app-usermanage-content',
			title: '{{data.persName}}',
			extra: {
				name: 'header',
				component: '::div',
				className: 'ttk-es-app-usermanage-content-header',
				children: [{
					name: 'inventoryName',
					component: 'Input.Search',
					showSearch: true,
					placeholder: '请输入姓名',
					className:'ttk-es-app-usermanage-content-header-search',
					value:'{{data.name}}',
					onChange: `{{function(e){$nameChange(e.target.value)}}}`,
				},{
					name: 'add',
					component: 'Button',
					children: '新增',
					className: 'btn',
					type: 'primary',
					onClick: '{{$addPerson}}'
				},{
					name: 'setting',
					component: 'Button',
					className: 'btn',
					children: '删除',
					onClick: '{{$delBatch}}'
				},{//更多操作
					name:'moreOpr',
					component:'Dropdown',
					className:'ant-dropdown-link btn',
					overlay:{
						name:'menu0',
						component:'Menu',
						children:[{
							name:'menu1',
							component: 'Menu.Item',
							key:'moveDepart',
							onClick:'{{$moveDepartMent}}',
							children: '部门调动'
						}]
					},
					children:{
						name:'menu4',
						component: 'Button',
						children: ['更多',{
							name:'moreIcon',
							component:'Icon',
							fontFamily:'',
							style:{fontSize:'18px',verticalAlign:'middle'},
							type:'down'
						}]
					}
				
				}]
			},
			children: [{
				name: 'dataGrid',
				component: 'DataGrid',
				className: 'ttk-es-app-usermanage-content-content',
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
					width: 137,
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
						children: '{{$clickCompent(data.list[_rowIndex])}}'
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
						className: '{{$isEnable(data.list[_rowIndex].tyzt)+" mk-datagrid-cellContent-left"}}',
						value: '{{data.list[_rowIndex].bmmc}}',
						_power: '({rowIndex})=>rowIndex'
					}
				}, {
					name: 'mobile',
					component: 'DataGrid.Column',
					columnKey: 'mobile',
					flexGrow: 1,
					width: 100,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '手机'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						tip: true,
						className: '{{$isEnable(data.list[_rowIndex].tyzt)+" mk-datagrid-cellContent-left"}}',
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
						className: '{{$isEnable(data.list[_rowIndex].tyzt)+" mk-datagrid-cellContent-left"}}',
						value: '{{data.list[_rowIndex].email}}',
						_power: '({rowIndex})=>rowIndex'
					}
				}, {
					name: 'role',
					component: 'DataGrid.Column',
					columnKey: 'role',
					flexGrow: 1,
					width: 124,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '岗位'
					},
					cell: {
						name: 'cell',
						tip: true,
						component: 'DataGrid.Cell',
						className: '{{$isEnable(data.list[_rowIndex].tyzt)+" mk-datagrid-cellContent-left"}}',
						// value: '{{$roleShow(data.list[_rowIndex])}}',
						value: '{{data.list[_rowIndex].roles}}',
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
						children: '数据权限'
					},
					cell: {
						name: 'cell',
						tip: true,
						component: 'DataGrid.Cell',
						// className: 'mk-datagrid-cellContent-left',
						className: '{{$isEnable(data.list[_rowIndex].tyzt)+" mk-datagrid-cellContent-left"}}',
						value: '{{data.list[_rowIndex].orgAuth == 0 ? "个人" : (data.list[_rowIndex].orgAuth == 1 ? "公司" : "部门")}}',
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
						children: '状态'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						tip: true,
						className: '{{$isEnable(data.list[_rowIndex].tyzt)+" mk-datagrid-cellContent-left"}}',
						className: 'mk-datagrid-cellContent-center',
						value: '{{data.list[_rowIndex].tyzt == 1 ? "启用" : "停用"}}',
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
						children: [
							 {
								name: 'update',
								component: '::span',
								children:'编辑',
								title: '编辑',
								style: {
									cursor: 'pointer',
									color:'#0066b3'
								},
								className: '{{$isEnable(data.list[_rowIndex].tyzt)}}',
								onClick: '{{$modifyDetail(data.list[_rowIndex].id,data.list[_rowIndex].tyzt)}}'
							},
							{
								name: 'splitLine',
								component: '::c',
								style: {
									margin: '0px 4px'
								},
								children: ' | ',
								title: ''
							},
							{
								name: 'isEnable',
								component: '::span',
								style: {
									cursor: 'pointer',
									color: '#0066b3'
								},
								children: '{{data.list[_rowIndex].tyzt == 1 ? "停用" : "启用"}}',
								_visible:'{{data.list[_rowIndex].mobile !== data.mobile}}',
								onClick: '{{function(){$tyztChange(data.list[_rowIndex])}}}'
							},
                            {
                                name: 'isEnable',
                                component: '::span',
                                style: {
                                    color: '#9e9e9e'
                                },
                                children: '{{data.list[_rowIndex].tyzt == 1 ? "停用" : "启用"}}',
                                _visible:'{{data.list[_rowIndex].mobile == data.mobile}}',
                            }
							]
					}
				}]
			}, {
				name: 'footer',
				component: '::div',
				className: 'ttk-es-app-usermanage-content-footer',
				children: [{
					name: 'pagination',
					component: 'Pagination',
					showSizeChanger: true,
					pageSize: '{{data.pagination.pageSize}}',
					current: '{{data.pagination.current}}',
					total: '{{data.pagination.total}}',
					onChange: '{{$pageChanged}}',
                    showTotal: '{{$pageTotal}}',
					onShowSizeChange: '{{$pageChanged}}'
				}]
			}]
		}]
	};
}

export function getInitState() {
	return {
		data: {
			//persName: '人员',
			persName: '',
			user: {},
			list: [],
			entity:{
				fuzzyCondition:""
			},
			bmdm: '',
			name: '',
			departId:'',
			departCode:'',
			isDelDept: true,
			pagination: {
				current: 1,
				total: 0,
				pageSize: 50
			},
			filter: {},
			other: {
				selectDepart: undefined,
				tree: []
			},
			status: {
				isDeptCreater: ''
			},
			expandedKeys: [],
			treeSelectedKey: [],
			mobile:''
		}

	};
}
