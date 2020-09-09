export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'app-account-beginbalance',
		id: 'app-account-beginbalance-id',
		children: [{
			name: 'header',
			component: 'Layout',
			className: 'app-account-beginbalance-header',
			id: 'app-account-beginbalance-header-id',
			children: [{
				name: 'left',
				component: 'Layout',
				className: 'app-account-beginbalance-header-left',
				children: [{
					name: 'year',
					component: 'Layout',
					className: 'app-account-beginbalance-header-left-year',
					children: [
						// 	{
						// 	name: 'year',
						// 	width: 120,
						// 	component: 'Select',
						// 	value: "{{ data.other.year && data.other.year.name }}",
						// 	onChange: `{{$onFieldChange(_ctrlPath, data.other.year && data.other.year.name)}}`,
						// 	children: {
						// 		name: 'option',
						// 		component: 'Select.Option',
						// 		value: "{{ data.other.yearList && data.other.yearList[_rowIndex].id }}",
						// 		children: '{{data.other.yearList && data.other.yearList[_rowIndex].name }}',
						// 		_power: 'for in data.other.yearList'
						// 	}
						// },
						// {
						// 	name: 'enabledPeriod',
						// 	component: '::div',
						// 	className: 'app-account-beginbalance-header-left-year-enabledPeriod',
						// 	children: '{{data.other.enabledPeriod}}'
						// },
						// {
						// 	name: 'changeEnabledPeriod',
						// 	component: '::div',
						// 	className: 'app-account-beginbalance-header-left-year-enabledPeriodChange',
						// 	children: '调整启用日期',
						// 	_visible: '{{data.other.isResetVisible}}',
						// 	// onClick: '{{$changeEnabledPeriod}}'
						// },
						{
							name: 'date',
							component: '::div',
							className: 'app-account-beginbalance-header-left-year-enabledPeriodChange',
							children: [{
								name: 'dateName',
								component: '::span',
								children: '启用日期',
								style: { fontSize: '12px' }
							}, {
								name: 'date',
								component: 'DatePicker.MonthPicker',
								allowClear: false,
								className: 'app-account-beginbalance-header-left-year-enabledPeriodChange-datepicker',
								value: '{{$stringToMoment(data.other.settedPeriod)}}',
								onChange: `{{function(d){$setField('data.other.settedPeriod', $momentToString(d,'YYYY-MM'))}}}`,
								// disabledDate: `{{function(current){ var disabledDate = new Date(data.other.settedPeriod)
								// 								return current && current.valueOf() < disabledDate
								// }}}`,
								disabled: '{{ !data.other.isResetVisible }}'
							}, {
								name: 'helpPopover',
								component: 'Popover',
								content: '存在已结账的期间，不能修改启用期间。',
								placement: 'rightTop',
								overlayClassName: 'app-account-beginbalance-helpPopover',
								children: {
									name: 'helpIcon',
									component: 'Icon',
									fontFamily: 'edficon',
									type: 'bangzhutishi',
									className: 'helpIcon'
								}
							}]
						}
					]
				}]
			}, {
				name: 'right',
				component: 'Layout',
				className: 'app-account-beginbalance-header-right',
				children: [{
					name: 'isCalcQuantity',
					children: '数量',
					key: 'isCalcQuantity',
					dataIndex: 'isCalcQuantity',
					component: 'Checkbox',
					checked: "{{data.filter.isCalcQuantity}}",
					onChange: "{{$onFieldChange(_ctrlPath, data.filter.isCalcQuantity)}}"
				}, {
					name: 'isCalcMulti',
					children: '外币',
					component: 'Checkbox',
					checked: "{{data.filter.isCalcMulti}}",
					onChange: "{{$onFieldChange(_ctrlPath, data.filter.isCalcMulti)}}"
				}, {
					name: 'code',
					className: 'hiddenValue',
					component: 'Input'
				}, {
					name: 'importBeginBalance',
					component: 'Button',
					type: 'primary',
					children: '导入期初',
					className: 'app-account-beginbalance-header-right-export',
					style: { height: '30px', marginLeft: '8px', lineHeight: '28px' },
					onClick: "{{$onClickLeadIn}}"
				}]
			}]
		}, {
			name: 'tabHeaderWrapDiv',
			component: '::div',
			className: 'app-account-beginbalance-tabHeaderWrapDiv',
			children: [{
				name: 'tabHeaderDiv',
				component: '::div',
				className: 'app-account-beginbalance-tabHeaderWrapDiv-tabHeaderDiv',
				id: 'app-account-beginbalance-tabHeaderDiv-id',
				children: [{
					name: 'tabs',
					component: 'Tabs',
					className: 'app-account-beginbalance-tabs',
					type: 'card',
					activeKey: '{{data.filter.targetKey}}',
					onChange: '{{$tabChange}}',
					children: [{
						name: 'assets',
						component: 'Tabs.TabPane',
						key: '5000010001',
						tab: '资产'
					}, {
						name: 'liabilities',
						component: 'Tabs.TabPane',
						key: '5000010002',
						tab: '负债'
					}, {
						name: 'common',
						component: 'Tabs.TabPane',
						key: '5000010003',
						_visible: '{{!data.other.accountingStandards}}',
						tab: '共同'
					}, {
						name: 'rightsInterests',
						component: 'Tabs.TabPane',
						key: '5000010004',
						tab: '权益'
					}, {
						name: 'cost',
						component: 'Tabs.TabPane',
						key: '5000010005',
						tab: '成本'
					}, {
						name: 'profitLoss',
						component: 'Tabs.TabPane',
						key: '5000010006',
						tab: '损益'
					}]
				}, {
					name: 'rightDiv',
					component: '::div',
					className: 'app-account-beginbalance-rightDiv',
					children: [{
						name: 'balanceBegin',
						component: '::div',
						className: 'app-account-beginbalance-balanceBeginDiv',
						// _visible: '{{data.other.isNotJanuary}}',
						_visible: "{{data.other.enabledMonth == '1' ? false : true}}",
						children: '{{$renderBanlace(2)}}'
					}, {
						name: 'balanceYear',
						component: '::div',
						className: 'app-account-beginbalance-balanceYearDiv',
						children: '{{$renderBanlace(1)}}'
					}]
				}]
			}]
		}, {
			name: 'singleRowContent',
			className: 'app-account-beginbalance-content',
			component: '::div',
			_visible: '{{!!data.other.isDisplaySingleRowGrid}}',
			children: [{
				name: 'report1',
				pagination: false,
				className: 'app-account-beginbalance-body',
				id: 'app-account-beginbalance-singleRowContent-id',
				component: 'Table',
				//key:"{{data.other.stepRandom}}",
				pagination: false,
				scroll: '{{ {y: data.other.scrollY} }}',
				allowColResize: false,
				enableSequenceColumn: false,
				bordered: true,
				dataSource: '{{data.list}}',
				columns: singleRowGridColumns,
				loading: '{{data.other.isLoading}}'
			}
				// 			,{
				//                 name: 'coverDiv',
				//                 component: '::div',
				//                 className: 'app-account-beginbalance-content-coverDiv',
				//             }
			]
		}, {
			name: 'doubleRowContent',
			className: 'app-account-beginbalance-content',
			component: '::div',
			_visible: '{{!data.other.isDisplaySingleRowGrid}}',
			children: [{
				name: 'report2',
				pagination: false,
				className: 'app-account-beginbalance-body',
				id: 'app-account-beginbalance-doubleRowContent-id',
				component: 'Table',
				pagination: false,
				// key: '{{Math.random()}}',
				scroll: '{{ !data.other.isNotJanuary || data.list.length == 0 ? {y: data.other.scrollY}  : (data.filter.isCalcMulti || data.filter.isCalcQuantity) ? {x: 1900, y: data.other.scrollY} :  {x: 1500, y: data.other.scrollY}}}',
				// scroll: '{{{y: data.other.scrollY} }}',
				allowColResize: false,
				enableSequenceColumn: false,
				bordered: true,
				dataSource: '{{data.list}}',
				columns: doubleRowGridColumns,
				loading: '{{data.other.isLoading}}'
			}]
		}, {
			name: 'foot', //财务期初 上一步 下一步
			component: '::div',
			className: '',
			className: '{{ data.other.isShowBtn ? "app-account-beginbalance-footer" : "footervisible"}}',
			children: [{
				component: 'Button',
				children: '上一步',
				className: 'app-account-beginbalance-footer-btn',
				onClick: '{{$preStep}}'
			}, {
				component: 'Button',
				children: '完成',
				type: 'primary',
				className: 'app-account-beginbalance-footer-btn',
				onClick: '{{$finish}}'
			}]
		}, {
			name: 'stepTips',
			component: '::div',
			_visible: false, 
			run: "{{data.other.stepEnabled}}",
			locale: { back: '上一步', close: '关 闭', last: '完 成', next: '下一步', skip: '忽 略' },
			scrollToFirstStep: true,
			disableCloseOnEsc: true,
			disableOverlayClose: true,
			continuous: true,
			showProgress: false,
			showSkipButton: true,
			callback: "{{$onExit}}",
			steps: [{
				target: '.app-account-beginbalance-header-left-year-enabledPeriodChange',
				content: ['在这里可调整', {
					name: 'span',
					component: '::span',
					className: 'ttk-rc-intro-style',
					children: '启用期间'
				}],
				placement: 'right',
				disableBeacon: true,
			}, {
				target: '.app-account-beginbalance-header-right-export',
				content: ['可', {
					name: 'span',
					component: '::span',
					className: 'ttk-rc-intro-style',
					children: '导入'
				}, '其他财务软件的期初余额'],
				placement: 'left',
				disableBeacon: true,

			}, {
				target: '.stepShowRowIndex',
				content: ['在这里手工录入', {
					name: 'span',
					component: '::span',
					className: 'ttk-rc-intro-style',
					children: '期初余额'
				}, '和', {
						name: 'span',
						component: '::span',
						className: 'ttk-rc-intro-style',
						children: '累计发生额'
					}, ',按回车自动保存'],
				placement: 'bottom',
				disableBeacon: true,
			}]
		}]
	}
}

