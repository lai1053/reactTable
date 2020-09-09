// import moment from 'moment'
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-auxsumaccount-rpt',
		children: [{
			name: 'body',
			component: 'Layout',
            className: 'app-auxsumaccount-rpt-body',
            children:[{
				name: 'left',
				component: '::div',
				className: 'app-auxsumaccount-rpt-body-left',
				_visible: '{{$renderTimeLineVisible()}}',
				children: '{{$renderTimeLine("")}}'
			},{
				name: 'right',
				component: 'Layout',
				className: 'app-auxsumaccount-rpt-body-right',
				children:[{
					name: 'accountQuery',
					title: 'accountQuery',
					className: 'app-auxsumaccount-rpt-accountQuery',
					component: 'SearchCard',
					refName: 'accountQuery',
					didMount: '{{function(childrenRef){$getSearchCard(childrenRef)}}}',	
					clearClick: '{{function(value){$clearValueChange(value)}}}',
					searchClick: '{{function(value, option){$searchValueChange(value, option)}}}',
					onChange: '{{function(value){$searchValueChange(value)}}}',
					refreshBtn: {
						name: 'refreshBtn',
						component: 'Icon',
						fontFamily: 'edficon',
						type: 'shuaxin',
						title: '刷新',
						className: 'mk-normalsearch-reload',
						onClick: '{{$refreshBtnClick}}'
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
					menuBtn: [
						// 	{
						// 	name: 'newAdd',
						// 	component: 'Checkbox',
						// 	checked: '{{data.showOption.currency}}',
						// 	onChange: '{{function(e){$showOptionsChange("currency", e.target.checked)}}}',
						// 	children: '外币'
						// },{
						// 	name: '审核',
						// 	component: 'Checkbox',
						// 	children: '数量',
						// 	checked: '{{data.showOption.num}}',
						// 	onChange: '{{function(e){$showOptionsChange("num", e.target.checked)}}}'
						// },
						{
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
						// {
						// 	name: 'batch2',
						// 	component: 'Dropdown.AntButton',
						// 	onClick: '{{$print}}',
						// 	className: 'dropdownbutton2',
						// 	style: { marginLeft: '8px' },
						// 	overlay: {
						// 		name: 'menu',
						// 		component: 'Menu',
						// 		onClick: '{{$moreActionOpeate}}',
						// 		children: [
						// 			{
						// 				name: 'subjectManage',
						// 				component: 'Menu.Item',
						// 				key: 'subjectManage',
						// 				children: '打印设置'
						// 			}
			
			
						// 		]
						// 	},
						// 	children: [{
						// 		name: 'save',
						// 		component: 'Icon',
						// 		fontFamily: 'edficon',
						// 		className: 'app-auxsumaccount-rpt-dayin',
						// 		type: 'dayin',
						// 		title: '打印',
			
						// 	}]
						// }, 
						{
							name: 'save',
							component: 'Icon',
							fontFamily: 'edficon',
							className: 'app-auxsumaccount-rpt-dayin',
							type: 'dayin',
							onClick: '{{$print}}',
							title: '打印'
						}, 
						{
							name: 'share',
							component: 'Icon',
							fontFamily: 'edficon',
							className: 'app-auxsumaccount-rpt-daochu',
							type: 'daochu',
							title: '导出',
							onClick: '{{$export}}'
						}],
					normalSearcChildren: [{
						name: 'date',
						component: 'DateRangeMonthPicker',
						format: "YYYY-MM",
						allowClear: false,
						startEnableDate: '{{data.other.enableddate}}',
						mode: ['month', 'month'],
						onChange: '{{$onPanelChange}}',
						value: '{{$getNormalDateValue()}}',
					}, {
						name: 'selectContianer',
						component: '::div',
						className: 'app-auxsumaccount-rpt-normalSearch',
						children: '{{$renderActiveSearch()}}'
					}, {
						name: 'selectContianer',
						component: '::div',
						className: 'app-auxsumaccount-rpt-normalSearch',
						children: [{
							name: 'leftBtn',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'zuo',
							className: 'app-auxsumaccount-rpt-normalSearch-leftBtn',
							onClick: '{{function(){$accountlistBtn("left")}}}'
						}, {
							name: 'select',
							component: 'Select',
							className: 'app-auxsumaccount-rpt-normalSearch-input',
							onChange: '{{function(value){$accountlistChange(value, false)}}}',
							filterOption: '{{$filterAccountOption}}',
							value: '{{data.searchValue.accountCode}}',
							children: {
								name: 'option',
								component: 'Select.Option',
								className: 'app-auxsumaccount-rpt-account-select-item',
								value: "{{ data.other.accountlist && data.other.accountlist[_lastIndex].code }}",
								children: '{{data.other.accountlist && data.other.accountlist[_lastIndex].codeAndName }}',
								_power: 'for in data.other.accountlist'
							}
						}, {
							name: 'rightBtn',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'you',
							className: 'app-auxsumaccount-rpt-normalSearch-rightBtn',
							onClick: '{{function(){$accountlistBtn("right")}}}'
						}]
					}],
					normalSearch: [],
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
					}],
					// assistForm: true,
		
				}, {
					name: 'voucherItems',
					component: 'Table',
					pagination: false,
					className: 'app-auxsumaccount-rpt-Body',
					key: '{{Math.random()}}',
					loading: '{{data.loading}}',
					scroll: '{{data.list.length > 0 ? data.tableOption : {}}}',
					allowColResize: false,
					enableSequenceColumn: false,
					bordered: true,
					dataSource: '{{data.list}}',
					noDelCheckbox: true,
					columns: '{{$tableColumns()}}'
				}]
			}]
		},{
			name: 'footer',
			className: 'app-auxsumaccount-rpt-footer',
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
		className: 'app-proof-of-list-child-Body',
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
				x: 1000,
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
			list: [],
			content: '查询条件：',
			searchValue: {
				accountCode: '',
				date_end: option.date_end,
				date_start: option.date_start,
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
				currentTime: '',
				timePeriod: {}
			},
			loading: true
		}
	}
}