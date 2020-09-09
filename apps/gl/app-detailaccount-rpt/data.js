// import moment from 'moment'
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-detailaccount-rpt',
		children: [{
			name: 'body',
			component: 'Layout',
			className: 'app-detailaccount-rpt-body',
			children:[{
                name: 'tablesetting',
                component: 'TableSettingCard',
                data: '{{$tableCardList()}}',
                visible: '{{data.showTableSetting}}',
                showTitle: '{{false}}',
                double:'{{true}}',
                positionClass: 'app-detailaccount-rpt-table-Body',
                confirmClick: '{{function(data){$showTableSetting({value: false, data: data})}}}',
                cancelClick: '{{function(){$closeTableSetting()}}}',
                resetClick: '{{function(){$resetTableSetting({data: data})}}}'
            },{
				name: 'left',
				component: '::div',
				className: 'app-detailaccount-rpt-body-left',
				_visible: '{{$renderTimeLineVisible()}}',
				children: '{{$renderTimeLine("")}}'
			},{
				name: 'right',
				component: 'Layout',
				className: 'app-detailaccount-rpt-body-right',
				children:[{
					name: 'accountQuery',
					title: 'accountQuery',
					className: 'app-detailaccount-rpt-accountQuery',
					component: 'SearchCard',
					refName: 'accountQuery',
					didMount: '{{function(childrenRef){$getSearchCard(childrenRef)}}}',
					clearClick: '{{function(value){$clearValueChange(value)}}}',
					searchClick: '{{function(value){$searchValueChange(value, null, null, null)}}}',
					onChange: '{{function(value){$searchValueChange(value, null, null, null)}}}',
					queryAccountSubjects: '{{function(){$queryAccountSubjects()}}}',
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
					menuBtn: [{
						name: 'newAdd',
						component: 'Checkbox',
						className: 'checkboxShow-label',
						style: '{{$checkBoxisShow("multi")}}',
						checked: '{{data.showOption.currency}}',
						onChange: '{{function(e){$showOptionsChange("currency", e.target.checked)}}}',
						children: '外币'
					}, {
						name: '审核',
						component: 'Checkbox',
						className: 'checkboxShow-label',
						children: '数量',
						style: '{{$checkBoxisShow("quantity")}}',
						checked: '{{data.showOption.num}}',
						onChange: '{{function(e){$showOptionsChange("num", e.target.checked)}}}',
						// onChange: '{{$numChange}}',
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
					}, {
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
									name: '当前科目',
									onClick: '{{$print}}',
									children: '当前科目'
								}
							}, {
								name: 'batch',
								component: 'Menu.Item',
								key: 'batch',
								children: {
									component: '::span',
									name: '批量打印',
									children: '批量打印',
									onClick: '{{$batchPrint}}'
								}
							},{
								name: 'all',
								component: 'Menu.Item',
								key: 'all',
								children: {
									component: '::span',
									name: '所有科目',
									children: '所有科目',
									onClick: '{{$printAllAccount}}'
								}
							}, {
								name: 'setup',
								component: 'Menu.Item',
								key: 'setup',
								children: {
									component: '::span',
									name: 'setup_btn',
									children: '打印设置',
									onClick: '{{$setupClick}}'
								}
							}]
						},
						children: {
							name: 'internal',
							component: 'Button',
							className: 'app-detailaccount-rpt-dayinBut',
							children: [{
								name: 'save',
								component: 'Icon',
								fontFamily: 'edficon',
								className: 'app-detailaccount-rpt-dayin',
								type: 'dayin',
								title: '打印'
							}, {
								name: 'down',
								component: 'Icon',
								className: 'app-detailaccount-rpt-dayin-down',
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
									name: '当前科目',
									onClick: '{{$export}}',
									children: '当前科目'
								}
							},{
								name: 'batch',
								component: 'Menu.Item',
								key: 'batch',
								children: {
									component: '::span',
									name: '批量导出',
									children: '批量导出',
									onClick: '{{$batchExport}}'
								}
							},
							{
								name: 'all',
								component: 'Menu.Item',
								key: 'all',
								children: {
									component: '::span',
									name: '所有科目',
									children: '所有科目',
									onClick: '{{$exportAllAccount}}'
								}
							}]
						},
						children: {
							name: 'internal',
							component: 'Button',
							className: 'app-detailaccount-rpt-daochuBut',
							children: [{
								name: 'share',
								component: 'Icon',
								fontFamily: 'edficon',
								className: 'app-detailaccount-rpt-daochu',
								type: 'daochu',
								title: '导出'
							}, {
								name: 'down',
								component: 'Icon',
								className: 'app-detailaccount-rpt-dayin-down app-detailaccount-rpt-dayin-down1',
								type: 'down'
							}]
						}
					}],
					normalSearchValue: `{{$getNormalSearchValue()}}`,
					normalSearcChildren: [{
						name: 'selectContianer2',
						component: '::div',
						className: 'app-sumaccount-rpt-normalSearch',
						_visible: '{{data.assistForm && data.assistForm.assistFormOption.length == 0?false:true}}',
						children: '{{$renderActiveSearch()}}'
					}
					],
					normalSearch: [{
						name: 'date',
						type: 'DateRangeMonthPicker',
						format: "YYYY-MM",
						allowClear: false,
						startEnableDate: '{{data.enableDate}}',
						popupStyle: { zIndex: 10 },
						mode: ['month', 'month'],
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
							decoratorDate: '{{function(value, value2){return $disabledDate(value, value2, "next")}}}'
						}
					},
					{

						name: 'accountCode',
						range: true,
						label: '会计科目',
						centerContent: '－',
						pre: {
							name: 'beginAccountCode',
							type: 'Select',
							childType: 'Option',
							onMouseEnter: "{{function(){$onFieldFocus(data.other.startAccountList,window.detailAccountList)}}}",
							showSearch: '{{true}}',
							optionFilterProp: "children",
							filterOption: '{{$filterOption}}',
							className: 'searchAccountMaxWidthStyle',							
							option: '{{data.other.startAccountList}}',
							allowClear: true
						},
						next: {
							name: 'endAccountCode',
							type: 'Select',
							childType: 'Option',
							onMouseEnter: "{{function(){$onFieldFocus(data.other.startAccountList,window.detailAccountList)}}}",
							showSearch: '{{true}}',
							optionFilterProp: "children",
							filterOption: '{{$filterOption}}',
							className: 'searchAccountMaxWidthStyle',							
							option: '{{data.other.startAccountList}}',
							allowClear: true
						}
					},
					{
						name: 'currencyId',
						label: '币别',
						type: 'Select',
						childType: 'Option',
						option: '{{data.other.currencylist}}',
						allowClear: false
					},
					{
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
				{
					name: 'onlyShowEndAccount',
					type: 'Checkbox.Group',
					render: '{{$renderCheckBox1}} '

			},
					{
						name: 'noDataNoDisplay',
						label: '',
						type: 'Checkbox.Group',
						render: '{{$renderCheckBox}} ',
						allowClear: true
					}],
				}, {
					name: 'content',
					component: 'Layout',
					className: 'app-detailaccount-rpt-content',
					children: '{{$getResizeContent()}}'
					// children: [{
					// 	name: 'contentLeft',
					// 	component: 'Layout',
					// 	children: [{
					// 		name: 'titleLeft',
					// 		component: '::div',
					// 		className: 'app-detailaccount-rpt-content-treeTitle treeTitle1',
					// 		children: '{{$getTreeTitle(data.searchValue.accountCode)}}'
					// 	}, {
					// 		name: 'voucherItems',
					// 		component: 'Table',
					// 		pagination: false,
					// 		className: 'app-detailaccount-rpt-Body',
					// 		key: '{{Math.random()}}',
					// 		loading: '{{data.loading}}',
					// 		scroll: '{{ data.list.length > 0 ? data.tableOption : {}}}',
					// 		allowColResize: false,
					// 		tableIsNotRefreshKey: 'detailaccount',
					// 		enableSequenceColumn: false,
					// 		bordered: true,
					// 		dataSource: '{{data.list}}',
					// 		noDelCheckbox: true,
					// 		columns: '{{$tableColumns()}}',
					// 		onRow: '{{function(record){if(record.summary=="本月合计"||record.summary=="本年累计"){return {className: "totalRow"}}else{return {className: ""}}}}}'
					// 	}, {
					// 		name: 'footer',
					// 		className: 'app-detailaccount-rpt-footer',
					// 		component: '::div',
					// 		children: [{
					// 			name: 'pagination',
					// 			component: 'Pagination',
					// 			pageSizeOptions: ['50', '100', '150', '200'],
					// 			pageSize: '{{data.pagination.pageSize}}',
					// 			current: '{{data.pagination.currentPage}}',
					// 			total: '{{data.pagination.totalCount}}',
					// 			onChange: '{{$pageChanged}}',
					// 			onShowSizeChange: '{{$sizePageChanged}}'
					// 		}]
					// 	}]
					// }, {
					// 	name: 'contentRight1',
					// 	component: '::div',
					// 	className: 'app-detailaccount-rpt-content-right1',
					// 	_visible: '{{!data.other.showTree}}',
					// 	children: [{
					// 		name: 'item',
					// 		component: 'Icon',
					// 		fontFamily: 'edficon',
					// 		onClick: '{{$showTree}}',
					// 		style: { fontSize: '24px' },
					// 		type: 'shouhuile'
					// 	}]
					// }, {
					// 	name: 'contentRight',
					// 	component: '::div',
					// 	className: 'app-detailaccount-rpt-content-right',
					// 	_visible: '{{data.other.showTree}}',
					// 	children: [{
					// 		name: 'title',
					// 		component: '::div',
					// 		className: 'app-detailaccount-rpt-content-right-title',
					// 		children: [{
					// 			name: 'titleLeft',
					// 			component: '::div',
					// 			className: 'app-detailaccount-rpt-content-treeTitle',
					// 			children: '{{$getTreeTitle(data.searchValue.accountCode)}}'
					// 		}, {
					// 			name: 'item',
					// 			component: 'Icon',
					// 			fontFamily: 'edficon',
					// 			onClick: '{{$showTree}}',
					// 			style: { fontSize: '24px', lineHeight: '36px' },
					// 			type: 'zhankaile'
					// 		}]
					// 	}, {
					// 		name: 'select',
					// 		component: 'Select',
					// 		className: 'app-detailaccount-rpt-content-right-input',
					// 		onChange: '{{function(value){$accountlistChange(value, false)}}}',
					// 		value: '{{data.searchValue.accountCode}}',
					// 		optionFilterProp: "children",
					// 		filterOption: '{{$filterOptionSummary}}',
					// 		dropdownStyle: { zIndex: 10 },
					// 		children: '{{$accountOption()}}'
					// 	}, {
					// 		name: 'tree',
					// 		component: 'Tree',
					// 		className: 'app-detailaccount-rpt-content-right-tree',
					// 		type: 'directoryTree',
					// 		showIcon: true,
					// 		switcherIcon: '{{$showTreeIcon()}}',
					// 		onSelect: '{{$treeSelect}}',
					// 		onExpand: '{{$expandedKeys}}',
					// 		expandedKeys: '{{data.other.expandKeys}}',
					// 		selectedKeys: '{{$getDefaultSelectedKey(data.searchValue.accountCode)}}',
					// 		children: '{{$renderTreeNodes(data.other.treelist)}}'
					// 	}]
					// }]
				}]
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
				y: 0,
				h: 120,
				class: 'app-detailaccount-rpt-content-left'
			},
			showTableSetting:false,
			
			showCheckbox: {
				quantity: false,
				multi: false,
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
				currencyId: '0',
				noDataNoDisplay: ['1'],
				date_end: option.date_end,
				date_start: option.date_start,
				beginAccountGrade: '1',
				endAccountGrade: '5',
				beginAccountCode: '',
        endAccountCode: ''
			},
			pagination: {
				currentPage: 1,
				totalCount: 0,
				pageSize: 50,
				totalPage: 0
			},
			other: {
				columnDto: [
					{
					  "id": 50001000001,
					  "columnId": 500010,
					  "fieldName": "accountDate",
					  "caption": "日期",
					  "idFieldType": 1000040001,
					  "width": 89,
					  "idAlignType": 1000050001,
					  "colIndex": 1,
					  "idOrderMode": 1000060001,
					  "isFixed": false,
					  "isVisible": true,
					  "isMustSelect": true,
					  "isSystem": false,
					  "isHeader": false,
					  "isTotalColumn": false,
					  "isOrderMode": false,
					  "customDecideVisible": true,
					  "fieldTypeDTO": {
						  "id": 1000040001,
						  "name": "字符",
						  "code": "string",
						  "enumId": 100004,
						  "showOrder": 0
					  },
					  "alignTypeDTO": {
						  "id": 1000050001,
						  "name": "左对齐",
						  "code": "01",
						  "enumId": 100005,
						  "showOrder": 0
					  },
					  "orderModeDTO": {
						  "id": 1000060001,
						  "name": "升序",
						  "code": "01",
						  "enumId": 100006,
						  "showOrder": 0
					  }
				  }, {
					  "id": 50001000002,
					  "columnId": 500010,
					  "fieldName": "docTypeAndCode",
					  "caption": "凭证字号",
					  "idFieldType": 1000040001,
					  "width": 86,
					  "idAlignType": 1000050001,
					  "colIndex": 2,
					  "idOrderMode": 1000060001,
					  "isFixed": false,
					  "isVisible": true,
					  "isMustSelect": true,
					  "isSystem": false,
					  "isHeader": false,
					  "isTotalColumn": false,
					  "isOrderMode": false,
					  "customDecideVisible": true,
					  "fieldTypeDTO": {
						  "id": 1000040001,
						  "name": "字符",
						  "code": "string",
						  "enumId": 100004,
						  "showOrder": 0
					  },
					  "alignTypeDTO": {
						  "id": 1000050001,
						  "name": "左对齐",
						  "code": "01",
						  "enumId": 100005,
						  "showOrder": 0
					  },
					  "orderModeDTO": {
						  "id": 1000060001,
						  "name": "升序",
						  "code": "01",
						  "enumId": 100006,
						  "showOrder": 0
					  }
				  }, {
					  "id": 50001000003,
					  "columnId": 500010,
					  "fieldName": "summary",
					  "caption": "摘要",
					  "idFieldType": 1000040001,
					  "width": 198,
					  "idAlignType": 1000050001,
					  "colIndex": 3,
					  "idOrderMode": 1000060001,
					  "isFixed": false,
					  "isVisible": true,
					  "isMustSelect": true,
					  "isSystem": false,
					  "isHeader": false,
					  "isTotalColumn": false,
					  "isOrderMode": false,
					  "customDecideVisible": true,
					  "fieldTypeDTO": {
						  "id": 1000040001,
						  "name": "字符",
						  "code": "string",
						  "enumId": 100004,
						  "showOrder": 0
					  },
					  "alignTypeDTO": {
						  "id": 1000050001,
						  "name": "左对齐",
						  "code": "01",
						  "enumId": 100005,
						  "showOrder": 0
					  },
					  "orderModeDTO": {
						  "id": 1000060001,
						  "name": "升序",
						  "code": "01",
						  "enumId": 100006,
						  "showOrder": 0
					  }
				  }, {
					  "id": 50001000004,
					  "columnId": 500010,
					  "fieldName": "firstOtherPartAccountName",
					  "caption": "对方科目",
					  "idFieldType": 1000040001,
					  "width": 198,
					  "idAlignType": 1000050001,
					  "colIndex": 4,
					  "idOrderMode": 1000060001,
					  "isFixed": false,
					  "isVisible": false,
					  "isMustSelect": false,
					  "isSystem": false,
					  "isHeader": false,
					  "isTotalColumn": false,
					  "isOrderMode": false,
					  "customDecideVisible": true,
					  "fieldTypeDTO": {
						  "id": 1000040001,
						  "name": "字符",
						  "code": "string",
						  "enumId": 100004,
						  "showOrder": 0
					  },
					  "alignTypeDTO": {
						  "id": 1000050001,
						  "name": "左对齐",
						  "code": "01",
						  "enumId": 100005,
						  "showOrder": 0
					  },
					  "orderModeDTO": {
						  "id": 1000060001,
						  "name": "升序",
						  "code": "01",
						  "enumId": 100006,
						  "showOrder": 0
					  }
				  }, {
					  "id": 50001000005,
					  "columnId": 500010,
					  "fieldName": "amountDr",
					  "caption": "借方",
					  "idFieldType": 1000040001,
					  "width": 200,
					  "idAlignType": 1000050001,
					  "colIndex": 5,
					  "idOrderMode": 1000060001,
					  "isFixed": false,
					  "isVisible": true,
					  "isMustSelect": false,
					  "isSystem": false,
					  "isHeader": false,
					  "isTotalColumn": false,
					  "isOrderMode": false,
					  "customDecideVisible": true,
					  "fieldTypeDTO": {
						  "id": 1000040001,
						  "name": "字符",
						  "code": "string",
						  "enumId": 100004,
						  "showOrder": 0
					  },
					  "alignTypeDTO": {
						  "id": 1000050001,
						  "name": "左对齐",
						  "code": "01",
						  "enumId": 100005,
						  "showOrder": 0
					  },
					  "orderModeDTO": {
						  "id": 1000060001,
						  "name": "升序",
						  "code": "01",
						  "enumId": 100006,
						  "showOrder": 0
					  }
				  }, {
					  "id": 50001000006,
					  "columnId": 500010,
					  "fieldName": "amountCr",
					  "caption": "贷方",
					  "idFieldType": 1000040001,
					  "width": 200,
					  "idAlignType": 1000050001,
					  "colIndex": 6,
					  "idOrderMode": 1000060001,
					  "isFixed": false,
					  "isVisible": true,
					  "isMustSelect": false,
					  "isSystem": false,
					  "isHeader": false,
					  "isTotalColumn": false,
					  "isOrderMode": false,
					  "customDecideVisible": true,
					  "fieldTypeDTO": {
						  "id": 1000040001,
						  "name": "字符",
						  "code": "string",
						  "enumId": 100004,
						  "showOrder": 0
					  },
					  "alignTypeDTO": {
						  "id": 1000050001,
						  "name": "左对齐",
						  "code": "01",
						  "enumId": 100005,
						  "showOrder": 0
					  },
					  "orderModeDTO": {
						  "id": 1000060001,
						  "name": "升序",
						  "code": "01",
						  "enumId": 100006,
						  "showOrder": 0
					  }
				  }, {
					  "id": 50001000007,
					  "columnId": 500010,
					  "fieldName": "balanceDirection",
					  "caption": "方向",
					  "idFieldType": 1000040001,
					  "width": 70,
					  "idAlignType": 1000050001,
					  "colIndex": 7,
					  "idOrderMode": 1000060001,
					  "isFixed": false,
					  "isVisible": true,
					  "isMustSelect": false,
					  "isSystem": false,
					  "isHeader": false,
					  "isTotalColumn": false,
					  "isOrderMode": false,
					  "customDecideVisible": true,
					  "fieldTypeDTO": {
						  "id": 1000040001,
						  "name": "字符",
						  "code": "string",
						  "enumId": 100004,
						  "showOrder": 0
					  },
					  "alignTypeDTO": {
						  "id": 1000050001,
						  "name": "左对齐",
						  "code": "01",
						  "enumId": 100005,
						  "showOrder": 0
					  },
					  "orderModeDTO": {
						  "id": 1000060001,
						  "name": "升序",
						  "code": "01",
						  "enumId": 100006,
						  "showOrder": 0
					  }
				  }, {
					  "id": 50001000008,
					  "columnId": 500010,
					  "fieldName": "balanceAmount",
					  "caption": "余额",
					  "idFieldType": 1000040001,
					  "width": 120,
					  "idAlignType": 1000050001,
					  "colIndex": 8,
					  "idOrderMode": 1000060001,
					  "isFixed": false,
					  "isVisible": true,
					  "isMustSelect": false,
					  "isSystem": false,
					  "isHeader": false,
					  "isTotalColumn": false,
					  "isOrderMode": false,
					  "customDecideVisible": true,
					  "fieldTypeDTO": {
						  "id": 1000040001,
						  "name": "字符",
						  "code": "string",
						  "enumId": 100004,
						  "showOrder": 0
					  },
					  "alignTypeDTO": {
						  "id": 1000050001,
						  "name": "左对齐",
						  "code": "01",
						  "enumId": 100005,
						  "showOrder": 0
					  },
					  "orderModeDTO": {
						  "id": 1000060001,
						  "name": "升序",
						  "code": "01",
						  "enumId": 100006,
						  "showOrder": 0
					  }
				  }],
				accountlist: [],
				startAccountList: [],				
				currencylist: [],
				// tablekey: 1000,
				code:'',
				enableddate: '',
				showTree: true,
				expandKeys: [],
				startAccountDepthList: [],
				endAccountDepthList: [],
				currentTime: '',
				timePeriod: {},
				width:'',
				id:'',
			},
			enableDate: null,
			loading: true
		}
	}
}

export function transData(data){
    let parentList = []
    if(data && data.length > 0){
        data.forEach(item => {
                if (!item.parentId) {
                    parentList.push({...item})
                }
        })
        let list = converseTree(data, parentList)
            list.map(o => {
                if (o.children.length == 0) {
                    o.children = undefined
                }
            })
            return list
    }
}

export function converseTree (tree, parentList) {
    for (let i = 0; i < parentList.length; i++) {
        let parentItem = parentList[i]
        let childrenList = []
        let parentItemId = parentItem.id
        for (let j = 0; j < tree.length; j++) {
            let child = tree[j]
            if (child.parentId == parentItemId) {
                childrenList.push({...child})
            }
        }
        parentItem.children = childrenList
        if (childrenList.length > 0) {
            converseTree(tree, childrenList)
        }
    }
    return parentList
}