export const singleRowGridColumns = [
	{
		title: '编码',
		dataIndex: 'accountCode',
		key: 'accountCode',
		width: '7%'
	}, {
		title: '名称',
		width: '18%',
		key: 'accountName',
		dataIndex: 'accountName',
		render: "{{function(_rowIndex, v, index){return $renderNameColumn(v, index)}}}"
	}, {
		title: '方向',
		width: '5%',
		dataIndex: 'directionName',
		key: 'directionName',
		align: 'center'
	}, {
		title: '币种',
		width: '8%',
		dataIndex: 'currencyName',
		key: 'currencyName',
		align: 'center',
		_visible: '{{data.other.isDisplayCurrencyName}}'
	}, {
		width: '15%',
		align: 'center',
		title: '期初余额',
		key: 'beginAmount',
		name: 'beginBalance.beginAmount',
		dataIndex: 'beginAmount',
		render: "{{function(_rowIndex, v, index){return $renderColumns('beginAmount', v, _ctrlPath, index)}}}"
	}, {
		width: '15%',
		align: 'center',
		title: '本年借方累计',
		key: 'amountDr',
		name: 'quantityCurYearDr.amountDr',
		dataIndex: 'amountDr',
		_visible: "{{data.other.enabledMonth == '1' ? false : true}}",
		render: "{{function(_rowIndex, v, index){return $renderColumns('amountDr', v, _ctrlPath, index)}}}"
	}, {
		width: '15%',
		align: 'center',
		title: '本年贷方累计',
		key: 'amountCr',
		name: 'quantityCurYearCr.amountCr',
		dataIndex: 'amountCr',
		_visible: "{{data.other.enabledMonth == '1' ? false : true}}",
		render: "{{function(_rowIndex, v, index){return $renderColumns('amountCr', v, _ctrlPath, index)}}}"
	}, {
		width: '12%',
		title: '年初余额',
		name: 'yearBeginBalance.yearBeginAmount',
		// align: 'center',
		key: 'yearBeginAmount',
		_visible: "{{data.other.enabledMonth == '1' ? false : true}}",
		dataIndex: 'yearBeginAmount',
		render: "{{function(_rowIndex, v, index){return $renderSpan('yearBeginAmount', _rowIndex)}}}"
	}, {
		title: '操作',
		key: 'voucherState',
		align: 'center',
		// fixed: 'right',
		className: 'table_fixed_width',
		// _visible: '{{!!data.other.isDisplayOperation}}', // 年份下拉选去掉操作不在受控制
		width: '5%',
		render: "{{function(record, v, index){return $operateCol(record, index)}}}"
	}
]

