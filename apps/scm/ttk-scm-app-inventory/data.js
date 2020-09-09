import moment from 'moment'
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-inventory',
		children: [
			{
				name: 'radioGroup',
				component: 'Radio.Group',
				buttonStyle: 'solid',
				onChange: '{{$handleAccountRadioValueChange}}',
				value: '{{data.other.accountRadioValue}}',
				children: [
					{
						name: 'radioButton1',
						component: 'Radio.Button',
						children: ' 存货台账',
						value: 'tab1'
					},
					{
						name: 'radioButton2',
						component: 'Radio.Button',
						children: ' 暂估台账',
						value: 'tab2'
					},
				]
			},
			{
				name: 'accountQuery',
				title: 'accountQuery',
				className: 'ttk-scm-app-inventory-accountQuery',
				component: 'SearchCard',
				refName: 'accountQuery',
				searchClick: '{{function(value){$searchValueChange(value)}}}',
				onChange: '{{function(value){$searchValueChange(value)}}}',
				didMount: '{{function(childrenRef){$getSearchCard(childrenRef)}}}',
				refreshBtn: {
					name: 'refreshBtn',
					component: 'Icon',
					fontFamily: 'edficon',
					type: 'shuaxin',
					title: '刷新',
					className: 'mk-normalsearch-reload',
					onClick: '{{$refresh}}'
				},
				leftMenuBtn: {
					name: 'leftMenuBtn',
					component: 'Icon',
					//_visible: '{{data.other.accountRadioValue==="tab1"}}',
					className: 'btn setting',
					fontFamily: 'edficon',
					type: 'shezhi',
					onClick: '{{$setting}}'
				},
				confirmBtn: {
					hidden: false,
					text: '查询'
				},
				cancelBtn: {
					hidden: false,
					text: '取消'
				},
				clearBtn: {
					hidden: false,
					text: '清空'
				},
				menuBtn: [
					{
						name: 'batchAddDoc',
						component: 'Dropdown',
						_visible: '{{data.other.accountRadioValue==="tab1"}}',
						className: 'btn',
						overlay: {
							name: 'menu',
							component: 'Menu',
							onClick: '{{$addInventory}}',
							children: [{
								name: 'addInventoryIn',
								component: 'Menu.Item',
								key: 'addInventoryIn',
								children: '入库单'
							}, {
								name: 'addInventoryOut',
								component: 'Menu.Item',
								key: 'addInventoryOut',
								children: '出库单'
							},
							]
						},
						children: {
							name: 'internalAdd',
							component: 'Button',
							type: 'primary',
							children: [{
								name: 'word',
								component: '::span',
								children: '新增单据'
							}, {
								name: 'more',
								component: 'Icon',
								type: 'down'
							}]
						}
					},
					{
						name: 'helpPopover',
						component: 'Popover',
						_visible: '{{data.other.accountRadioValue==="tab1"}}',
						content: [{
							name: 'p',
							component: '::div',
							children: '1. 进项发票/销项发票生成凭证后，将自动生成采购入库单/销售出库单'
						}, {
							name: 'p',
							component: '::div',
							_visible: '{{data.other.productAccountMode == "3" ? false : true}}',
							children: '2. 销售出库单的单价和金额如果为空时，点成本计算将自动回写出库成本，手工录入的单价和金额不回写'
						}],
						placement: 'rightTop',
						overlayClassName: 'ttk-scm-app-inventory-helpPopover',
						children: {
							name: 'helpIcon',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'bangzhutishi',
							className: 'helpIcon'
						}
					},
					{
						name: 'productAccountMode',
						component: 'Button',
						_visible: '{{data.other.accountRadioValue==="tab1"}}',
						children: '{{ $getButtonName(data.form.methodId, data.other.productAccountMode) }}',
						className: 'btn',
						onClick: '{{((data.other.productAccountMode && data.other.productAccountMode == "3") || data.form.methodId == "4") ? $salesAutomaticCalculation : $calculateCost}}'
					},
					// {
					// 	name: 'getvoucher',
					// 	component: 'Dropdown.AntButton',
					// 	_visible: '{{data.other.accountRadioValue==="tab1"}}',
					// 	onClick: '{{function(){$getVoucher()}}}',
					// 	className: 'btn dropdownbutton',
					// 	overlay: {
					// 		name: 'menu',
					// 		component: 'Menu',
					// 		onClick: '{{$moreMenuClick}}',
					// 		children: [{
					// 			name: 'subjectSetting',
					// 			component: 'Menu.Item',
					// 			key: 'subjectSetting',
					// 			children: '科目设置'
					// 		}, {
					// 			name: 'delBatch',
					// 			component: 'Menu.Item',
					// 			key: 'delBatch',
					// 			children: '删除凭证'
					// 		}
					// 		]
					// 	},
					// 	children: '生成凭证'
					// },
					{
						name: 'todetail',
						component: 'Button',
						type: '{{data.other.accountRadioValue==="tab1"?"":"primary"}}',
						children: '出入库明细表',
						className: 'btn',
						onClick: '{{function(){$toDetail("")}}}'
					},
					{
						name: 'getdisposal',
						component: 'Dropdown',
						_visible: '{{data.other.accountRadioValue==="tab1"}}',
						className: 'btn',
						overlay: {
							name: 'disposal',
							component: 'Menu',
							onClick: '{{$linkToEstimateList}}',
							children: [{
								name: 'disposal',
								component: 'Menu.Item',
								key: 'disposal',
								children: '生成暂估'
							}]
						},
						children: {
							name: 'disposalAdd',
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
					},
					{
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
					}
				],
				normalSearcChildren: [{
					name: 'selectContianer',
					component: '::div',
					className: 'ttk-scm-app-inventory-normalSearch',
					children: [
						{
							name: 'date',
							component: 'DatePicker.MonthPicker',
							value: '{{$getNormalDateValue()}}',
							onChange: "{{function(d){$changeDate($momentToString(d,'YYYY-MM'))}}}",
							disabledDate: '{{function(value){return $handleDisabledDate(value)}}}',
						},
						{
							name: 'type',
							label: '存货分类',
							component: 'Select',
							showSearch: false,
							placeholder: '存货分类',
							allowClear: true,
							value: '{{data.form.typeId}}',
							onChange: `{{function(v){$selectType(data.other.type.filter(function(o){return o.value == v})[0])}}}`,
							children: {
								name: 'option',
								component: 'Select.Option',
								value: '{{data.other.type && data.other.type[_rowIndex].value}}',
								title: '{{data.other.type && data.other.type[_rowIndex].label}}',
								children: '{{data.other.type && data.other.type[_rowIndex].label}}',
								_power: 'for in data.other.type'
							}
						}]
				}],
				normalSearch: [],
				//moreSearch: '{{data.searchValue}}',
				// moreSearchItem: [
				// 	{
				// 		name: 'startDate',
				// 		label: '月份',
				// 		isTime: true,
				// 		type: 'DatePicker.MonthPicker',
				// 		noClear: true,
				// 		disabledDate: '{{function(value){return $handleDisabledDate(value)}}}',
				// 	},
				// 	{
				// 		name: 'type',
				// 		label: '存货分类',
				// 		type: 'Select',
				// 		childType: 'Option',
				// 		allowClear: true,
				// 		optionFilterProp: "children",
				// 		filterOption: '{{$filterOptionSummary}}',
				// 		title: '{{data.other.type}}',
				// 		option: '{{data.other.type}}',
				// 		onchange: '{{function(v){$selectType(data.other.type.filter(function(o){return o.value == v})[0])}}}',
				// 	}]
			},
			// {
			// 	name: 'empty',
			// 	component: '::div',
			// 	_visible: '{{data.other.isEmpty}}',
			// 	children: '{{$renderEmpty()}}',
			// },
			{
				name: 'manageContent',
				component: 'Table',
				emptyShowScroll: true,
				pagination: false,
				className: 'ttk-scm-app-inventory-table',
				allowColResize: false,
				enableSequenceColumn: false,
				loading: '{{data.other.loading}}',
				bordered: true,
				scroll: '{{data.tableOption}}',
				dataSource: '{{data.other.tableList[data.other.accountRadioValue]}}',
				noDelCheckbox: true,
				columns: '{{$tableColumns(data.other.accountRadioValue)}}',
				rowClassName: '{{$handleRowClassName}}',
			},
			{
				name: 'footer',
				className: 'ttk-scm-app-inventory-footer',
				component: 'Layout',
				children: [{
					name: 'pagination',
					component: 'Pagination',
					pageSizeOptions: ['50', '100'],
					// pageSize: '{{data.page.pageSize}}',
					// current: '{{data.page.currentPage}}',
					// total: '{{data.page.totalPage}}',
					pageSize: '{{data.page[data.other.accountRadioValue].pageSize}}',
					current: '{{data.page[data.other.accountRadioValue].currentPage}}',
					total: '{{data.page[data.other.accountRadioValue].totalCount}}',
					onChange: '{{$pageChanged}}',
					onShowSizeChange: '{{$pageChanged}}',
				}]
			}
		]
	}
}


export function getInitState() {
	return {
		data: {
			tableOption: {
				x: 2294,
				// y: 300
			},
			enableDate: null,
			form: {
				startDate: moment().format('YYYY-MM'),
				type: ''
			},
			searchValue: {
				startDate: moment().endOf('month'),
				type: ''
			},
			other: {
				tableList: {
					tab1:[],
					tab2:[]
				},
				type: [],
				loading: false,
				isEmpty: false,
				isAuditBatch: true,
				isCalculateCost: true,
				accountRadioValue: 'tab1',//1 存货台账 2 暂估台账
			},
			page: {
				tab1:{
					currentPage: 1,
					totalPage: 1,
					totalCount: 1,
					pageSize: 50,
				},
				tab2:{
					currentPage: 1,
					totalPage: 1,
					totalCount: 1,
					pageSize: 50,
				},
			},
		}
	}
}