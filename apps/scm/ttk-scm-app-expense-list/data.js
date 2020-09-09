import moment from 'moment'
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-expense-list',
		children: [
			{
				name: 'tablesetting',
				component: 'TableSettingCard',
				data: '{{data.other.columnDto}}',
				showTitle: '{{data.showTitle}}',
				positionClass: 'ttk-scm-app-expense-list-Body',
				visible: '{{data.showTableSetting}}',
				confirmClick: '{{function(data){$showTableSetting({value: false, data: data})}}}',
				cancelClick: '{{function(){$closeTableSetting()}}}',
				resetClick: '{{function(){$resetTableSetting({data: data})}}}'
			}, {
				name: 'header',
				component: '::div',
				className: 'ttk-scm-app-expense-list-header',
				children: [{
					name: 'left',
					component: '::div',
					className: 'ttk-scm-app-expense-list-header-left',
					children: [{
						name: 'period',
						component: 'DatePicker.MonthPicker',
						value: '{{$stringToMoment(data.searchValue.period)}}',
						onChange: "{{function(d){$periodChange('data.searchValue.period',$momentToString(d,'YYYY-MM'))}}}",
						disabledDate: '{{function(value){return $disabledMonth(value)}}}',
					}, {
						name: 'refreshBtn',
						component: 'Icon',
						fontFamily: 'edficon',
						type: 'shuaxin',
						title: '刷新',
						className: 'reload',
						onClick: '{{$refresh}}'
					}]
				}, {
					name: 'right',
					component: '::div',
					className: 'ttk-scm-app-expense-list-header-right',
					children: [/*{
						name: 'financial',
						component: 'Button',
						type: 'primary',
						children: '对接金财助手',
						onClick: '{{ function(){ $financialClick() } }}'
					}, */{
							name: 'add',
							component: 'Button',
							type: 'primary',
							children: '新增',
							onClick: '{{ function(){ $addClick() } }}'
						},
						{
							name: 'exportList',
							component: 'Button',
							className: 'expense-btn',
							children: '导入票税宝报销单',
							onClick: '{{$handleOpenAccount}}'
						},
						{
							name: 'addVoucher',
							component: 'Button',
							children: '生成凭证',
							className: 'btn-voucher expense-btn',
							onClick: '{{$addVoucher}}'
						},
						{
							name: 'batch',
							component: 'Dropdown',
							placement: "bottomRight",
							overlay: {
								name: 'menu',
								component: 'Menu',
								onClick: '{{$moreActionOpeate}}',
								children: [{
									name: 'subjectManage',
									component: 'Menu.Item',
									key: 'subjectManage',
									children: '科目设置'
								}, {
									name: 'voucherHabit',
									component: 'Menu.Item',
									key: 'voucherHabit',
									children: '凭证习惯'
								}, {
									name: 'delVoucher',
									component: 'Menu.Item',
									key: 'delVoucher',
									children: '删除凭证'
								}]
							},
							children: {
								name: 'internal',
								component: 'Button',
								className: 'ttk-scm-app-expense-list-more',
								children: [{
									name: 'more',
									component: 'Icon',
									type: 'down'
								}]
							}
						}, {
							name: 'del',
							component: 'Button',
							className: 'expense-btn',
							children: '删除',
							onClick: '{{ function(){ $delBatchClick() } }}'
						}]
				}]
			}, {
				className: 'ttk-scm-app-expense-list-Body',
				name: 'report',
				component: 'Table',
				key: '{{data.tableKey}}',
				checkboxKey: 'seq',
				remberName: 'ttk-scm-app-expense-list-Body',
				loading: '{{data.loading}}',
				checkboxChange: '{{$checkboxChange}}',
				checkboxValue: '{{data.tableCheckbox.checkboxValue}}',
				pagination: false,
				scroll: '{{data.list.length > 0 ? data.tableOption : {} }}',
				enableSequenceColumn: true,
				//onChange: '{{$tableOnchange}}',
				Checkbox: false,
				rowSelection: '{{$rowSelection()}}',
				noDelCheckbox: true,
				bordered: true,
				dataSource: '{{data.list}}',
				columns: '{{$renderColumns()}}',
				rowKey: "id"
			},
			{
				name: 'footer',
				className: 'ttk-scm-app-expense-list-footer',
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
			totalCount: 1,// -- 全部数量
			notApproveCount: 1,//-- 未审核数量
			list: [],
			tableKey: 1000,
			tableOption: { x: 500 },
			showPicker: false,
			showTableSetting: false,
			sort: {
				userOrderField: null,
				order: null
			},
			orders: [
				{
					name: "code",
					asc: true
				}
			],
			content: '查询条件：',
			searchValue: {
				period: '',
				page: {
					"currentPage": 1,
					"pageSize": 20
				},
			},
			pagination: {
				currentPage: 1,//-- 当前页
				pageSize: 20,//-- 页大小
				totalCount: 0,
				totalPage: 0
			},
			other: {
				activeKey: 'all',
				dateRangeKey: 'thisMonth',//日期范围
				customer: ['1', '2', '3', '4'],
				option: [],
				ts: '',
				accountList: [],
				columnDto: [],
				sourceVoucherTypeIdOption: [],
				voucherStateOption: [],
				expenseCategory: [],
				department: [],
				project: [],
				businessType: [],
				isAuditEdit: true,
				isCanSave: true,
				expenseInitDto: {
					bankAccounts: [],
					customers: [],
					persons: [],
					suppliers: []
				},
				account:[]
			},
			tableCheckbox: {
				checkboxValue: [],
				selectedOption: []
			},
			loading: true,
			showTitle: false
		}
	}
}