export const doubleRowGridColumns = [
	{
		width: '15%',
		title: '编码',
		dataIndex: 'accountCode',
		key: 'accountCode',
	}, {
		width: '35%',
		title: '名称',
		key: 'accountName',
		dataIndex: 'accountName',
		render: "{{function(_rowIndex, v, index){return $renderNameColumn(v, index)}}}"
	}, {
		width: '12%',
		title: '方向',
		dataIndex: 'directionName',
		key: 'directionName',
		align: 'center'
	}, {
		width: '15%',
		title: '币种',
		dataIndex: 'currencyName',
		key: 'currencyName',
		align: 'center',
		// _visible: '{{!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti}}'
		_visible: '{{!data.other.isDisplayOnlyAmount && (data.other.isDisplayCurrencyName || data.filter.isCalcMulti)}}'
	}, {
		title: '期初余额',
		key: 'beginBalance',
		dataIndex: 'beginBalance',
		width: '20%',
		children: [{
			width: '20%',
			title: '数量',
			key: 'beginQuantity',
			dataIndex: 'beginQuantity',
			_visible: '{{!data.other.isDisplayOnlyAmount && data.filter.isCalcQuantity}}',
			render: "{{function(_rowIndex, v, index){return $renderColumns('beginQuantity', v, _ctrlPath, index)}}}"
		}, {
			width: '20%',
			title: '外币金额',
			key: 'beginOrigAmount',
			dataIndex: 'beginOrigAmount',
			_visible: '{{!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti}}',
			render: "{{function(_rowIndex, v, index){return $renderColumns('beginOrigAmount', v, _ctrlPath, index)}}}"
		}, {
			width: '20%',
			title: "{{(!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti) ? '本位币金额' : '金额'}}",
			key: 'beginAmount',
			dataIndex: 'beginAmount',
			render: "{{function(_rowIndex, v, index){return $renderColumns('beginAmount', v, _ctrlPath, index)}}}"
		}]
	}, {
		title: '本年借方累计',
		key: 'quantityCurYearDr',
		dataIndex: 'quantityCurYearDr',
		_visible: '{{data.other.isNotJanuary}}',
		width: '20%',
		children: [{
			width: '20%',
			title: '数量',
			key: 'quantityDr',
			dataIndex: 'quantityDr',
			_visible: '{{!data.other.isDisplayOnlyAmount && data.filter.isCalcQuantity}}',
			render: "{{function(_rowIndex, v, index){return $renderColumns('quantityDr', v, _ctrlPath, index)}}}"
		}, {
			width: '20%',
			title: '外币金额',
			key: 'origAmountDr',
			dataIndex: 'origAmountDr',
			_visible: '{{!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti}}',
			render: "{{function(_rowIndex, v, index){return $renderColumns('origAmountDr', v, _ctrlPath, index)}}}"
		}, {
			width: '20%',
			title: "{{(!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti) ? '本位币金额' : '金额'}}",
			key: 'amountDr',
			dataIndex: 'amountDr',
			render: "{{function(_rowIndex, v, index){return $renderColumns('amountDr', v, _ctrlPath, index)}}}"
		}]
	}, {
		title: '本年贷方累计',
		key: 'quantityCurYearCr',
		dataIndex: 'quantityCurYearCr',
		_visible: '{{data.other.isNotJanuary}}',
		width: '20%',
		children: [{
			width: '20%',
			title: '数量',
			key: 'quantityCr',
			dataIndex: 'quantityCr',
			_visible: '{{!data.other.isDisplayOnlyAmount && data.filter.isCalcQuantity}}',
			render: "{{function(_rowIndex, v, index){return $renderColumns('quantityCr', v, _ctrlPath, index)}}}"
		}, {
			width: '20%',
			title: '外币金额',
			key: 'origAmountCr',
			dataIndex: 'origAmountCr',
			_visible: '{{!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti}}',
			render: "{{function(_rowIndex, v, index){return $renderColumns('origAmountCr', v, _ctrlPath, index)}}}"
		}, {
			width: '20%',
			title: "{{(!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti) ? '本位币金额' : '金额'}}",
			key: 'amountCr',
			dataIndex: 'amountCr',
			render: "{{function(_rowIndex, v, index){return $renderColumns('amountCr', v, _ctrlPath, index)}}}"
		}]
	}, {
		title: '年初余额',
		key: 'yearBeginBalance',
		dataIndex: 'yearBeginBalance',
		_visible: '{{data.other.isNotJanuary}}',
		width: '20%',
		children: [{
			width: '20%',
			title: '数量',
			key: 'yearBeginQuantity',
			dataIndex: 'yearBeginQuantity',
			_visible: '{{!data.other.isDisplayOnlyAmount && data.filter.isCalcQuantity}}',
			render: "{{function(_rowIndex, v, index){return $renderSpan('yearBeginQuantity', _rowIndex)}}}"
		}, {
			width: '20%',
			title: '外币金额',
			key: 'yearBeginOrigAmount',
			dataIndex: 'yearBeginOrigAmount',
			_visible: '{{!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti}}',
			render: "{{function(_rowIndex, v, index){return $renderSpan('yearBeginOrigAmount', _rowIndex)}}}"
		}, {
			width: '20%',
			title: "{{(!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti) ? '本位币金额' : '金额'}}",
			key: 'yearBeginAmount',
			dataIndex: 'yearBeginAmount',
			render: "{{function(_rowIndex, v, index){return $renderSpan('yearBeginAmount', _rowIndex)}}}"
		}]
	}, {
		width: '50px',
		title: '操作',
		key: 'voucherState',
		fixed: '{{!data.other.isNotJanuary ? "" : "right"}}',
		align: 'center',
		className: 'table_fixed_width',
		// _visible: '{{!!data.other.isDisplayOperation}}', // 年份下拉选去掉操作不在受控制
		render: "{{function(record, v, index){return $operateCol(record, index)}}}"
	}
]

