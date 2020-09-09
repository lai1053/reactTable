import moment from 'moment'
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-rate-list',
		children: [
			{
				name: 'header',
				component: '::div',
				className: 'ttk-scm-app-rate-list-header',
				children: [{
					name: 'left',
					component: '::div',
					className: 'ttk-scm-app-rate-list-header-left',
					children: [{
						name: 'periodDate',
						component: 'DatePicker.MonthPicker',
						value: '{{$stringToMoment(data.periodDate)}}',
						onChange: "{{function(d){$periodChange('data.periodDate',$momentToString(d,'YYYY-MM'))}}}",
						disabledDate: '{{function(value){return $disabledMonth(value)}}}',
					}, {
						name: 'inventoryType',
						component: 'Select',
						showSearch: false,
						placeholder: '存货类型',
						allowClear: true,
						className: 'ttk-scm-app-rate-list-select',
						value: '{{data.form.propertyId}}',
						onChange: `{{function(v){$getBeginList(v)}}}`,
						children: {
							name: 'option',
							component: 'Select.Option',
							value: "{{data.other.propertys && data.other.propertys[_rowIndex].propertyId}}",
							title: "{{data.other.propertys && data.other.propertys[_rowIndex].propertyName}}",
							children: '{{data.other.propertys && data.other.propertys[_rowIndex].propertyName}}',
							_power: 'for in data.other.propertys'
						}
					},{
						name: 'search',
						component: 'Input.Search',
						className: 'mk-input',
						placeholder: "请输入编号/名称",
						autocomplete: "off",
						value:'{{data.form.paramName}}',
						onChange:'{{$changeCondition}}'
					},{
						name: 'refreshBtn',
						component: 'Icon',
						fontFamily: 'edficon',
						type: 'shuaxin',
						className: 'mk-normalsearch-reload',
						title:'刷新',
						onClick: '{{$refresh}}'
					}]
				},{
					name: 'right',
					component: '::div',
					className: 'ttk-scm-app-rate-list-header-right',
					children: [{
						name: 'print',
						component: 'Icon',
						fontFamily: 'edficon',
						className: 'btn print',
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
						className: 'btn export',
						type: 'daochu',
						title: '导出',
						onClick: '{{$exports}}',
						style: {
							fontSize: 28
						},
					}]
				}]
			},
			{
				name: 'content',
				component: 'Layout',
				className: 'ttk-scm-app-rate-list-content',
				children: {
					name: 'details',
					component: 'DataGrid',
					loading: '{{data.loading}}',
					className: 'ttk-scm-app-rate-list-form-details',
					headerHeight: 37,
					rowHeight: 37,
					key:'{{data.form.key}}',
					rowsCount: '{{data.list.length}}',
					columns: [
						{
							name: 'classification',
							component: 'DataGrid.Column',
							columnKey: 'classification',
							flexGrow: 1,
							width: 114,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '存货分类'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.TextCell',
								className: 'cellLeft',
								value: '{{data.list[_rowIndex] && data.list[_rowIndex].propertyName}}',
								title: '{{data.list[_rowIndex] && data.list[_rowIndex].propertyName}}',
								_power: '({rowIndex}) => rowIndex',
							}
						},
						{
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
								component: 'DataGrid.TextCell',
								className: 'cellLeft',
								value: '{{data.list[_rowIndex] && data.list[_rowIndex].inventoryCode}}',
								title: '{{data.list[_rowIndex] && data.list[_rowIndex].inventoryCode}}',
								_power: '({rowIndex}) => rowIndex',
							}
						},
						{
							name: 'name',
							component: 'DataGrid.Column',
							columnKey: 'name',
							flexGrow: 1,
							width: 114,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '存货名称'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.TextCell',
								className: 'cellLeft',
								value: '{{data.list[_rowIndex] && data.list[_rowIndex].inventoryName}}',
								title: '{{data.list[_rowIndex] && data.list[_rowIndex].inventoryName}}',
								_power: '({rowIndex}) => rowIndex',
							}
						},
						{
							name: 'type',
							component: 'DataGrid.Column',
							columnKey: 'type',
							flexGrow: 1,
							width: 114,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '规格型号'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.TextCell',
								className: 'cellLeft',
								value: '{{data.list[_rowIndex] && data.list[_rowIndex].specification}}',
								title: '{{data.list[_rowIndex] && data.list[_rowIndex].specification}}',
								_power: '({rowIndex}) => rowIndex',
							}
						},
						{
							name: 'unit',
							component: 'DataGrid.Column',
							columnKey: 'unit',
							flexGrow: 1,
							width: 68,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '计量单位'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.TextCell',
								className: 'cellcenter',
								value: '{{data.list[_rowIndex] && data.list[_rowIndex].unitName}}',
								title: '{{data.list[_rowIndex] && data.list[_rowIndex].unitName}}',
								_power: '({rowIndex}) => rowIndex',
							}
						},
						{
							name: 'quantity',
							component: 'DataGrid.Column',
							columnKey: 'quantity',
							flexGrow: 1,
							width: 108,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '出库数量'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.TextCell',
								className: 'cellright',
								value: '{{data.list[_rowIndex] && data.list[_rowIndex].quantity}}',
								title: '{{data.list[_rowIndex] && data.list[_rowIndex].quantity}}',
								_power: '({rowIndex}) => rowIndex',
							}
						},
						{
							name: 'salePrice',
							component: 'DataGrid.Column',
							columnKey: 'salePrice',
							flexGrow: 1,
							width: 108,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '出库单价'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.TextCell',
								className: 'cellright',
								value: "{{data.list[_rowIndex] && data.list[_rowIndex].stockPrice == 0 ? '' : data.list[_rowIndex].stockPrice}}",
								title: "{{data.list[_rowIndex] && data.list[_rowIndex].stockPrice == 0 ? '' : data.list[_rowIndex].stockPrice}}",
								_power: '({rowIndex}) => rowIndex',
							}
						},
						{
							name: 'stockAmount',
							component: 'DataGrid.Column',
							columnKey: 'stockAmount',
							flexGrow: 1,
							width: 108,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '销售成本'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.TextCell',
								className: 'cellright',
								value: '{{data.list[_rowIndex] && data.list[_rowIndex].stockAmount == 0 ? "" : data.list[_rowIndex].stockAmount}}',
								title: '{{data.list[_rowIndex] && data.list[_rowIndex].stockAmount == 0 ? "" : data.list[_rowIndex].stockAmount}}',
								_power: '({rowIndex}) => rowIndex',
							}
						},
						{
							name: 'price',
							component: 'DataGrid.Column',
							columnKey: 'price',
							flexGrow: 1,
							width: 108,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '销售单价'
							},
							cell: {
								name: 'cell',
								precision: 2,
								component: 'DataGrid.TextCell',
								className: 'cellright',
								value: '{{data.list[_rowIndex] && data.list[_rowIndex].salePrice == 0 ? "" : data.list[_rowIndex].salePrice}}',
								title: '{{data.list[_rowIndex] && data.list[_rowIndex].salePrice == 0 ? "" : data.list[_rowIndex].salePrice}}',
								_power: '({rowIndex}) => rowIndex',
							}
						},
						{
							name: 'saleAmount',
							component: 'DataGrid.Column',
							columnKey: 'saleAmount',
							flexGrow: 1,
							width: 108,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '销售收入'
							},
							cell: {
								name: 'cell',
								precision: 2,
								component: 'DataGrid.TextCell',
								className: 'cellright',
								value: '{{data.list[_rowIndex] && data.list[_rowIndex].saleAmount == 0 ? "" : data.list[_rowIndex].saleAmount}}',
								title: '{{data.list[_rowIndex] && data.list[_rowIndex].saleAmount == 0 ? "" : data.list[_rowIndex].saleAmount}}',
								_power: '({rowIndex}) => rowIndex',
							}
						},
						{
							name: 'grossProfitRate',
							component: 'DataGrid.Column',
							columnKey: 'grossProfitRate',
							flexGrow: 1,
							width: 108,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '毛利率'
							},
							cell: {
								name: 'cell',
								component: 'DataGrid.TextCell',
								className: 'cellright',
								value: '{{data.list[_rowIndex] && data.list[_rowIndex].grossProfitRate}}',
								title: '{{data.list[_rowIndex] && data.list[_rowIndex].grossProfitRate}}',
								_power: '({rowIndex}) => rowIndex',
							}
						},
						{
							name: 'grossProfitRateAmount',
							component: 'DataGrid.Column',
							columnKey: 'grossProfitRateAmount',
							flexGrow: 1,
							width: 108,
							header: {
								name: 'header',
								component: 'DataGrid.Cell',
								children: '毛利金额'
							},
							cell: {
								name: 'cell',
								precision: 2,
								component: 'DataGrid.TextCell',
								className: 'cellright',
								value: '{{data.list[_rowIndex] && data.list[_rowIndex].grossProfitRateAmount == 0 ? "" : data.list[_rowIndex].grossProfitRateAmount}}',
								title: '{{data.list[_rowIndex] && data.list[_rowIndex].grossProfitRateAmount == 0 ? "" : data.list[_rowIndex].grossProfitRateAmount}}',
								_power: '({rowIndex}) => rowIndex',
							}
						},
					]
				}
			},
			// {
			// 	name: 'footer',
			// 	component: '::div',
			// 	className: 'supplier-mapping-footer',
			// 	children: [{
			// 		name: 'pagination',
			// 		component: 'Pagination',
			// 		showSizeChanger: true,
			// 		pageSizeOptions: ['50', '100', '150', '200'],
			// 		pageSize: '{{data.page.pageSize}}',
			// 		current: '{{data.page.currentPage}}',
			// 		total: '{{data.page.totalCount}}',
			// 		onChange: '{{$pageChanged}}',
			// 		onShowSizeChange: '{{$pageChanged}}'
			// 	}]
			// }
		]
	}
}

