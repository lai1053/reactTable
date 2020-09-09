import moment from 'moment'
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-sa-invoice-list',
		children: [
			{
				name: 'tablesetting',
				component: 'TableSettingCard',
				data: '{{data.other.columnDto}}',
				showTitle: true,
				positionClass: 'ttk-scm-app-sa-invoice-list-Body',
				visible: '{{data.showTableSetting}}',
				confirmClick: '{{function(data){$showTableSetting({value: false, data: data})}}}',
				cancelClick: '{{function(){$closeTableSetting()}}}',
				resetClick: '{{function(){$resetTableSetting({data: data})}}}'
			},
			{
				name: 'accountQuery',
				title: 'accountQuery',
				className: 'ttk-scm-app-sa-invoice-list-accountQuery',
				component: 'SearchCard',
				refName: 'accountQuery',
				searchClick: '{{function(value){$searchValueChange(value)}}}',
				onChange: '{{function(value){$searchValueChange(value)}}}',
				refreshBtn: {
					name: 'refreshBtn',
					component: 'Icon',
					fontFamily: 'edficon',
					type: 'shuaxin',
					title: '刷新',
					className: 'mk-normalsearch-reload',
					onClick: '{{$refreshBtnClick}}',
				},
				menuBtn: [
					{
						name: 'batch',
						component: 'Dropdown.AntButton',
						onClick: '{{function(){$oneKeyCollectClick()}}}',
						className: 'dropdownbutton',
						overlay: {
							name: 'menu',
							component: 'Menu',
							onClick: '{{$moreActionOpeate}}',
							children: [
								{
									name: 'fileRules',
									component: 'Menu.Item',
									className: "app-asset-list-disposal",
									key: 'fileRules',
									children: '设置档案匹配规则'
								},
								{
									name: 'bookkeeping',
									component: 'Menu.Item',
									className: "app-asset-list-disposal",
									key: 'bookkeeping',
									children: '设置记账方式'
								}
							]
						},
						children: '采集发票'
					},
					{
						name: 'collateInvoice',
						component: 'Button',
						children: '理票',
						style: { marginLeft: '8px' },
						_visible: '{{$isShowCollateInvoice()}}',
						onClick: '{{function(){$collateInvoice({})}}}'
					},
					{
						name: 'batch2',
						component: 'Dropdown.AntButton',
						_visible: '{{$notMinfei()}}',
						onClick: '{{data.tplus.baseUrl==null?$getVoucher:$getVoucherToTJ}}',
						className: 'dropdownbutton2',
						style: { marginLeft: '8px' },
						overlay: {
							name: 'menu',
							component: 'Menu',
							onClick: '{{$moreActionOpeate}}',
							children: [
								// {
								// 	name: 'auditAndExportBatch',
								// 	component: 'Menu.Item',
								// 	className: "app-asset-list-disposal",
								// 	key: 'auditAndExportBatch',
								// 	children: '生成凭证并导出到T+'
								// },
								// {
								// 	name: 'auditAndExportBatchU8',
								// 	component: 'Menu.Item',
								// 	className: "app-asset-list-disposal",
								// 	key: 'auditAndExportBatchU8',
								// 	children: '生成凭证并导出到U8'
								// },
								{
									name: 'voucherHabit',
									component: 'Menu.Item',
									className: "app-asset-list-depreciation",
									key: 'voucherHabit',
									children: '凭证习惯'
								},
								{
									name: 'subManage',
									component: 'Menu.Item',
									_visible: '{{data.tplus.baseUrl==null}}',
									className: "app-asset-list-depreciation",
									key: 'subManage',
									children: '科目设置'
								},
								{
									name: 'delVoucher',
									component: 'Menu.Item',
									className: "app-asset-list-depreciation",
									key: 'delVoucher',
									children: '删除凭证'
								},


							]
						},
						children: '{{"生成"+data.tplus.softAppName+"凭证"}}'
					},
					// {
					// 	name: 'batch2',
					// 	component: 'Dropdown.AntButton',
					// 	_visible:'{{data.tplus.baseUrl!=null}}',
					// 	onClick: '{{function(){$getVoucherToTJ()}}}',
					// 	className: 'dropdownbutton2',
					// 	overlay: {
					// 		name: 'menu',
					// 		component: 'Menu',
					// 		onClick: '{{$moreActionOpeate}}',
					// 		children: [
					// 			{
					// 				name: 'voucherHabit',
					// 				component: 'Menu.Item',
					// 				className: "app-asset-list-depreciation",
					// 				key: 'voucherHabit',
					// 				children: '凭证习惯'
					// 			},
					// 			{
					// 				name: 'delVoucher',
					// 				component: 'Menu.Item',
					// 				className: "app-asset-list-depreciation",
					// 				key: 'delVoucher',
					// 				children: '删除凭证'
					// 			},
					// 		]
					// 	},
					// 	children:'{{生成凭证}}'
					// },

					// {
					// 	name: 'Popover',
					// 	component: 'Popover',
					// 	placement: 'bottomLeft',
					// 	overlayClassName: 'Popover-ttk-scm-app-sa-invoice-list',
					// 	style: { padding: '0px 10px' },
					// 	content: {
					// 		name: 'menu',
					// 		component: 'Menu',
					// 		className: 'more_btn_container',
					// 		onClick: '{{$moreActionOpeate}}',
					// 		children: [
					// 			{
					// 				name: 'insertProofConfirm',
					// 				component: 'Menu.Item',
					// 				className: 'more_btn_item',
					// 				key: 'insertProofConfirm',
					// 				children: '新增',
					// 			},
					// 			{
					// 				name: 'settlement',
					// 				component: 'Menu.Item',
					// 				key: 'settlement',
					// 				className: 'more_btn_item',
					// 				children: '批量结算'
					// 			},
					// 			{
					// 				name: 'supplement',
					// 				component: 'Menu.Item',
					// 				key: 'supplement',
					// 				className: 'more_btn_item',
					// 				children: '批量修改'
					// 			},
					// 			{
					// 				name: 'onCollectResultModal',
					// 				component: 'Menu.Item',
					// 				className: 'more_btn_item',
					// 				children: '发票汇总表',
					// 				key: 'onCollectResultModal',
					// 			},
					// 			{
					// 				name: 'deleteBatchClick',
					// 				component: 'Menu.Item',
					// 				className: 'more_btn_item',
					// 				key: 'deleteBatchClick',
					// 				children: '删除'
					// 			},
					// 		]
					// 	},
					// 	children: {
					// 		name: '更多',
					// 		component: 'Button',
					// 		className: 'ttk-scm-app-sa-invoice-list-more',
					// 		children: ['更多', {
					// 			name: 'down',
					// 			component: 'Icon',
					// 			type: 'down'
					// 		}]
					// 	}
					// },

					{
						name: 'batch3',
						component: 'Dropdown',
						overlay: {
							name: 'menu',
							component: 'Menu',
							onClick: '{{$moreActionOpeate}}',
							children: [
								{
									name: 'settlement',
									component: 'Menu.Item',
									className: "app-asset-list-disposal",
									key: 'insertProofConfirm',
									children: '新增'
								},
								{
									name: 'settlement',
									component: 'Menu.Item',
									className: "app-asset-list-disposal",
									key: 'settlement',
									children: '批量结算'
								},
								{
									name: 'supplement',
									component: 'Menu.Item',
									className: "app-asset-list-disposal",
									key: 'supplement',
									children: '批量修改'
								},
								{
									name: 'onCollectResultModal',
									component: 'Menu.Item',
									className: 'app-asset-list-disposal',
									children: '发票汇总表',
									key: 'onCollectResultModal',
								},
								{
									name: 'deleteBatchClick',
									component: 'Menu.Item',
									className: "app-asset-list-disposal",
									key: 'deleteBatchClick',
									children: '删除'
								}
							]
						},
						children: {
							name: 'internal',
							component: 'Button',
							className: 'app-asset-list-header-more',
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
						name: 'share',
						component: 'Icon',
						fontFamily: 'edficon',
						className: 'ttk-scm-app-sa-invoice-list-daochu',
						type: 'daochu',
						title: '导出',
						onClick: '{{$export}}'
					}],
				selectDate: {
					name: 'selectDate',
					component: 'Select',
					value: '{{data.other.dateRangeKey}}',
					className: 'selectRangeDate',
					onChange: "{{$dateRangeChange}}",
					showSearch: false,
					children: [
						{
							name: 'today',
							component: 'Select.Option',
							children: '今天',
							value: 'today',
						},
						{
							name: 'yesterday',
							component: 'Select.Option',
							children: '昨天',
							value: 'yesterday',
						},
						{
							name: 'thisWeek',
							component: 'Select.Option',
							children: '本周',
							value: 'thisWeek',
						},
						{
							name: 'lastMonth',
							component: 'Select.Option',
							children: '上月',
							value: 'lastMonth',
						},
						{
							name: 'thisMonth',
							component: 'Select.Option',
							children: '本月',
							value: 'thisMonth',
						},
						{
							name: 'custom',
							component: 'Select.Option',
							children: '自定义',
							value: 'custom',
							disabled: true
						}
					]
				},
				normalSearchValue: `{{$getNormalSearchValue()}}`, //简单条件的value 当前只有两个日期
				normalSearchChange: '{{$normalSearchChange}}', //date+input 简单条件改变
				normalSearch: [{
					name: 'date',
					type: 'DateRangeDatePicker',
					format: "YYYY-MM-DD",
					allowClear: false,
					startEnableDate: '{{data.other.enableddate}}',
					onPanelChange: '{{$normalSearchDateChange}}' //日期改变
				}],
				moreSearch: '{{data.searchValue}}',
				moreSearchItem: [{
					name: 'date',
					range: true,
					label: '单据日期',
					centerContent: '－',
					isTime: true,
					pre: {
						name: 'beginDate',
						type: 'DatePicker',
						mode: ['month', 'month'],
						format: "YYYY-MM-DD",
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
						name: 'endDate',
						type: 'DatePicker',
						mode: ['month', 'month'],
						format: "YYYY-MM-DD",
						allowClear: false,
						noClear: true,
						decoratorDate: '{{function(value, value2){return $disabledDate(value, value2, "next")}}}',
						rules: [{
							type: 'object',
							required: true,
							message: '该项是必填项',
						}],
					}
				},
				// {
				// 	name: 'invoiceNumber',
				// 	label: '发票号码',
				// 	type: 'Input',
				// 	autocomplete: "off",
				// 	allowClear: true,
				// 	maxLength: 8
				// },
				{
					name: 'invoiceTypeId',
					label: '发票类型',
					type: 'Select',
					showSearch: true,
					childType: 'Option',
					optionFilterProp: "children",
					filterOption: '{{$filterOptionSummary}}',
					title: '{{data.invoiceTypes}}',
					option: '{{data.invoiceTypes}}',
					allowClear: true
				},
				/*{
					// name: 'customerId',
					// label: '购方名称',
					// type: 'Select',
					// showSearch: true,
					// childType: 'Option',
					// optionFilterProp: "children",
					// filterOption: '{{$filterOptionSummary}}',
					// title: '{{data.customer}}',
					// option: '{{data.customer}}',
					// allowClear: true

					name: 'customerName',
					label: '购方名称',
					type: 'Input',
					autocomplete: "off",
					allowClear: true,
				},
				{
					name: 'inventoryName',
					label: '存货名称',
					type: 'Input',
					autocomplete: "off",
					allowClear: true,
				},*/
				{
					name: 'accountStatus',
					label: '记账状态',
					type: 'Select',
					showSearch: false,
					childType: 'Option',
					optionFilterProp: "children",
					filterOption: '{{$filterOptionSummary}}',
					title: '{{data.accountStatuses}}',
					option: '{{data.accountStatuses}}',
					allowClear: true
				},
				{
					name: 'discarded',
					label: '发票状态',
					type: 'Select',
					childType: 'Option',
					noClear: true,
					optionFilterProp: "children",
					filterOption: '{{$filterOptionSummary}}',
					title: '{{data.discarded}}',
					option: '{{data.discarded}}',
				},
				{
					name: 'inventoryType',
					label: '货物类型',
					type: 'Select',
					childType: 'Option',
					optionFilterProp: "children",
					filterOption: '{{$filterOptionSummary}}',
					title: '{{data.inventoryTypes}}',
					option: '{{data.inventoryTypes}}',
					allowClear: true
				},
				{
					name: 'taxRateId',
					label: '税率',
					type: 'Select',
					showSearch: false,
					childType: 'Option',
					optionFilterProp: "children",
					//filterOption: '{{$filterOptionSummary}}',
					title: '{{data.rateList}}',
					option: '{{data.rateList}}',
					allowClear: true
				},
				// {
				// 	name: 'isDraft',
				// 	label: '',
				// 	type: 'Checkbox.Group',
				// 	render: '{{$renderCheckBox}} ',
				// 	allowClear: true
				// }
				{
					name: 'taxInclusiveAmountStr',
					label: '价税合计金额',
					type: 'Input',
					autocomplete: "off",
					allowClear: true,
				}
				],
			},
			{
				name: 'searchTop',
				component: 'Form',
				className: 'ttk-scm-app-pu-invoice-list-FormSearch',
				children: [
					{
						name: 'item1',
						component: 'Form.Item',
						label: '购方名称',
						colon: false,
						children: {
							name: 'wrap1',
							component: 'Input.Search',
							placeholder: '按购方名称查询',
							value: '{{data.searchValue.customerName}}',
							onSearch: "{{function() { $handleSearch()}}}",
							onBlur: "{{function() { $handleSearch()}}}",
							onChange: "{{function(e) { $handleOnChange(e, 'customerName')}}}"
						}
					},
					{
						name: 'item2',
						component: 'Form.Item',
						label: '存货名称',
						colon: false,
						children: {
							name: 'wrap2',
							component: 'Input.Search',
							placeholder: '按存货名称查询',
							value: '{{data.searchValue.inventoryName}}',
							onSearch: "{{function() { $handleSearch()}}}",
							onBlur: "{{function() { $handleSearch()}}}",
							onChange: "{{function(e) { $handleOnChange(e, 'inventoryName')}}}"
						}
					},
					{
						name: 'item2',
						component: 'Form.Item',
						label: '发票号码',
						colon: false,
						children: {
							name: 'wrap2',
							component: 'Input.Search',
							value: '{{data.searchValue.invoiceNumber}}',
							placeholder: '按发票号码查询',
							onSearch: "{{function() { $handleSearch()}}}",
							onBlur: "{{function() { $handleSearch()}}}",
							onChange: "{{function(e) { $handleOnChange(e, 'invoiceNumber')}}}"
						}
					},
					// {
					// 	name: 'item3',
					// 	component: 'Form.Item',
					// 	label: '税率:',
					// 	colon: false,
					// 	children: {
					// 		name: 'wrap3',
					// 		component: 'Select',
					// 		placeholder: '按税率查询',
					// 		showSearch: false,
					// 		allowClear: true,
					// 		value: '{{data.searchValue.taxRateId}}',
					// 		onChange: '{{function(v){$handleOnChange(v, "taxRateId")}}}',
					// 		children: {
					// 			name: 'option',
					// 			component: 'Select.Option',
					// 			value: '{{data.rateList && data.rateList[_rowIndex].value }}',
					// 			children: '{{data.rateList && data.rateList[_rowIndex].label }}',
					// 			_power: 'for in data.rateList'
					// 		}
					// 	}
					// }
				]
			},
			{
				name: 'right',
				component: '::div',
				className: 'ttk-scm-app-authorized-invoice-list-header-item4-right',
				_visible: '{{data.statistics.count>0}}',
				children: [
					{
						name: 'numlabel',
						component: '::div',
						children: '份数：'
					},
					{
						name: 'numvalue',
						component: '::div',
						style: {
							color: 'red'
						},
						children: '{{data.statistics.count}}'
					},
					{
						name: 'fen',
						component: '::div',
						style: {
							marginRight: 17,
							marginLeft: 3
						},
						children: '份'
					},
					{
						name: 'amountlabel',
						component: '::div',
						children: '金额：'
					},
					{
						name: 'amountvalue',
						component: '::div',
						style: {
							color: 'red'
						},
						children: '{{data.statistics.totalAmount}}'
					},
					{
						name: 'amountyuan',
						component: '::div',
						style: {
							marginRight: 17,
							marginLeft: 3
						},
						children: '元'
					},
					{
						name: 'taxlabel',
						component: '::div',
						children: '税额：',
					},
					{
						name: 'taxvalue',
						component: '::div',
						style: {
							color: 'red'
						},
						children: '{{data.statistics.totalTax}}'
					},
					{
						name: 'yuan',
						component: '::div',
						style: {
							marginLeft: 3
						},
						children: '元'
					},
				]
			},
			{
				className: 'ttk-scm-app-sa-invoice-list-Body',
				name: 'report',
				component: 'Table',
				key: '{{data.tableKey}}',
				checkboxKey: 'id',
				lazyTable: true,
				emptyShowScroll: true,
				//remberName: 'ttk-scm-app-sa-invoice-list',
				loading: '{{data.loading}}',
				checkboxChange: '{{$checkboxChange}}',
				checkboxValue: '{{data.tableCheckbox.checkboxValue}}',
				pagination: false,
				scroll: '{{data.tableOption}}',
				allowColResize: true,
				//enableSequenceColumn: false,
				onChange: '{{$tableOnchange}}',
				Checkbox: false,
				rowSelection: '{{$rowSelection()}}',
				bordered: true,
				dataSource: '{{data.list}}',
				columns: '{{$renderColumns()}}',
				rowClassName: '{{$renderRowClassName}}',
				onResizeEnd: '{{function(param){$resizeEnd(param)}}}'

			},
			{
				name: 'footer',
				className: 'ttk-scm-app-sa-invoice-list-footer',
				component: '::div',
				children: [{
					name: 'pagination',
					component: 'Pagination',
					pageSizeOptions: ['20', '50', '100', '200'],
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
			statistics: {
				count: 0,
			},
			sort: {
				userOrderField: null,
				order: null
			},
			invoiceTypeList: [],//-- 发票类型
			accountStatuses: [],//
			rateList: [],
			discarded: [{
				value: 1,
				label: '全部'
			}, {
				value: 2,
				label: '作废'
			}, {
				value: 3,
				label: '正常'
			}],
			inventoryTypes: [],
			totalCount: 1,// -- 全部数量
			notApproveCount: 0,//-- 未审核数量
			list: [],
			tableKey: 1000,
			tableOption: {
				x: 1500,
				//y:402
			},
			showPicker: false,
			showTableSetting: false,
			orders: [
				{
					name: "code",
					asc: false
				}
			],
			content: '查询条件：',
			searchValue: {
				isInit: true,
				beginDate: moment().subtract(1, "months").startOf('month'),
				endDate: moment().subtract(1, "months").endOf('month'),
				//customerId: null,//-- 客户名称
				// invoiceTypeId: null,//-- 票据类型，票据类型 id 对应关系，参考返回值中 invoiceTypes 的具体说明
				//invoiceNumber: null,// -- 发票号码
				discarded: 3,
				//isDraft:null,//草稿状态
				// accountStatus: null,//-- 存货名称
			},
			pagination: {
				currentPage: 1,//-- 当前页
				pageSize: 20,//-- 页大小
				totalCount: 0,
				totalPage: 0
			},
			other: {
				hasDraft: false,//是否有草稿状态
				customer: ['1', '2', '3', '4'],
				option: [],
				accountList: [],
				dateRangeKey: 'lastMonth',
				columnDto: [
					{ "orgId": 4649498176185344, "id": 40000200001, "columnId": 4683994030379008, "fieldName": "seq", "caption": "序号", "idFieldType": 1000040001, "width": 65, "idAlignType": 1000050002, "colIndex": 10, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": true, "isSystem": true, "isHeader": true, "isTotalColumn": false, "isOrderMode": false, "occupyConfig": "6CH", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200002, "columnId": 4683994030379008, "fieldName": "code", "caption": "单据编号", "idFieldType": 1000040001, "width": 101, "idAlignType": 1000050002, "colIndex": 20, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": true, "isSystem": true, "isHeader": true, "isTotalColumn": false, "isOrderMode": false, "occupyConfig": "10CH", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200003, "columnId": 4683994030379008, "fieldName": "businessDate", "caption": "单据日期", "idFieldType": 1000040003, "width": 89, "idAlignType": 1000050002, "colIndex": 30, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": true, "isSystem": true, "isHeader": true, "isTotalColumn": false, "isOrderMode": false, "occupyConfig": "10CH", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200004, "columnId": 4683994030379008, "fieldName": "invoiceDate", "caption": "开票日期", "idFieldType": 1000040003, "width": 89, "idAlignType": 1000050002, "colIndex": 40, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": true, "isSystem": true, "isHeader": true, "isTotalColumn": false, "isOrderMode": false, "occupyConfig": "10CH", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200005, "columnId": 4683994030379008, "fieldName": "invoiceNumber", "caption": "发票号码", "idFieldType": 1000040001, "width": 77, "idAlignType": 1000050002, "colIndex": 50, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": true, "isSystem": true, "isHeader": true, "isTotalColumn": false, "isOrderMode": false, "occupyConfig": "8CH", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200006, "columnId": 4683994030379008, "fieldName": "invoiceCode", "caption": "发票代码", "idFieldType": 1000040001, "width": 101, "idAlignType": 1000050002, "colIndex": 60, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": true, "isSystem": true, "isHeader": true, "isTotalColumn": false, "isOrderMode": false, "occupyConfig": "12CH", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200007, "columnId": 4683994030379008, "fieldName": "invoiceTypeName", "caption": "发票类型", "idFieldType": 1000040001, "width": 101, "idAlignType": 1000050002, "colIndex": 70, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": true, "isSystem": true, "isHeader": true, "isTotalColumn": false, "isOrderMode": false, "occupyConfig": "7CC", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200008, "columnId": 4683994030379008, "fieldName": "customerName", "caption": "购方名称", "idFieldType": 1000040001, "width": 137, "idAlignType": 1000050001, "colIndex": 80, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": true, "isSystem": true, "isHeader": true, "isTotalColumn": false, "isOrderMode": false, "occupyConfig": "10CC", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200009, "columnId": 4683994030379008, "fieldName": "amount", "caption": "金额汇总", "idFieldType": 1000040002, "width": 71, "idAlignType": 1000050003, "colIndex": 90, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": true, "isSystem": true, "isHeader": true, "isTotalColumn": true, "isOrderMode": false, "occupyConfig": "7CH", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200010, "columnId": 4683994030379008, "fieldName": "taxInclusiveAmount", "caption": "价税合计汇总", "idFieldType": 1000040002, "width": 89, "idAlignType": 1000050003, "colIndex": 100, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": true, "isSystem": true, "isHeader": true, "isTotalColumn": true, "isOrderMode": false, "occupyConfig": "6CC", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200011, "columnId": 4683994030379008, "fieldName": "inventoryName", "caption": "存货名称", "idFieldType": 1000040001, "width": 137, "idAlignType": 1000050001, "colIndex": 110, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": true, "isSystem": true, "isHeader": false, "isTotalColumn": false, "isOrderMode": false, "occupyConfig": "10CC", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200012, "columnId": 4683994030379008, "fieldName": "inventoryTypeName", "caption": "货物类型", "idFieldType": 1000040001, "width": 113, "idAlignType": 1000050002, "colIndex": 120, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": false, "isSystem": true, "isHeader": false, "isTotalColumn": false, "isOrderMode": false, "occupyConfig": "8CC", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200013, "columnId": 4683994030379008, "fieldName": "taxRateTypeName", "caption": "计税方式", "idFieldType": 1000040001, "width": 65, "idAlignType": 1000050002, "colIndex": 130, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": false, "isSystem": true, "isHeader": false, "isTotalColumn": false, "isOrderMode": false, "occupyConfig": "4CC", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200014, "columnId": 4683994030379008, "fieldName": "quantity", "caption": "数量", "idFieldType": 1000040002, "width": 71, "idAlignType": 1000050003, "colIndex": 140, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": false, "isSystem": true, "isHeader": false, "isTotalColumn": true, "isOrderMode": false, "occupyConfig": "7CH", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200015, "columnId": 4683994030379008, "fieldName": "price", "caption": "单价", "idFieldType": 1000040002, "width": 89, "idAlignType": 1000050003, "colIndex": 150, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": false, "isSystem": true, "isHeader": false, "isTotalColumn": false, "isOrderMode": false, "occupyConfig": "10CH", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200016, "columnId": 4683994030379008, "fieldName": "taxRateName", "caption": "税率", "idFieldType": 1000040001, "width": 65, "idAlignType": 1000050003, "colIndex": 160, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": false, "isSystem": true, "isHeader": false, "isTotalColumn": false, "isOrderMode": false, "occupyConfig": "4CC", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200017, "columnId": 4683994030379008, "fieldName": "tax", "caption": "税额", "idFieldType": 1000040002, "width": 71, "idAlignType": 1000050003, "colIndex": 170, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": false, "isSystem": true, "isHeader": false, "isTotalColumn": true, "isOrderMode": false, "occupyConfig": "7CH", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200018, "columnId": 4683994030379008, "fieldName": "detailAmount", "caption": "金额", "idFieldType": 1000040002, "width": 71, "idAlignType": 1000050003, "colIndex": 180, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": false, "isSystem": true, "isHeader": false, "isTotalColumn": true, "isOrderMode": false, "occupyConfig": "7CH", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200019, "columnId": 4683994030379008, "fieldName": "detailTaxInclusiveAmount", "caption": "价税合计", "idFieldType": 1000040002, "width": 71, "idAlignType": 1000050003, "colIndex": 190, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": false, "isSystem": true, "isHeader": false, "isTotalColumn": true, "isOrderMode": false, "occupyConfig": "7CH", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200020, "columnId": 4683994030379008, "fieldName": "accountStatusName", "caption": "记账状态", "idFieldType": 1000040001, "width": 65, "idAlignType": 1000050002, "colIndex": 200, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": true, "isSystem": true, "isHeader": true, "isTotalColumn": false, "isOrderMode": false, "occupyConfig": "4CC", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200021, "columnId": 4683994030379008, "fieldName": "docCode", "caption": "凭证字号", "idFieldType": 1000040001, "width": 77, "idAlignType": 1000050002, "colIndex": 210, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": true, "isSystem": true, "isHeader": true, "isTotalColumn": false, "isOrderMode": false, "occupyConfig": "5CC", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" },
					{ "orgId": 4649498176185344, "id": 40000200022, "columnId": 4683994030379008, "fieldName": "settleCodes", "caption": "收款单号", "idFieldType": 1000040001, "width": 101, "idAlignType": 1000050002, "colIndex": 220, "idOrderMode": 1000060001, "isFixed": false, "isVisible": true, "isMustSelect": true, "isSystem": true, "isHeader": true, "isTotalColumn": false, "isOrderMode": false, "occupyConfig": "10CH", "ts": "2018-06-05 16:18:02.0", "createTime": "2018-06-05 16:18:02", "updateTime": "2018-06-05 16:18:02" }
				],
				sourceVoucherTypeIdOption: [],
				voucherStateOption: [],
				enableddate: null,//启用日期
				date: moment().subtract(1, "months").startOf('month'),//默认采集日期
			},
			tableCheckbox: {
				checkboxValue: [],
				selectedOption: []
			},
			loading: true,
			tplus: {
				baseUrl: null,
				softAppName: "",
			}
		}
	}
}