export function getInitState() {
	return {
		data: {
			list: [],
			filter: {
				targetKey: '5000010001',
				isCalcQuantity: false,
				isCalcMulti: false
			},
			other: {
				yearList: [],
				tryCacuBalance: tryCacuBalance,
				enabledYear: undefined,                 //启用年份
				enabledMonth: undefined,                //启用月份
				canDisplayCurYearDr: true,              //本年借方累计能否显示
				canDisplayCurYearCr: true,              //本年贷方累计能否显示
				canDisplayYearBegin: true,              //年初余额能否显示
				isResetVisible: true,                  //调整按钮是否显示
				accountingStandardName: '',             //当前组织企业会计准则名称
				// accountingStandards: '',                //当前组织企业会计准则
				minDocVoucherDate: '',                  //最小凭证日期
				activeKey: 0,                           //当前的tab页 目前只有会计科目可用
				isCalcQuantity: false,                  //是否显示数量
				isCalcMulti: false,                     //是否显示多币种
				accountType: undefined,                 //科目类型  供期初余额使用
				balanceGridPath: 'pages.beginBalances.singleRowGrid',
				isDisplayOperation: true,
				enabledPeriod: '',
				isDisplaySingleRowGrid: true,
				isDisplayOnlyAmount: true,
				isNotJanuary: true,
				calcDict: {}, // 辅助明细下拉选
				isLoading: true,
				scrollY: 0,
				haveMonthlyClosing: false, //是否月结
				accountingStandards: true, //是否为小企业会计准则
				ts: undefined,
				customAttribute: 0,
				stepEnabled: false,
				isShowBtn: false,
				stepRandom: Math.random()
			}
		}
	}
}

