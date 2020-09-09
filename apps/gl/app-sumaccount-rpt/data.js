// import moment from 'moment'
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-sumaccount-rpt',
		children: [{
			name: 'body',
			component: 'Layout',
			className: 'app-sumaccount-rpt-body',
			children:[{
						name: 'tablesetting',
						component: 'TableSettingCard',
						data: '{{$tableCardList()}}',
						visible: '{{data.showTableSetting}}',
						showTitle: '{{false}}',
						double:'{{data.showOption.num||data.showOption.currency?true:false}}',
						positionClass: 'app-sumaccount-rpt-Body',
						confirmClick: '{{function(data){$showTableSetting({value: false, data: data})}}}',
						cancelClick: '{{function(){$closeTableSetting()}}}',
						resetClick: '{{function(){$resetTableSetting({data: data})}}}'
				},{
				name: 'left',
				component: '::div',
				className: 'app-sumaccount-rpt-body-left',
				// className: '{{$renderTimeLineVisible() ? "app-sumaccount-rpt-body-left" :""}}',
				_visible: '{{$renderTimeLineVisible()}}',
				children: '{{$renderTimeLine("")}}'
			},{
				name: 'right',
				component: 'Layout',
				className: 'app-sumaccount-rpt-body-right',
				children:[{
					name: 'accountQuery',
					title: 'accountQuery',
					className: 'app-proof-of-list-accountQuery',
					component: 'SearchCard',
					refName: 'accountQuery',
					didMount: '{{function(childrenRef){$getSearchCard(childrenRef)}}}',
					// cancelClick: '{{function(value){$searchCancelChange(value)}}}',
					searchClick: '{{function(value){$searchValueChange(value,null,"highSearch")}}}',
					clearClick: '{{function(value){$clearValueChange(value)}}}',
					onChange: '{{function(value){$searchValueChange(value)}}}',
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
						children: '数量',
						className: 'checkboxShow-label',
						style: '{{$checkBoxisShow("quantity")}}',
						checked: '{{data.showOption.num}}',
						onChange: '{{function(e){$showOptionsChange("num", e.target.checked)}}}'
					}, {
						name: 'common',
						component: 'Dropdown',
						// trigger:'click',
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
					// 	name: '打印',
					// 	component: 'Dropdown',
					// 	onClick: '{{$print}}',
					// 	overlay: {
					// 		name: 'menu',
					// 		component: 'Menu',
					// 		onClick: '{{$shareClick}}',
					// 		children: [
					// 		{
					// 				name: 'setup',
					// 				component: 'Menu.Item',
					// 				key: 'setup',
					// 				children: {
					// 						component: '::span',
					// 						name: 'setup_btn',
					// 				children: '打印设置',
					// 				onClick: '{{$setupClick}}'
					// 			}
					// 		}]
					// 	},
					// 	children: {
					// 		name: 'internal',
					// 		component: 'Button',
					// 		// type: 'primary',
					// 		className: 'app-sumaccount-rpt-dayinBut',
					// 		children: [{
					// 			name: 'save',
					// 			component: 'Icon',
					// 			fontFamily: 'edficon',
					// 			className: 'app-sumaccount-rpt-dayin',
					// 			type: 'dayin',
					// 			title: '打印',
					//
					// 		}, {
					// 			name: 'down',
					// 			component: 'Icon',
					// 			className: 'app-sumaccount-rpt-dayin-down',
					// 			type: 'down'
					//
					// 		}]
					// 	}
					// },
					{
							name: 'printFunction',
							component: 'Dropdown.AntButton',
							onClick: '{{$print}}',
							className: 'app-sumaccount-rpt-print',
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
								className: 'app-sumaccount-rpt-dayin',
								type: 'dayin',
								title: '打印',

							}
				 },{
						name: '导出',
						component: 'Dropdown',
						onClick: '{{$export}}',
						overlay: {
							name: 'menu',
							component: 'Menu',
							onClick: '{{$shareClick}}',
							children: [
							// 	{
							// 	name: 'item',
							// 	component: 'Menu.Item',
							// 	key: 'item',
							// 	children: {
							// 		component: '::span',
							// 		name: '当前科目',
							// 		onClick: '{{$export}}',
							// 		children: '当前科目'
							// 	}
							// },
							// {
							// 	name: 'all',
							// 	component: 'Menu.Item',
							// 	key: 'all',
							// 	children: {
							// 		component: '::span',
							// 		name: '所有科目',
							// 		children: '所有科目',
							// 		onClick: '{{$exportAllAccount}}'
							// 	}
							// }
							{
								name: 'exportsetup',
								component: 'Menu.Item',
								key: 'exportsetup',
								children: {
										component: '::span',
										name: 'setup_btn',
										children: '导出设置',
										onClick: '{{$exportSetUpClick}}'
											}
									}
						]
						},
						children: {
							name: 'internal',
							component: 'Button',
							// type: 'primary',
							className: 'app-sumaccount-rpt-daochuBut',
							children: [{
								name: 'share',
								component: 'Icon',
								fontFamily: 'edficon',
								className: 'app-sumaccount-rpt-daochu',
								type: 'daochu',
								title: '导出'
							}, {
								name: 'down',
								component: 'Icon',
								className: 'app-sumaccount-rpt-dayin-down app-detailaccount-rpt-dayin-down1',
								type: 'down'
							}]
						}
					}],
					normalSearchValue: `{{$getNormalSearchValue()}}`,
					normalSearcChildren: [{
						name: 'selectContianer',
						component: '::div',
						className: 'app-sumaccount-rpt-normalSearch',
						children: [/*{
							name: 'tip',
							component: '::span',
							className: 'spanLabel',
							children: '科目名称'
						},*/{
							name: 'leftBtn',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'zuo',
							className: 'app-sumaccount-rpt-normalSearch-leftBtn',
							onClick: '{{function(){$accountlistBtn("left")}}}'
						}, {
							name: 'select',
							component: 'Select',
							className: 'app-sumaccount-rpt-normalSearch-input',
							onChange: '{{function(value){$accountlistChange(value, false)}}}',
							value: '{{data.searchValue.accountcode}}',
							optionFilterProp: "children",
							filterOption: '{{$filterOptionSummary}}',
							dropdownStyle: { zIndex: 10 },
							allowClear: true,
							children: {
								name: 'option',
								component: 'Select.Option',
								className: 'app-sumaccount-rpt-account-select-item',
								title: '{{data.other.accountlist && data.other.accountlist[_lastIndex].codeAndName }}',
								value: "{{ data.other.accountlist && data.other.accountlist[_lastIndex].code }}",
								children: '{{data.other.accountlist && data.other.accountlist[_lastIndex].codeAndName }}',
								_power: 'for in data.other.accountlist'
							}
						}, {
							name: 'rightBtn',
							component: 'Icon',
							fontFamily: 'edficon',
							type: 'you',
							className: 'app-sumaccount-rpt-normalSearch-rightBtn',
							onClick: '{{function(){$accountlistBtn("right")}}}'
						}]
					}],
					normalSearch: [{
						name: 'date',
						type: 'DateRangeMonthPicker',
						format: "YYYY-MM",
						allowClear: false,
						startEnableDate: '{{data.other.enableddate}}',
						popupStyle: { zIndex: 10 },
						mode: ['month', 'month'],
						onChange: '{{$onPanelChange}}',
						value: '{{$getNormalDateValue()}}'
					}],
					moreSearch: '{{data.searchValue}}',
					// moreSearchRules: '{{$checkSearchValue}}',
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
							decoratorDate: '{{function(value, value2){ return  $disabledDate(value, value2, "pre")}}}',
						},
						next: {
							name: 'date_end',
							type: 'DatePicker.MonthPicker',
							mode: ['month', 'month'],
							format: "YYYY-MM",
							allowClear: false,
							decoratorDate: '{{function(value, value2){return $disabledDate(value, value2, "next")}}}',
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
							showSearch: '{{true}}',
							onMouseEnter: "{{function(){$onFieldFocus(data.other.startAccountList,window.startAccountList)}}}",
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
							showSearch: '{{true}}',
							optionFilterProp: "children",
							filterOption: '{{$filterOption}}',
							className: 'searchAccountMaxWidthStyle',
							option: '{{data.other.startAccountList}}',
							onMouseEnter: "{{function(){$onFieldFocus(data.other.startAccountList,window.startAccountList)}}}",
							allowClear: true
						}
					}, {
						name: 'currencyId',
						label: '币别',
						type: 'Select',
						childType: 'Option',
						option: '{{data.other.currencylist}}',
						allowClear: false
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
					{
						name: 'nodatanodisplay',
						label: '',
						type: 'Checkbox.Group',
						render: '{{$renderCheckBox}} ',
						allowClear: true
					},
					{
						name: 'onlyShowEndAccount',
						type: 'Checkbox.Group',
						render: '{{$renderCheckBox1}} '

					}, {
						name: 'valueEqZeroIfShow',
						type: 'Checkbox.Group',
						render: '{{$renderCheckBox2}} '
					},
					],
				}, {
					name: 'rightFiexd',
					component: '::div',
					className: 'app-sumaccount-rpt-rightFiexd',
					children: [{
						name: 'setting',
						component: '::div',
						className: 'setting setting-box',
						children:{
							name: 'columnset',
							component: 'Icon',
							fontFamily:'edficon',
							className: 'columnset',
							type:"youcezhankailanmushezhi",
							onClick: '{{$showTableSettingButton}}'
						}
					}]
				},{
					name: 'voucherItems',
					component: 'VirtualTable',
					className: 'app-sumaccount-rpt-Body',
					id: 'app-sumaccount-rpt-Body-id',
					loading: '{{data.loading}}',
					key: '{{data.tableKey}}',
					tableIsNotRefreshKey: 'sumaccount',
					scroll: '{{data.tableOption}}',
					enableSequenceColumn: false,
					pagination: false,
					emptyShowScroll: true,
					allowColResize: true,
					bordered: true,
					style:{width: '100%'},
					dataSource: '{{data.list}}',
					noDelCheckbox: true,
					columns: '{{$tableColumns()}}',
					onResizeEnd: '{{function(param){$resizeEnd(param)}}}',
				}]
			}]
		},
		{
			name: 'footer',
			className: 'app-sumaccount-rpt-footer',
			component: '::div',
			children: [{
				name: 'pagination',
				component: 'Pagination',
				pageSizeOptions: ['50', '100', '150', '200'],
				pageSize: '{{data.pagination && data.pagination.pageSize}}',
				current: '{{data.pagination && data.pagination.currentPage}}',
				total: '{{data.pagination && data.pagination.totalCount}}',
				onChange: '{{$pageChanged}}',
				onShowSizeChange: '{{$sizePageChanged}}'
			}]
		}
	]
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
				h:110,
				class: 'app-sumaccount-rpt-body-right'
			},
			showTableSetting:false,
			pagination: {
				currentPage: 1,
				totalCount: 0,
				pageSize: 50,
				totalPage: 0
			},
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
				accountcode: '',
				currencyId: '0',
				nodatanodisplay: ['1'],
				valueEqZeroIfShow: ['1'],
				beginAccountGrade: '1',
				endAccountGrade: '5',
				date_end: option.date_end,
				date_start: option.date_start,
			},
			other: {
				columnDto: [
					{
					  "id": 50001400001,
					  "columnId": 500014,
					  "fieldName": "accountCode",
					  "caption": "科目编码",
					  "idFieldType": 1000040001,
					  "width": 120,
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
					  "id": 50001400002,
					  "columnId": 500014,
					  "fieldName": "accountName",
					  "caption": "科目名称",
					  "idFieldType": 1000040001,
					  "width": 120,
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
					  "id": 50001400003,
					  "columnId": 500014,
					  "fieldName": "accountDate",
					  "caption": "期间",
					  "idFieldType": 1000040001,
					  "width": 70,
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
					  "id": 50001400004,
					  "columnId": 500014,
					  "fieldName": "summary",
					  "caption": "摘要",
					  "idFieldType": 1000040001,
					  "width": 70,
					  "idAlignType": 1000050001,
					  "colIndex": 4,
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
					  "id": 50001400005,
					  "columnId": 500014,
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
					  "id": 50001400006,
					  "columnId": 500014,
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
					  "id": 50001400007,
					  "columnId": 500014,
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
					  "id": 50001400008,
					  "columnId": 500014,
					  "fieldName": "balanceAmount",
					  "caption": "余额",
					  "idFieldType": 1000040001,
					  "width": 200,
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
				startAccountList:[],				
				currencylist: [],
				enableddate: '',
				startAccountDepthList: [],
				endAccountDepthList: [],
				currentTime: null,
				timePeriod: {}
			},
			loading: true
		}
	}
}
