// import moment from 'moment'
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-proof-of-list',
		children: [{
			name: 'tablesetting',
			component: 'TableSettingCard',
			data: '{{data.other.columnDto}}',
			showTitle: '{{true}}',
			positionClass: 'app-proof-of-list-Body',
			visible: '{{data.showTableSetting}}',
			confirmClick: '{{function(data){$showTableSetting({value: false, data: data})}}}',
			cancelClick: '{{function(){$closeTableSetting()}}}',
			resetClick: '{{function(){$resetTableSetting({data: data})}}}'
		}, {
			name: 'accountQuery',
			title: 'accountQuery',
			className: 'app-proof-of-list-accountQuery',
			component: 'SearchCard',
			didMount: '{{$searchCardDidMount}}',
			refName: 'accountQuery',
			searchClick: '{{function(value){$searchValueChange(value)}}}',
			onChange: '{{function(value){$searchValueChange(value)}}}',
			refreshBtn: [
				{
					name: 'positionCondition',
					component: 'Input.Search',
					showSearch: true,
					placeholder: "科目/摘要/凭证号/金额",
					className: 'mk-input',				
					onChange: '{{function(e){$searchChange(e.target.value)}}}',
					onSearch: `{{$onSearch}}`
				},				
				{
					name: 'refreshBtn',
					component: 'Icon',
					fontFamily: 'edficon',
					type: 'shuaxin',
					title: '刷 新',
					className: 'mk-normalsearch-reload',
					onClick: '{{$refreshBtnClick}}',
				}
			],
			menuBtn: [
				{
				name: 'newAdd',
				component: 'Button',
				type: 'primary',
				children: '新增凭证',
				onClick: '{{$newAddProofClick}}'
			}, {
				name: '审核',
				component: 'Button',
				children: '审核',
				onClick: '{{$auditClick}}'
			},
			{
				name: 'batch2',
				component: 'Dropdown',
				placement: "bottomLeft",
				overlayClassName: 'Popover-app-proof-of-list',
				overlay: {
					name: 'menu',
					component: 'Menu',
					onClick: '{{$moreActionOpeate}}',
					children: [{
						name: 'sort',
						component: 'Menu.Item',
						key: 'sortProofClick',
						className: 'more_btn_item',
						children: '整理凭证号'
					}, {
						name: 'del',
						component: 'Menu.Item',
						key: 'delTableItemClick',
						className: 'more_btn_item',
						children: '删除'
					}, {
						name: 'versaAudit',
						component: 'Menu.Item',
						className: 'more_btn_item',
						key: 'versaAuditClick',
						children: '反审核'
					}, {
						name: 'insert',
						component: 'Menu.Item',
						className: 'more_btn_item',
						children: '插入凭证',
						key: 'insertProofClick'
					}, {
						name: 'redDashedClick',
						component: 'Menu.Item',
						className: 'more_btn_item',
						children: '红冲凭证',
						key: 'redDashedClick'
					}, {
						name: 'batchCopyDoc',
						component: 'Menu.Item',
						className: 'more_btn_item',
						children: '批量复制凭证',
						key: 'batchCopyDoc'
					},
					{
						name: 'makingSort',
						component: 'Menu.Item',
						className: 'more_btn_item',
						children: '自定义排序',
						key: 'makingSort'
					},
					{
						name: 'batchChangeCreator',
						component: 'Menu.Item',
						className: 'more_btn_item',
						children: '批量修改制单人',
						key: 'batchChangeCreator'
					}
					]
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
			},
			{
				name: 'printFunction',
				component: 'Dropdown.AntButton',
				onClick: '{{$print}}',
				className: 'app-profitstatement-rpt-print',
				style: { marginLeft: '8px'},
				overlay: {
					name: 'menu',
					component: 'Menu',
					onClick: '{{$printset}}',
					children: [
						{
							name: 'printset',
							component: 'Menu.Item',
							key: 'printset',
							children: '打印设置'
						}
					]
				},
				children: {
					name: 'print',
					component: 'Icon',
					fontFamily: 'edficon',
					className: 'app-proof-of-listdayin',
					type: 'dayin',
					title: '打印',

				}
	 },
	 		
			// {
			// 	name: 'save',
			// 	component: 'Icon',
			// 	fontFamily: 'edficon',
			// 	className: 'app-proof-of-list-dayin',
			// 	type: 'dayin',
			// 	title: '打印',
			// 	onClick: '{{$print}}',
			// 	title: '打印'
			// },
			// {
			// 	name: 'openMonth',
			// 	component: 'Button',
			// 	className: 'app-proof-of-list-dayin',
			// 	title: '打印',
			// 	children: '打印',
			// 	onClick: '{{$openMonth}}'
			// },
			{
				name: 'import',
				component: 'Icon',
				fontFamily: 'edficon',
				className: 'app-proof-of-list-import',
				type: 'daoru',
				title: '导入',
				onClick: '{{$import}}',
				style: {
					fontSize: 28,
					lineHeight: '28px'
				},
			},
			{
				name: '导出',
				component: 'Dropdown',
				overlay: {
					name: 'menu',
					component: 'Menu',
					onClick: '{{$export}}',
					children: [{
						name: 'item',
						component: 'Menu.Item',
						key: 'proofList',
						children: {
							component: '::span',
							name: '凭证列表格式',
							children: '凭证列表格式'
						}
					},{
						name: 'batch',
						component: 'Menu.Item',
						key: 'template',
						children: {
							component: '::span',
							name: '导出模板格式',
							children: '导出模板格式'
						}
					}]
				},
				children: {
					name: 'internal',
					component: 'Button',
					className: 'app-proof-of-list-daochuBut',
					children: [{
						name: 'share',
						component: 'Icon',
						fontFamily: 'edficon',
						className: 'app-proof-of-list-daochu',
						type: 'daochu',
						title: '导出'
					}, {
						name: 'down',
						component: 'Icon',
						className: 'daochu-down daochu-down1',
						type: 'down'
					}]
				}
			}],
			normalSearchValue: `{{$getNormalSearchValue()}}`,
			normalSearchChange: '{{$normalSearchChange}}',
			normalSearch: [{
				name: 'date',
				type: 'DateRangeMonthPicker',
				format: "YYYY-MM",
				allowClear: false,
				startEnableDate: '{{data.other.enableddate}}',
				mode: ['month', 'month'],
				onPanelChange: '{{$normalSearchDateChange}}'
			}	
		],
			moreSearch: '{{data.searchValue}}',
			moreSearchRules: '{{$checkSearchValue}}',
			moreSearchItem: [{
				name: 'date',
				range: true,
				label: '会计期间',
				centerContent: '－',
				isTime: true,
				pre: {
					name: 'date_start',
					type: 'DatePicker.MonthPicker',
					mode: ['month', 'month'],
					format: "YYYY-MM",
					allowClear: false,
					noClear: true,
					decoratorDate: '{{function(value, value2){return $disabledDate(value, value2, "pre")}}}',
					rules: [{
						type: 'object',
						required: true,
						message: '该项是必填项',
					}],
				},
				next: {
					name: 'date_end',
					type: 'DatePicker.MonthPicker',
					mode: ['month', 'month'],
					format: "YYYY-MM",
					allowClear: false,
					noClear: true,
					decoratorDate: '{{function(value, value2){return $disabledDate(value, value2, "next")}}}',
					rules: [{
						type: 'object',
						required: true,
						message: '该项是必填项',
					}],
				}
			}, {
				name: 'code',
				range: true,
				label: '凭证号',
				centerContent: '－',
				pre: {
					name: 'startCode',
					type: 'Input',
					autocomplete: "off",
					allowClear: true
				},
				next: {
					name: 'endCode',
					type: 'Input',
					autocomplete: "off",
					allowClear: true
				}
			},
			{
				name: 'accountId',
				label: '科目',
				type: 'Select',
				showSearch: '{{true}}',
				childType: 'Option',	
				onMouseEnter: "{{function(){$onFieldFocus(data.other.accountList,window.proofSearchAccountList)}}}",	
				filterOption:'{{$filterOptionSummary}}',				
				optionFilterProp: 'children',			
				title: '{{data.other.accountList}}',
				option: '{{data.other.accountList}}',				
				allowClear: true,
				onchange: '{{function(v){$assetAddType(v)}}}'
			}, 
			{
				name: 'summary',
				label: '摘要',
				type: 'Input',
				autocomplete: "off",
				allowClear: true
			},
			{
				name: 'voucherState',
				label: '状态',
				type: 'Select',
				childType: 'Option',
				option: '{{data.other.voucherStateOption}}',
				allowClear: true
			}, {
				name: 'code',
				range: true,
				label: '金额',
				centerContent: '－',
				pre: {
					name: 'startAmount',
					type: 'InputNumber',
					autocomplete: "off",
					onBlur: '{{function(e){$searchCardAmoutBlur(e, "pre")}}}',
					onFocus: '{{function(e){$searchCardAmoutFocus(e, "pre")}}}',
					onMouseover: '{{function(e){$searchCardAmoutFocus(e, "pre")}}}',
					max: 9999999999.99,
					min: -9999999999.99,
					className: 'td_input_antNumber',
					allowClear: true,
					precision: 2,
					formatter: '{{$inputFormatter}}',
					parser: '{{$inputParser}}'
				},
				next: {
					name: 'endAmount',
					type: 'InputNumber',
					onBlur: '{{function(e){$searchCardAmoutBlur(e, "next")}}}',
					onFocus: '{{function(e){$searchCardAmoutFocus(e, "next")}}}',
					max: 9999999999.99,
					min: -9999999999.99,
					className: 'td_input_antNumber',
					autocomplete: "off",
					allowClear: true,
					precision: 2,
					formatter: '{{$inputFormatter}}',
					parser: '{{$inputParser}}'
				}
			}],
		}, 
		{
			className: 'app-proof-of-list-Body',
			name: 'report',
			component: '::div',
			children: '{{$renderBody()}}'
		},
		// {
		// 	className: 'app-proof-of-list-Body',
		// 	name: 'report',
		// 	component: 'Table',
		// 	key: '{{data.tableKey}}',
		// 	checkboxKey: 'docId',
		// 	remberName: 'app-proof-of-list',
		// 	loading: '{{data.loading}}',
		// 	checkboxChange: '{{$checkboxChange}}',
		// 	checkboxValue: '{{data.tableCheckbox.checkboxValue}}',
		// 	pagination: false,
		// 	tableIsNotRefreshKey: 'proofList',
		// 	scroll: '{{data.list.length > 0 ? data.tableOption : {} }}',
		// 	allowColResize: true,
		// 	emptyShowScroll: true,
		// 	enableSequenceColumn: false,
		// 	onChange: '{{$tableOnchange}}',
		// 	Checkbox: false,
		// 	rowSelection: '{{$rowSelection()}}',
		// 	bordered: true,
		// 	//width: true,
		// 	dataSource: '{{data.list}}',
		// 	columns: '{{$renderColumns()}}',
		// 	onResizeEnd: '{{function(param){$resizeEnd(param)}}}'

		// }, 
		{
			name: 'footer',
			className: 'app-proof-of-list-footer',
			component: '::div',
			children: [{
				name: 'pagination',
				component: 'Pagination',
				pageSizeOptions: ['10', '20', '50', '100'],
				pageSize: '{{data.pagination.pageSize}}',
				current: '{{data.pagination.currentPage}}',
				total: '{{data.pagination.totalCount}}',
				onChange: '{{$pageChanged}}',
				onShowSizeChange: '{{$pageChanged}}'
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			tableKey: 1000,
			tableOption: {
			},
			showPicker: false,
			showTableSetting: false,
			sort: {
				userOrderField: null,
				order: null
			},
			list: [],
			allList: [],
			content: '查询条件：',
			searchValue: {
				accountId: undefined, //--科目ID
				endCode: undefined,	 //--终止凭证号
				startCode: undefined, //--起始凭证号
				date_end: undefined, //期间终止
				date_start: undefined, //期间起始
				docIds: undefined, //--凭证ID列表
				summary: undefined, //--摘要
				voucherState: undefined, //--单据状态
				sourceVoucherTypeId: undefined, //--单据类型 -- 单据来源
				simpleCondition: undefined //简单查询
			},
			pagination: {
				currentPage: 1,
				totalCount: 0,
				pageSize: 10,
				totalPage: 0
			},
			other: {
				customer: ['1', '2', '3', '4'],
				option: [],
				accountList: [],
				selectedRowKeys: [],				
				columnDto: [
					{
						"orgId": 4043128470475776,
						"id": 50000100001,
						"columnId": 4043950162154496,
						"fieldName": "voucherDate",
						"caption": "日期",
						"idFieldType": 1000040001,
						"width": 100,
						"idAlignType": 1000050001,
						"colIndex": 1,
						"isFixed": false,
						"isVisible": true,
						"isMustSelect": true,
						"isSystem": false,
						"isHeader": true,
						"isTotalColumn": false,
						"ts": "2018-02-12 15:26:28"
					}, {
						"orgId": 4043128470475776,
						"id": 50000100002,
						"columnId": 4043950162154496,
						"fieldName": "docTypeAndCode",
						"caption": "凭证字号",
						"idFieldType": 1000040001,
						"width": 100,
						"idAlignType": 1000050001,
						"colIndex": 2,
						"isFixed": false,
						"isVisible": true,
						"isMustSelect": true,
						"isSystem": false,
						"isHeader": true,
						"isTotalColumn": false,
						"ts": "2018-02-12 15:26:28"
					}, {
						"orgId": 4043128470475776,
						"id": 50000100003,
						"columnId": 4043950162154496,
						"fieldName": "amountSum",
						"caption": "总金额",
						"idFieldType": 1000040002,
						"width": 100,
						"idAlignType": 1000050003,
						"colIndex": 3,
						"isFixed": false,
						"isVisible": false,
						"isMustSelect": false,
						"isSystem": false,
						"isHeader": true,
						"isTotalColumn": false,
						"ts": "2018-02-12 15:26:28"
					}, {
						"orgId": 4043128470475776,
						"id": 50000100004,
						"columnId": 4043950162154496,
						"fieldName": "summary",
						"caption": "摘要",
						"idFieldType": 1000040001,
						"width": 100,
						"idAlignType": 1000050001,
						"colIndex": 4,
						"isFixed": false,
						"isVisible": true,
						"isMustSelect": false,
						"isSystem": false,
						"isHeader": false,
						"isTotalColumn": false,
						"ts": "2018-02-12 15:26:28"
					}, {
						"orgId": 4043128470475776,
						"id": 50000100005,
						"columnId": 4043950162154496,
						"fieldName": "accountCodeName",
						"caption": "会计科目",
						"idFieldType": 1000040001,
						"width": 100,
						"idAlignType": 1000050001,
						"colIndex": 5,
						"isFixed": false,
						"isVisible": true,
						"isMustSelect": false,
						"isSystem": false,
						"isHeader": false,
						"isTotalColumn": false,
						"ts": "2018-02-12 15:26:28"
					}, {
						"orgId": 4043128470475776,
						"id": 50000100006,
						"columnId": 4043950162154496,
						"fieldName": "currencyAndExchangeRate",
						"caption": "币种/汇率",
						"idFieldType": 1000040001,
						"width": 100,
						"idAlignType": 1000050001,
						"colIndex": 6,
						"isFixed": false,
						"isVisible": true,
						"isMustSelect": false,
						"isSystem": false,
						"isHeader": false,
						"isTotalColumn": false,
						"ts": "2018-02-12 15:26:28"
					}, {
						"orgId": 4043128470475776,
						"id": 50000100007,
						"columnId": 4043950162154496,
						"fieldName": "unitName",
						"caption": "计量单位",
						"idFieldType": 1000040001,
						"width": 100,
						"idAlignType": 1000050001,
						"colIndex": 7,
						"isFixed": false,
						"isVisible": false,
						"isMustSelect": false,
						"isSystem": false,
						"isHeader": false,
						"isTotalColumn": false,
						"ts": "2018-02-12 15:26:28"
					}, {
						"orgId": 4043128470475776,
						"id": 50000100008,
						"columnId": 4043950162154496,
						"fieldName": "quantity",
						"caption": "数量",
						"idFieldType": 1000040002,
						"width": 100,
						"idAlignType": 1000050003,
						"colIndex": 8,
						"isFixed": false,
						"isVisible": false,
						"isMustSelect": false,
						"isSystem": false,
						"isHeader": false,
						"isTotalColumn": false,
						"ts": "2018-02-12 15:26:28"
					}, {
						"orgId": 4043128470475776,
						"id": 50000100009,
						"columnId": 4043950162154496,
						"fieldName": "price",
						"caption": "单价",
						"idFieldType": 1000040002,
						"width": 100,
						"idAlignType": 1000050003,
						"colIndex": 9,
						"isFixed": false,
						"isVisible": false,
						"isMustSelect": false,
						"isSystem": false,
						"isHeader": false,
						"isTotalColumn": false,
						"ts": "2018-02-12 15:26:28"
					}, {
						"orgId": 4043128470475776,
						"id": 50000100010,
						"columnId": 4043950162154496,
						"fieldName": "origAmount",
						"caption": "外币金额",
						"idFieldType": 1000040002,
						"width": 100,
						"idAlignType": 1000050003,
						"colIndex": 10,
						"isFixed": false,
						"isVisible": false,
						"isMustSelect": false,
						"isSystem": false,
						"isHeader": false,
						"isTotalColumn": false,
						"ts": "2018-02-12 15:26:28"
					}
				],
				sourceVoucherTypeIdOption: [],
				voucherStateOption: []
			},
			// tableCheckbox: {
			// 	checkboxValue: [],
			// 	selectedOption: []
			// },
			loading: true
		}
	}
}