export const tryCacuBalance = {
	yearBeginAmountDr: 0,	  //借方年初余额
	yearBeginAmountCr: 0,    //贷方年初余额
	beginAmountDr: 0,  //借方期初余额
	beginAmountCr: 0   //贷方期初余额
}

export const accountTypeEnum = {
	ACCOUNT_ASSETS: 5000010001,			  //资产
	ACCOUNT_COMMONS: 5000010003,			//共同
	ACCOUNT_DEBTS: 5000010002,			  //负债
	ACCOUNT_RIGHTS: 5000010004,			  //权益
	ACCOUNT_COSTS: 5000010005,			    //成本
	ACCOUNT_INCOMES: 5000010006		    //损益
}
//去除千分位

export function clearThousandsPosition(num) {
	if (num && num.toString().indexOf(',') > -1) {
		let x = num.toString().split(',')
		return parseFloat(x.join(""))
	} else {
		return Number(num)
	}
}

export function addThousandsPosition(input, isFixed) {
	// if (isNaN(input)) return null
	if (isNaN(input)) return ''
	let num

	if (isFixed) {
		num = parseFloat(input).toFixed(2)
	} else {
		num = input.toString()
	}
	let regex = /(\d{1,3})(?=(\d{3})+(?:\.))/g

	return num.replace(regex, "$1,")
}

