import moment from 'moment'
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-proceeds-list',
		children: [{
			name: 'tablesetting',
			component: 'TableSettingCard',
			data: '{{data.other.columnDetails}}',
			showTitle: '{{true}}',
			positionClass: 'ttk-scm-app-proceeds-list-Body',
			visible: '{{data.showTableSetting}}',
			confirmClick: '{{function(data){$showTableSetting({value: false, data: data})}}}',
			cancelClick: '{{function(){$closeTableSetting()}}}',
			resetClick: '{{$resetClick}}'
		}, {
			name: 'accountQuery',
			title: 'accountQuery',
			className: 'ttk-scm-app-proceeds-list-accountQuery',
			component: 'SearchCard',
			refName: 'accountQuery',
			clearClick: '{{function(value){$clearClick(value)}}}',
			searchClick: '{{function(value){$searchValueChange(value)}}}',
			cancelClick: '{{function(value){$searchCancelChange(value)}}}',
			onChange: '{{function(value){$searchValueChange(value)}}}',
			refreshBtn: {
				name: 'refreshBtn',
				component: 'Icon',
				fontFamily: 'edficon',
				type: 'shuaxin',
				title: '刷新',
				className: 'mk-normalsearch-reload',
				onClick: '{{$refresh}}',
			},
			menuBtn: [
				{
					name: 'newAdd',
					component: 'Button',
					type: 'primary',
					children: '新增',
					onClick: '{{$newAddProofClick}}'
				},
				{
					name: 'addVoucher',
					component: 'Button',
					children: '生成凭证',
					className: 'btn-voucher',
					onClick: '{{$allAuditClick}}'
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
						}]
					},
					children: {
						name: 'internal',
						component: 'Button',
						className:'ttk-scm-app-proceeds-list-more',
						children: [{
							name: 'more',
							component: 'Icon',
							type: 'down'
						}]
					}
				}, 
				{
					name: '删除凭证',
					component: 'Button',
					children: '删除凭证',
					onClick: '{{$allVersaAuditClick}}'
				}, {
					name: 'batch',
					component: 'Dropdown',
					overlay: {
						name: 'menu',
						component: 'Menu',
						onClick: '{{$moreActionOpeate}}',
						children: [/*{
							name: 'versaAudit',
							component: 'Menu.Item',
							className: 'more_btn_item',
							key: 'allVersaAuditClick',
							children: '反审核'
						}, */{
							name: 'versaAudit',
							component: 'Menu.Item',
							className: 'more_btn_item',
							key: 'allDel',
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
				}/*, {
					name: 'save',
					component: 'Icon',
					fontFamily: 'edficon',
					className: 'ttk-scm-app-proceeds-list-dayin',
					type: 'dayin',
					onClick: '{{$print}}',
					title: '打印'
				}*/, {
					name: 'share',
					component: 'Icon',
					fontFamily: 'edficon',
					className: 'ttk-scm-app-proceeds-list-daochu',
					type: 'daochu',
					title: '导出',
					onClick: '{{$export}}'
				}],
			selectDate: {
				name: 'selectDate',
				component: 'Select',
				className: 'selectDate',
				value: '{{data.searchValue.datePreset}}',
				onChange: "{{$dateSelect}}",
				children: {
					name: 'option',
					component: 'Select.Option',
					disabled: '{{ data.other.datePreset &&data.other.datePreset[_rowIndex].value == "custom" ? true : false}}',
					value: "{{data.other.datePreset &&data.other.datePreset[_rowIndex].value}}",
					children: "{{data.other.datePreset &&data.other.datePreset[_rowIndex].label}}",
					_power: 'for in data.other.datePreset'
				}
			},
			// normalSearchValue: `{{$getNormalSearchValue()}}`,
			// normalSearchChange: '{{$normalSearchChange}}',
			normalSearcChildren: [{
				name: 'date',
				component: 'DateRangeDatePicker',
				allowClear: false,
				startEnableDate: '{{data.other.enableddate}}',
				onChange: '{{$normalSearchDateChange}}',
				// onChange: '{{$normalSearchDateOnChange}}',
				value: '{{$getNormalDateValue()}}'
			}],
			moreSearch: '{{data.searchValue}}',
			// moreSearchRules: '{{$checkSearchValue}}',
			moreSearchItem: [{
				name: 'datePreset',
				label: '常用',
				onChange:"{{$dateSelectMoreSearch}}",
				type: 'Select',
				childType: 'Option',
				noClear:true,
				option: '{{data.other.datePreset}}',
			},{
				name: 'date',
				range: true,
				label: '时间',
				centerContent: '－',
				isTime: true,
				pre: {
					name: 'beginDate',
					type: 'DatePicker',
					allowClear: false,
					noClear:true,
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
					allowClear: false,
					noClear:true,
					decoratorDate: '{{function(value, value2){return $disabledDate(value, value2, "next")}}}',
					rules: [{
						type: 'object',
						required: true,
						message: '该项是必填项',
					}],
				}
			}, {
					name: 'businessTypes',
					label: '收款类型',
					onChange:"{{$businessSelectMoreSearch}}",
					type: 'Select',
					childType: 'Option',
					allowClear: true,
					option: '{{data.other.businessTypes}}',
				}, {
					name: 'businessTypeId',
					label: '明细类型',
					onChange:"{{$businessChildMoreSearch}}",
					type: 'Select',
					allowClear: true,
					visible: "{{!data.searchValue.businessTypes}}",
					childType: 'Option',
					option: '{{data.other.businessTypesChildren}}',
				},{
				name: 'bankAccountId',
				label: '账户',
				type: 'Select',
				allowClear: true,
				onChange:"{{$accountMoreSearch}}",
				childType: 'Option',
				option: '{{data.other.account}}',
			}],
		}, {
			className: 'ttk-scm-app-proceeds-list-Body',
			name: 'report',
			component: 'Table',
			key: '{{data.tableKey}}',
			checkboxKey: 'code',
			remberName: 'ttk-scm-app-proceeds-list',
			loading: '{{data.loading}}',
			checkboxChange: '{{$checkboxChange}}',
			checkboxValue: '{{data.tableCheckbox.checkboxValue}}',
			pagination: false,
			scroll: '{{data.list.length > 0 ? data.tableOption : {} }}',
			allowColResize: true,
			enableSequenceColumn: false,
			// onChange: '{{$tableOnchange}}',
			Checkbox: false,
			// rowSelection: '{{$rowSelection()}}',
			bordered: true,
			dataSource: '{{data.list}}',
			columns: '{{$renderColumns()}}',
			rowClassName: '{{$renderRowClassName}}',
			onResizeEnd: '{{function(param){$resizeEnd(param)}}}'

		}, {
			name: 'footer',
			className: 'ttk-scm-app-proceeds-list-footer',
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
			tableKey: 1000,
			tableOption: {
				x: 1500
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
				datePreset: 'thisMonth',
				beginDate: moment().startOf('month'),
				endDate: moment().endOf('month'),
				bankAccountId: undefined,
				businessTypes:undefined,
				businessTypeId:undefined,
				entity: {
					bankAccountId: null,
					businessTypeId: null,
				},
				page: {
					currentPage: 1,
					pageSize: 20
				},
				orders: [{
					name: 'code',
					asc: true
				}]
			},
			pagination: {
				currentPage: 1,
				totalCount: 0,
				pageSize: 20,
				totalPage: 0
			},
			other: {
				account: '',
				businessTypes: '',
				businessTypesChildren:'',
				columnDetails: [],
				isAuditEdit: true,
				datePreset: [
					{
						label: '今天',
						value: 'today',
					},
					{
						label: '昨天',
						value: 'yesterday',
					},
					{
						label: '本周',
						value: 'thisWeek',
					},
					{
						label: '本月',
						value: 'thisMonth',
					},
					{
						label: '本年',
						value: 'thisYear',
					},
					{
						label: '自定义',
						value: 'custom',
					}
				],
			},
			tableCheckbox: {
				checkboxValue: [],
				selectedOption: []
			},
			loading: true
		}
	}
}