export function getInitState() {
	return {
		data: {
			list: [],
			showTableSetting: false,
			searchValue: {
				state: 0,
				simpleCondition: ""
			},
			filter: {
				page: { pageSize: 50, currentPage: 1 },
				simpleCondition:null
			},
			form: {
				key:1
			},
			other: {
				enabledGuide: false,
				assets: [],
				assetAddType: [],
				assetClassId: [],
				deprMethod: [],

				oldSearchValue: {
					state: 0
				},
				columnDto: [
					{ "orgId": 4649498176185344, "id": 40000200001, "columnId": 4683994030379008, "fieldName": "code", "caption": "编号", "idFieldType": 1000040001, "width": 200, "idAlignType": 1000050002, "colIndex": 10, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": true, "isSystem": true, "isHeader": true, "isTotalColumn": false, "isOrderMode": false, "occupyConfig": "6CH", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200002, "columnId": 4683994030379008, "fieldName": "name", "caption": "供应商名称", "idFieldType": 1000040001, "width": 200, "idAlignType": 1000050002, "colIndex": 20, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": true, "isSystem": true, "isHeader": true, "isTotalColumn": false, "isOrderMode": false, "occupyConfig": "10CH", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200003, "columnId": 4683994030379008, "fieldName": "tpluscode", "caption": `供应商`, "idFieldType": 1000040003, "width": 200, "idAlignType": 1000050002, "colIndex": 30, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": true, "isSystem": true, "isHeader": true, "isTotalColumn": false, "isOrderMode": false, "occupyConfig": "10CH", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
				],
				assetState: [{
					label: '全部',
					value: 0
				}, {
					label: '草稿',
					value: 1
				}, {
					label: '正常',
					value: 2
				}, {
					label: '已处置',
					value: 3
				}],
				isColumnSolution: true,
				isCardEdit: true,
				managementConfirm: true,
				sort: {
					userOrderField: null,
					order: null
				},
				softAppName:""
			},
			page: {
				current: 1,
				total: 0,
				pageSize: 50
			},
			loading: false, //grid加载状态
		}
	}
}