export function combineAuxItemContent(subItem, fieldType) {
	let combineStr = ''
	if (fieldType == 'accountCode') {
		combineStr = subItem.accountCode
		combineStr = subItem.customerCode != undefined ? combineStr + '_' + subItem.customerCode : combineStr
		combineStr = subItem.departmentCode != undefined ? combineStr + '_' + subItem.departmentCode : combineStr
		combineStr = subItem.personName != undefined ? combineStr + '_' + subItem.personName : combineStr
		combineStr = subItem.inventoryCode != undefined ? combineStr + '_' + subItem.inventoryCode : combineStr
		combineStr = subItem.supplierCode != undefined ? combineStr + '_' + subItem.supplierCode : combineStr
		combineStr = subItem.projectCode != undefined ? combineStr + '_' + subItem.projectCode : combineStr
		combineStr = subItem.bankAccountName != undefined ? combineStr + '_' + subItem.bankAccountName : combineStr
		combineStr = subItem.levyAndRetreatId != undefined ? combineStr + '_' + subItem.levyAndRetreatId : combineStr
		combineStr = subItem.inputTaxId != undefined ? combineStr + '_' + subItem.inputTaxId : combineStr
	} else {
		combineStr = subItem.customerName != undefined ? combineStr + '_' + subItem.customerName : combineStr
		combineStr = subItem.supplierName != undefined ? combineStr + '_' + subItem.supplierName : combineStr
		combineStr = subItem.projectName != undefined ? combineStr + '_' + subItem.projectName : combineStr
		combineStr = subItem.departmentName != undefined ? combineStr + '_' + subItem.departmentName : combineStr
		combineStr = subItem.personName != undefined ? combineStr + '_' + subItem.personName : combineStr
		combineStr = subItem.inventoryName != undefined ? combineStr + '_' + subItem.inventoryName : combineStr

		let initArr = []
		for (let i = 0; i < 10; i++) {
			initArr.push(`exCalc${i + 1}Name`)
		}

		initArr.forEach((item) => {
			combineStr = subItem[item] != undefined ? combineStr + '_' + subItem[item] : combineStr
		})

		// combineStr = subItem.bankAccountName != undefined ? combineStr + '_' + subItem.bankAccountName : combineStr
		// combineStr = subItem.levyAndRetreatName != undefined ? combineStr + '_' + subItem.levyAndRetreatName : combineStr
		// combineStr = subItem.inputTaxName != undefined ? combineStr + '_' + subItem.inputTaxName : combineStr

		// combineStr = subItem.accountCodeName.split('_') ? subItem.accountCodeName.split('_').reverse().join('_') : ''
		// const newList = []
		// if (subItem.accountCodeName) {
		// 	subItem.accountCodeName.split('_').forEach(element => {
		// 		if (element != 'null') {
		// 			newList.push(element)
		// 		}
		// 	});
		// }

		// combineStr = newList.reverse().join('_')

		combineStr = combineStr.substring(1)
	}

	return combineStr
}

export const ACCOUNTTYPE_ASSETS = 5000010001  						//资产
export const ACCOUNTTYPE_LIABILITIES = 5000010002  				//负债
export const ACCOUNTTYPE_COMMON = 5000010003  						//共同
export const ACCOUNTTYPE_RIGHTSANDINTERSETS = 5000010004  //权益
export const ACCOUNTTYPE_COST = 5000010005  							//成本
export const ACCOUNTTYPE_PROFITANDLOSS = 5000010006  			//损益
export const ACCOUNTTYPE_income = 5000010008  			//收入
export const ACCOUNTTYPE_expenses = 5000010009  			//费用
