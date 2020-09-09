// import moment from 'moment'
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-auxdetailaccount-rpt',
		children: [{
			name: 'body',
			component: 'Layout',
			className: 'app-auxdetailaccount-rpt-body',
			children: [{
				name: 'left',
				component: '::div',
				className: 'app-auxdetailaccount-rpt-body-left',
				_visible: '{{$renderTimeLineVisible()}}',
				children: '{{$renderTimeLine("")}}'
			}, {
				name: 'right',
				component: 'Layout',
				className: 'app-auxdetailaccount-rpt-body-right',
				children: [{
					name: 'accountQuery',
					title: 'accountQuery',
					className: 'app-auxdetailaccount-rpt-accountQuery',
					component: 'SearchCard',
					refName: 'accountQuery',
					didMount: '{{function(childrenRef){$getSearchCard(childrenRef)}}}',
					clearClick: '{{function(value){$clearValueChange(value)}}}',
					searchClick: '{{function(value, option){$searchValueChange(value, option, null)}}}',
					onChange: '{{function(value){$searchValueChange(value, null, null)}}}',
					refreshBtn: {
						name: 'refreshBtn',
						component: 'Icon',
						fontFamily: 'edficon',
						type: 'shuaxin',
						className: 'mk-normalsearch-reload',
						onClick: '{{$refreshBtnClick}}',
						title: '刷新'
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
						text: '重置'
					},
					menuBtn: [{
						name: 'newAdd',
						component: 'Checkbox',
						style: '{{$checkBoxisShow("multi")}}',
						checked: '{{data.showOption.currency}}',
						onChange: '{{function(e){$showOptionsChange("currency", e.target.checked)}}}',
						children: '外币'
					}, {
						name: '审核',
						component: 'Checkbox',
						children: '数量',
						style: '{{$checkBoxisShow("quantity")}}',
						checked: '{{data.showOption.num}}',
						onChange: '{{function(e){$showOptionsChange("num", e.target.checked)}}}'
					}, {
						name: 'common',
						component: 'Dropdown',
						overlay: {
							name: 'menu',
							component: 'Menu',
							onClick: '{{$shareClick}}',
							children: [{
								name: 'weixinShare',
								component: 'Menu.Item',
								key: 'weixinShare',
								children: '微信/QQ'
							}, {
								name: 'mailShare',
								component: 'Menu.Item',
								key: 'mailShare',
								children: '邮件分享'
							}]
						},
						children: {
							name: 'internal',
							component: 'Button',
							type: 'primary',
							children: ['分享', {
								name: 'down',
								component: 'Icon',
								type: 'down'
							}]
						}
					},
					{
						name: '打印',
						component: 'Dropdown',
						overlay: {
							name: 'menu',
							component: 'Menu',
							onClick: '{{$shareClick}}',
							children: [{
								name: 'item',
								component: 'Menu.Item',
								key: 'item',
								children: {
									component: '::span',
									name: '当前项目',
									onClick: '{{$print}}',
									children: '当前项目'
								}
							}, {
								name: 'all',
								component: 'Menu.Item',
								key: 'all',
								children: {
									component: '::span',
									name: '所有项目',
									children: '所有项目',
									onClick: '{{$printAllAccount}}'
								}
							}]
						},
						children: {
							name: 'internal',
							component: 'Button',
							className: 'dayinBut',
							children: [{
								name: 'save',
								component: 'Icon',
								fontFamily: 'edficon',
								className: 'dayinBtn',
								type: 'dayin',
								title: '打印'
							}, {
								name: 'down',
								component: 'Icon',
								className: 'dayin-down',
								type: 'down'
							}]
						}

					}, {
						name: '导出',
						component: 'Dropdown',
						overlay: {
							name: 'menu',
							component: 'Menu',
							onClick: '{{$shareClick}}',
							children: [{
								name: 'item',
								component: 'Menu.Item',
								key: 'item',
								children: {
									component: '::span',
									name: '当前项目',
									onClick: '{{$export}}',
									children: '当前项目'
								}
							}, {
								name: 'all',
								component: 'Menu.Item',
								key: 'all',
								children: {
									component: '::span',
									name: '所有项目',
									children: '所有项目',
									onClick: '{{$exportAllAccount}}'
								}
							}]
						},
						children: {
							name: 'internal',
							component: 'Button',
							className: 'daochuBut',
							children: [{
								name: 'share',
								component: 'Icon',
								fontFamily: 'edficon',
								className: 'daochuBtn',
								type: 'daochu',
								title: '导出'
							}, {
								name: 'down',
								component: 'Icon',
								className: 'dayin-down dayin-down1',
								type: 'down'
							}]
						}
					}
					],
					normalSearchValue: '{{$getNormalSearchValue()}}',
					normalSearcChildren: [{
						name: 'selectContianer',
						component: '::div',
						className: 'app-auxdetailaccount-rpt-normalSearch',
						children: '{{$renderActiveSearch()}}'
					}, {
						name: 'selectContianer',
						component: '::div',
						className: 'app-auxdetailaccount-rpt-normalSearch',
						children: [{
							name: 'leftBtn',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'zuo',
							className: 'app-auxdetailaccount-rpt-normalSearch-leftBtn',
							onClick: '{{function(){$accountlistBtn("left")}}}'
						}, {
							name: 'select',
							component: 'Select',
							className: 'app-auxdetailaccount-rpt-normalSearch-input',
							onChange: '{{function(value){$accountlistChange(value, false)}}}',
							filterOption: '{{$filterAccountOption1}}',
							value: '{{data.searchValue.accountCode}}',
							allowClear: '{{data.other.accountlist && data.other.accountlist.length>0?true:false}}',
							children: {
								name: 'option',
								component: 'Select.Option',
								className: 'app-auxdetailaccount-rpt-account-select-item',
								title: '{{data.other.accountlist && data.other.accountlist[_lastIndex].codeAndName}}',
								value: "{{ data.other.accountlist && data.other.accountlist[_lastIndex].code }}",
								children: '{{data.other.accountlist && data.other.accountlist[_lastIndex].codeAndName }}',
								_power: 'for in data.other.accountlist'
							}
						}, {
							name: 'rightBtn',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'you',
							className: 'app-auxdetailaccount-rpt-normalSearch-rightBtn',
							onClick: '{{function(){$accountlistBtn("right")}}}'
						}]
					}],
					normalSearch: [{
						name: 'date',
						type: 'DateRangeMonthPicker',
						format: "YYYY-MM",
						allowClear: false,
						startEnableDate: '{{data.other.enableddate}}',
						mode: ['month', 'month'],
						_visible: '{{!$renderTimeLineVisible()}}',
						onChange: '{{$onPanelChange}}',
						value: '{{$getNormalDateValue()}}'
					}],
					moreSearch: '{{data.searchValue}}',
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
							decoratorDate: '{{function(value, value2){return $disabledDate(value, value2, "pre")}}}'
						},
						next: {
							name: 'date_end',
							type: 'DatePicker.MonthPicker',
							mode: ['month', 'month'],
							format: "YYYY-MM",
							allowClear: false,
							decoratorDate: '{{function(value, value2){return $disabledDate(value, value2, "next")}}}',
						}
					}, {
						name: 'assitform',
						type: 'AssistForm',
						assistFormOption: '{{data.assistForm.assistFormOption}}',
						assistFormSelectValue: '{{data.assistForm.assistFormSelectValue}}'
					},
					{
						name: 'accountCodeList',
						label: '会计科目',
						type: 'Select',
						mode: 'multiple',
						allowClear: true,
						childType: 'Option',
						showSearch: '{{true}}',
						optionFilterProp: "children",
						filterOption: "{{function(inputValue, option){return $filterAccountOption(inputValue, option)}}}",
						option: '{{data.other.auxAccountList}}'
					}, {
						name: 'accountDepth',
						range: true,
						label: '科目级次',
						centerContent: '－',
						pre: {
							name: 'beginAccountGrade',
							type: 'Select',
							childType: 'Option',
							disabled: "{{data.other.gradeStyleStatus}}",
							option: '{{data.other.startAccountDepthList}}',
							allowClear: false
						},
						next: {
							name: 'endAccountGrade',
							type: 'Select',
							childType: 'Option',
							disabled: "{{data.other.gradeStyleStatus}}",
							option: '{{data.other.endAccountDepthList}}',
							allowClear: false
						}
					},
						// {

						// 	label: '',
						// 	name: 'onlyShowEndAccount',
						// 	type: 'Checkbox.Group',
						// 	render: '{{$renderCheckBox1}} '
						// }
					],
				}, {

					name: 'voucherItems',
					component: 'Table',
					pagination: false,
					lazyTable: '{{data.list.length > 200 ? false : true }}',
					emptyShowScroll: true,
					className: 'app-auxdetailaccount-rpt-Body',
					loading: '{{data.loading}}',
					scroll: '{{data.tableOption}}',
					allowColResize: false,
					enableSequenceColumn: false,
					bordered: true,
					dataSource: '{{data.list}}',
					noDelCheckbox: true,
					columns: '{{$tableColumns()}}',
					onRow: '{{function(record){if(record.summary=="本月合计"||record.summary=="本年累计"){return {className: "totalRow"}}else{return {className: ""}}}}}'
				},]
			}]
		}, {
			name: 'footer',
			className: 'app-auxdetailaccount-rpt-footer',
			component: '::div',
			children: [{
				name: 'pagination',
				component: 'Pagination',
				pageSize: '{{data.pagination.pageSize}}',
				current: '{{data.pagination.currentPage}}',
				total: '{{data.pagination.totalCount}}',
				onChange: '{{$pageChanged}}',
				onShowSizeChange: '{{$sizePageChanged}}'
			}]
		}]
	}
}

