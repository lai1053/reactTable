import moment from 'moment'
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-incomeexpenses-rpt',
		children: [{
			name: 'tablesetting',
			component: 'TableSettingCard',
			data: '{{data.other.columnDto}}',
			visible: '{{data.showTableSetting}}',
			//visible: true,
			showTitle: '{{false}}',
			positionClass: 'ttk-scm-app-incomeexpenses-rpt-list',
			confirmClick: '{{function(data){$showTableSetting({value: false, data: data})}}}',
			cancelClick: '{{function(){$closeTableSetting()}}}',
			resetClick: '{{function(){$resetTableSetting({data: data})}}}'
		},{
			name: 'accountQuery',
			title: 'accountQuery',
			className: 'ttk-scm-app-incomeexpenses-rpt-accountQuery',
			component: 'SearchCard',
			refName: 'accountQuery',
			clearClick: '{{function(value){$clearClick(value)}}}',
			searchClick: '{{function(value){$searchValueChange(value, true)}}}',
			cancelClick: '{{function(value){$searchCancelChange(value)}}}',
			onChange: '{{function(value){$searchValueChange(value, true)}}}',
			refreshBtn: {
				name: 'refreshBtn',
				component: 'Icon',
				fontFamily: 'edficon',
				type: 'shuaxin',
				title: '刷新',
				className: 'mk-normalsearch-reload',
				onClick: '{{$refreshBtnClick}}'
			},
			menuBtn:[{
				name: 'receivables',
				component: 'Button',
				type: 'primary',
				children: '收款',
				className: 'btn',
				onClick: '{{function(){$changeApp("receivables")}}}'
			}, {
				name: 'payment',
				component: 'Button',
				//type: 'primary',
				children: '付款',
				className: 'btn',
				onClick: '{{function(){$changeApp("payment")}}}'
			}, {
				name: 'transfer',
				component: 'Button',
				//type: 'primary',
				children: '账户互转',
				className: 'btn',
				onClick: '{{function(){$exchangeAccount()}}}'
			}, {
				name: 'import',
				component: 'Button',
				//type: 'primary',
				children: '银行对账单',
				className: 'btn',
				onClick: '{{$imports}}'
			}, {
				name: 'addVoucher',
				component: 'Button',
				//type: 'primary',
				children: '生成凭证',
				className: 'btn-voucher',
				onClick: '{{$addVoucher}}'
			}, {
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
					},{
						name: 'voucherHabit',
						component: 'Menu.Item',
						key: 'voucherHabit',
						children: '凭证习惯'
					},{
						name: 'delVoucher',
						component: 'Menu.Item',
						key: 'delVoucher',
						children: '删除凭证'
					}]
				},
				children: {
					name: 'internal',
					component: 'Button',
					className:'ttk-scm-app-incomeexpenses-rpt-more',
					children: [{
						name: 'more',
						component: 'Icon',
						type: 'down'
					}]
				}
			}, {
				name: 'batch2',
				component: 'Dropdown',
				placement: "bottomRight",
				overlay: {
					name: 'menu',
					component: 'Menu',
					onClick: '{{$moreActionOpeate}}',
					children: [{
						name: 'print',
						component: 'Menu.Item',
						key: 'print',
						children: '打印'
					},{
						name: 'exports',
						component: 'Menu.Item',
						key: 'exports',
						children: '导出'
					},{
						name: 'allDelete',
						component: 'Menu.Item',
						key: 'allDelete',
						children: '删除'
					}]
				},
				children: {
					name: 'internal',
					component: 'Button',
					children: [{
						name: 'word',
						component: '::span',
						children: '更多'
					},{
						name: 'more',
						component: 'Icon',
						type: 'down'
					}]
				}
			}],
			normalSearchValue: `{{$getNormalSearchValue()}}`,
			normalSearcChildren: [{
				name: 'selectContianer',
				component: '::div',
				className: 'app-sumaccount-rpt-normalSearch',
				children: [{
					name: 'leftBtn',
					component: 'Icon',
					fontFamily: 'edficon',
          			type: 'zuo',
					className: 'app-sumaccount-rpt-normalSearch-leftBtn',
					onClick: '{{function(){$accountlistBtn("left")}}}'
				},{
					name: 'select',
					component: 'Select',
					className: 'app-sumaccount-rpt-normalSearch-input',
					onChange: '{{$accountlistChange}}',
					value: '{{data.searchValue.bankAccountId}}',
					optionFilterProp:"children",
					filterOption: '{{$filterOptionSummary}}',
					dropdownStyle: {zIndex: 10},
					children: {
						name: 'option',
						component: 'Select.Option',
						className: 'ttk-scm-app-incomeexpenses-rpt-account-select-item',
						title: '{{data.other.accountlist && data.other.accountlist[_lastIndex].name }}',
						value: "{{ data.other.accountlist && data.other.accountlist[_lastIndex].id }}",
						children: '{{data.other.accountlist && data.other.accountlist[_lastIndex].name }}',
						_power: 'for in data.other.accountlist'
					}
				},{
					name: 'rightBtn',
					component: 'Icon',
					fontFamily: 'edficon',
          			type: 'you',
					className: 'app-sumaccount-rpt-normalSearch-rightBtn',
					onClick: '{{function(){$accountlistBtn("right")}}}'
				}]
			}],
			normalSearch:[{
				name: 'date',
				type: 'DateRangeMonthPicker',
				format:"YYYY-MM",
				allowClear: false,
				startEnableDate: '{{data.enableDate}}',
				popupStyle: {zIndex: 10},
				mode: ['month', 'month'],
				onChange: '{{$onPanelChange}}',
				value: '{{$getNormalDateValue()}}'
			}],
			moreSearch: '{{data.searchValue}}',
			moreSearchItem: [{
				name: 'date',
				range: true,
				label: '日期',
				centerContent: '－',
				isTime: true,
				pre:{
					name: 'beginDate',
					type: 'DatePicker.MonthPicker',
					mode: ['month', 'month'],
					format: "YYYY-MM",
					allowClear: false,
					decoratorDate: '{{function(value, value2){return $disabledDate(value, value2, "pre")}}}'
				},
				next: {
					name: 'endDate',
					type: 'DatePicker.MonthPicker',
					mode: ['month', 'month'],
					format: "YYYY-MM",
					allowClear: false,
					decoratorDate: '{{function(value, value2){return $disabledDate(value, value2, "next")}}}'
				}
			}, {
				name: 'receiptPayment',
				label: '往来单位/个人',
				type: 'Select',
				showSearch: '{{true}}',
				childType: 'Option',
				optionFilterProp:"children",
				filterOption: '{{$filterReceiptPayment}}',
				noClear: false,
				option: '{{data.other.receiptPaymentList}}',
				allowClear: true
			}, {
				name: 'sourceVoucherType',
				label: '来源单据类型',
				type: 'Select',
				childType: 'Option',
				allowClear: false,
				noClear: true,
				option: '{{data.other.sourceVoucherTypeList}}',
				// onchange: '{{function(v){$documentType(v)}}}'
			}, {
				name: 'departmentId',
				label: '部门',
				type: 'Select',
				childType: 'Option',
				allowClear: true,
				noClear: false,
				option: '{{data.other.departmentList}}',
			}, {
				name: 'projectId',
				label: '项目',
				type: 'Select',
				childType: 'Option',
				allowClear: true,
				noClear: false,
				option: '{{data.other.projectList}}',
			}],
		}, {
			name: 'content',
			component: 'Layout',
			className: 'ttk-scm-app-incomeexpenses-rpt-list',
			children: [{
				name: 'dataGrid',
				component: 'DataGrid',
				headerHeight: 37,
				isColumnResizing: true,
				rowHeight: 35,
				ellipsis: true,
				onColumnResizeEnd: '{{$onColumnResizeEnd}}',
				loading: '{{data.loading}}',
				enableSequence: false,
				startSequence: '{{(data.pagination.currentPage-1)*data.pagination.pageSize + 1}}',
				rowsCount: "{{$getListRowsCount()}}",
				columns: "{{$getColumns()}}",
			}]
		}, {
			name: 'footer',
			component: '::div',
			className: 'ttk-scm-app-incomeexpenses-rpt-footer',
			children: [{
				name: 'pagination',
				component: 'Pagination',
				showSizeChanger: true,
				pageSizeOptions: ['50', '100', '150', '200'],
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
			list: [],
			content: '查询条件：',
			searchValue: { 	//查询条件拼接
				bankAccountId: '',  //简单查询账户名称
				receiptPayment: '',	//收支类型
				sourceVoucherType: 0,	//来源单据类型
				endDate: moment().endOf('month'),
				beginDate: moment().endOf('month'),
			},
			pagination: { 
				currentPage: 1, 
				totalCount: 0, 
				pageSize: 50, 
				totalPage: 0 
			},
			other: {
				columnDto: [],
				accountlist: [],	//简单查询账户类型列表
				receiptPaymentList: [], //高级查询往来单位及个人
				sourceVoucherTypeList: [{
					label: '全部',
					value: 0
				},{
					label: '收款单',
					value: 1
				},{
					label: '付款单',
					value: 2
				},{
					label: '账户互转单',
					value: 3
				}], //高级查询单据来源类型
				enableddate: '',
				isColumnSolution: true,
				isAuditEdit: true,
				departmentList: [],
				projectList: []
			},
			enableDate: null,
			loading: false,
			showTableSetting:false,
		}
	}
}