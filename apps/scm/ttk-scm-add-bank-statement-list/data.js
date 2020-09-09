import moment from 'moment'
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-add-bank-statement-list',
		children: [{
			name: 'accountQuery',
			title: 'accountQuery',
			className: 'ttk-scm-add-bank-statement-list-accountQuery',
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
				name: 'import',
				component: 'Button',
				type: 'primary',
				children: '导入',
				className: 'btn',
				onClick: '{{function(){$importAccount()}}}'
			}, {
				name: 'payment',
				component: 'Button',
				//type: 'primary',
				children: '生成单据',
				className: 'btn',
				onClick: '{{function(){$generateDocuments(null)}}}'
			}, {
				name: 'dele',
				component: 'Button',
				//type: 'primary',
				children: '删除',
				className: 'btn',
				onClick: '{{$delClickBatch}}'
			}/*, {
				name: 'receivables',
				component: 'Icon',
				fontFamily: 'edficon',
				className: 'btn import',
				type: 'daoru',
				title: '导入',
				onClick: '{{function(){$importAccount()}}}'
			}*/],
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
						className: 'ttk-scm-add-bank-statement-list-account-select-item',
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
				label: '期间',
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
				name: 'receiptPaymentType',
				label: '收支状态',
				type: 'Select',
				childType: 'Option',
				noClear: true,
				option: '{{data.other.receiptPaymentTypeList}}',
				allowClear: false
			}, {
				name: 'reconciliateStatus',
				label: '生单状态',
				type: 'Select',
				childType: 'Option',
				allowClear: false,
				noClear: true,
				option: '{{data.other.reconciliateStatusList}}',
			}, {
				name: 'reciprocalAccountName',
				label: '对方账户',
				type: 'Input',
				allowClear: false,
				autocomplete:"off",
				noClear: true,
			}, {
				name: 'memo',
				label: '摘要',
				type: 'Input',
				autocomplete:"off",
				allowClear: true
			}],
		}, {
			name: 'content',
			component: 'Layout',
			className: 'ttk-scm-add-bank-statement-list-table',
			children: [{
				name: 'dataGrid',
				component: 'DataGrid',
				headerHeight: 37,
				isColumnResizing: false,
				rowHeight: 35,
				ellipsis: true,
				rememberScrollTop: true,
				loading: '{{data.loading}}',
				className: 'ttk-scm-add-bank-statement-list-DataGrid',
				// enableSequence: false,
				startSequence: '{{(data.pagination.currentPage-1)*data.pagination.pageSize + 1}}',
				rowsCount: "{{$getListRowsCount()}}",
				columns:  [{
					name: 'select',
					component: 'DataGrid.Column',
					columnKey: 'select',
					width: 34,
					//flexGrow: 1,
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
						component: "DataGrid.Cell",
						className: '{{ data.list[_rowIndex].code=="合计" ? "total" : "" }}',
						children: {
							name: 'select',
							component: '{{ data.list[_rowIndex].code=="合计" ? "::span" : "Checkbox" }}',
                            checked: '{{data.list[_rowIndex].selected}}',
                            onChange: "{{$selectRow(_rowIndex)}}"
						},
						_power: '({rowIndex})=>rowIndex',
					}
				}, {
					name: 'code',
					component: 'DataGrid.Column',
					columnKey: 'code',
					width: 102,
					flexGrow: 1,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '单据号'
					},
					cell: {
						name: 'cell',
						component: "DataGrid.Cell",
						className: '{{ data.list[_rowIndex].code=="合计" ? "total" : "" }}',
						//tip: true,
						//value: "{{data.list[_rowIndex].code}}",
						_power: '({rowIndex})=>rowIndex',
						children: [{
							name: 'code',
							component: '{{ data.list[_rowIndex].code=="合计" ? "::span" : "::a" }}',
							title: "{{data.list[_rowIndex].code}}",
							children: "{{data.list[_rowIndex].code}}",
							onClick: '{{function(){$openBill(data.list[_rowIndex])}}}'
						}]
					}
				}, {
					name: 'businessDate',
					component: 'DataGrid.Column',
					columnKey: 'businessDate',
					width: 90,
					//flexGrow: 1,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '交易日期'
					},
					cell: {
						name: 'cell',
						component: "DataGrid.Cell",
						className: '{{ data.list[_rowIndex].code=="合计" ? "total" : "" }}',
						tip: true,
						value: "{{data.list[_rowIndex].businessDate}}",
						_power: '({rowIndex})=>rowIndex',
					}
				}, {
					name: 'memo',
					component: 'DataGrid.Column',
					columnKey: 'memo',
					width: 198,
					flexGrow: 1,
					// isResizable: true,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '摘要'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						tip: true,
						className: '{{ data.list[_rowIndex].code=="合计" ? "total mk-datagrid-cellContent-left" : "mk-datagrid-cellContent-left" }}',
						value: "{{data.list[_rowIndex].memo}}",
						_power: '({rowIndex})=>rowIndex',
						// children: [{
						// 	name: 'type',
						// 	component: '::a',
						// 	title: '{{data.list[_rowIndex].memo}}',
						// 	children: '{{data.list[_rowIndex].memo}}',
						// 	// onClick: '{{$modifyDetail(data.list[_rowIndex].id)}}'
						// }]
					}
				}, {
					name: 'reciprocalAccountName',
					component: 'DataGrid.Column',
					columnKey: 'reciprocalAccountName',
					width: 138,
					flexGrow: 1,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '对方户名'
					},
					cell: {
						name: 'cell',
						component: "DataGrid.Cell",
						tip: true,
						className: '{{ data.list[_rowIndex].code=="合计" ? "total mk-datagrid-cellContent-left" : "mk-datagrid-cellContent-left" }}',
						value: "{{data.list[_rowIndex].reciprocalAccountName}}",
						_power: '({rowIndex})=>rowIndex',
					}
				}, {
					name: 'inAmount',
					component: 'DataGrid.Column',
					columnKey: 'inAmount',
					width: 108,
					flexGrow: 1,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '收入金额'
					},
					cell: {
						name: 'cell',
						component: "DataGrid.Cell",
						tip: true,
						className: '{{ data.list[_rowIndex].code=="合计" ? "total mk-datagrid-cellContent-right" : "mk-datagrid-cellContent-right" }}',
						value: "{{$formatValue(data.list[_rowIndex].inAmount)}}",
						_power: '({rowIndex})=>rowIndex',
					}
				}, {
					name: 'outAmount',
					component: 'DataGrid.Column',
					columnKey: 'outAmount',
					width: 108,
					flexGrow: 1,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '支出金额'
					},
					cell: {
						name: 'cell',
						component: "DataGrid.Cell",
						tip: true,
						className: '{{ data.list[_rowIndex].code=="合计" ? "total mk-datagrid-cellContent-right" : "mk-datagrid-cellContent-right" }}',
						value: "{{$formatValue(data.list[_rowIndex].outAmount)}}",
						_power: '({rowIndex})=>rowIndex',
					}
				}, {
					name: 'receiveCode',
					component: 'DataGrid.Column',
					columnKey: 'receiveCode',
					width: 120,
					flexGrow: 1,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '回单号'
					},
					cell: {
						name: 'cell',
						component: "DataGrid.Cell",
						tip: true,
						className: '{{ data.list[_rowIndex].code=="合计" ? "total mk-datagrid-cellContent-left" : "mk-datagrid-cellContent-left" }}',
						value: "{{data.list[_rowIndex].receiveCode}}",
						_power: '({rowIndex})=>rowIndex',
					}
				}, {
					name: 'reconciliateStatus',
					component: 'DataGrid.Column',
					columnKey: 'reconciliateStatus',
					width: 67,
					flexGrow: 1,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '生单状态'
					},
					cell: {
						name: 'cell',
						component: "DataGrid.Cell",
						className: '{{ data.list[_rowIndex].code=="合计" ? "total" : "" }}',
						tip: true,
						value: "{{data.list[_rowIndex].code=='合计' ? '' : (data.list[_rowIndex].reconciliateStatus == 0 ? '未生单' : '已生单')}}",
						_power: '({rowIndex})=>rowIndex',
					}
				}, {
					name: 'operation',
					component: 'DataGrid.Column',
					columnKey: 'operation',
					fixedRight: true,
					width: 41,
					header: {
						name: 'header',
						component: 'DataGrid.Cell',
						children: '操作'
					},
					cell: {
						name: 'cell',
						component: 'DataGrid.Cell',
						className: '{{$cellClassName(data.list[_rowIndex])}}',
						_power: '({rowIndex})=>rowIndex',
						children: [{
							name: 'update',
							component: '{{ data.list[_rowIndex].code=="合计" ? "::span" : "Icon" }}',
							fontFamily: 'edficon',
							type: 'shengchengdanju',
							style: {
								fontSize: 23,
								lineHeight: '35px'
							},
							title: '{{ data.list[_rowIndex].code=="合计" ? "" : "生成单据" }}',
							disabled: '{{data.list[_rowIndex].reconciliateStatus != 0}}',
							onClick: '{{function(){data.list[_rowIndex].reconciliateStatus == 0 && data.list[_rowIndex].code!="合计" ? $generateDocuments(data.list[_rowIndex]) : null}}}'
						}/*, {
							name: 'remove',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'chaifen',
							style: {
								fontSize: 22
							},
							title: '拆分',
							disabled: '{{data.list[_rowIndex].reconciliateStatus != 0}}',
							onClick: '{{function(){data.list[_rowIndex].reconciliateStatus == 0 ? $splitSheet(data.list[_rowIndex]) : null}}}'
						}*/]
					}
				}]
			}]
		}, {
			name: 'footer',
			component: '::div',
			className: 'ttk-scm-add-bank-statement-list-footer',
			children: [{
				name: 'pagination',
				component: 'Pagination',
				showSizeChanger: true,
				pageSizeOptions: ['50'],
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
				receiptPaymentType: 0,	//收支状态
				reconciliateStatus: 0,	//生单状态
				endDate: moment().endOf('month'),
				beginDate: moment().endOf('month'),
				memo: '', //摘要
				reciprocalAccountName: '' //对方账户
			},
			pagination: { 
				currentPage: 1, 
				totalCount: 0, 
				pageSize: 50, 
				totalPage: 0 
			},
			other: {
				accountlist: [],	//简单查询账户类型列表
				receiptPaymentTypeList: [{
					label: '全部收支',
					value: 0
				},{
					label: '收入',
					value: 1
				},{
					label: '支出',
					value: 2
				}], //高级查询收支状态
				reconciliateStatusList: [{
					label: '全部',
					value: 2
				},{
					label: '已生单',
					value: 1
				},{
					label: '未生单',
					value: 0
				}], //高级查询单据来源类型
				enableddate: ''
			},
			enableDate: null,
			loading: false
		}
	}
}