export function childVoucherItems() {
	return {
		name: 'childVoucherItems',
		component: 'Table',
		dataSource: '{{data.dataItems}}',
		className: 'app-auxdetailaccount-rpt-child-Body',
		columns: [{
			title: '摘要1',
			name: 'summary1',
			dataIndex: 'summary1',
			key: 'summary1'
		}, {
			title: '科目1',
			name: 'accountingSubject1',
			dataIndex: 'accountingSubject1',
			key: 'accountingSubject1'
		}, {
			title: '借方金额1',
			name: 'debitAmount1',
			dataIndex: 'debitAmount1',
			key: 'debitAmount1',
			render: "{{data.content}}"
		}, {
			title: '贷方金额1',
			name: 'creditAmount1',
			key: 'creditAmount1',
			dataIndex: 'creditAmount1',
			render: "{{data.content}}"
		}]
	}
}

export function getInitState(option) {
	return {
		data: {
			tableOption: {
				x: 1400,
				y: null
			},
			sort: {
				userOrderField: null,
				order: null
			},
			showOption: {
				num: false,
				currency: false
			},
			showCheckbox: {
				quantity: false,
				multi: false,
			},
			list: [],
			content: '查询条件：',
			searchValue: {
				accountCode: null,
				date_end: option.date_end,
				date_start: option.date_start,
				beginAccountGrade: '1',
				endAccountGrade: '5',
				onlyShowEndAccount: [],
				currencyId: null,
				groupStr: "customerId",
				whereStr: ""
			},
			style: '',
			pagination: {
				currentPage: 1,
				totalCount: 0,
				pageSize: 50,
				totalPage: 0
			},
			assistForm: {
				assistFormSelectValue: [],
				initOption: [],
				assistFormOption: [],
				activeValue: ''
			},
			other: {
				accountlist: [],
				currencylist: [],
				enableddate: '',
				endAccountDepthList: [],
				startAccountDepthList: [
					// { key: '1', value: '1' },
					// { key: '2', value: '2' },
					// { key: '3', value: '3' },
					// { key: '4', value: '4' },
					// { key: '5', value: '5' }
				],
				currentTime: '',
				timePeriod: {}
			},
			loading: true
		}
	}
}
