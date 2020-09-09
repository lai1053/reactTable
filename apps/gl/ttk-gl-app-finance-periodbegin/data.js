export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-gl-app-finance-periodbegin',
		id: 'ttk-gl-app-finance-periodbegin-id',
		children: [
			{
				name: 'glPeriodBeginBigPage',
				component: '::div',
				className: '{{ data.other.isShowBtn ? "ttk-gl-app-finance-periodbegin-glPeriodBeginBigPage" : "ttk-gl-app-finance-periodbegin-glPeriodBeginBigPage cborder"}}',
				id: 'ttk-gl-app-finance-periodbegin-glPeriodBeginBigPage-id',
				children: [{
					name: 'tabs',
					component: 'Tabs',
					className: 'ttk-gl-app-finance-periodbegin-glPeriodBeginBigPage-tabs',
					type: 'card',
					defaultActiveKey: '1001',
					onChange: '{{$bigTabChange}}',
					children: [{
						name: 'assets',
						component: 'Tabs.TabPane',
						key: '1001',
						tab: '期初科目余额'
					}, {
						name: 'liabilities',
						component: 'Tabs.TabPane',
						_visible: '{{data.other.cashflowDisabled?false:true}}',
						key: '1002',
						tab: '期初现金流量'
					}]
				}, {
					name: 'reinit',
					component: '::div',
					className: 'reinit',
					onClick: '{{$rePeriodBeginInit}}',
					_visible: '{{!data.other.isShowBtn}}',
					children: [{
						name: 'icon',
						component: 'Icon',
						fontFamily: 'edficon',
						type: 'zhongxinchushihua'
					}, {
						name: 'explain',
						component: '::span',
						children: '重新初始化'
					}]
				}
				]
			},
			{
				name: 'accountperiodbeginpage',
				component: 'Layout',
				_visible: '{{data.other.accountFlowBalancePageSwitch == 1001}}',
				className: 'ttk-gl-app-finance-periodbegin-accountperiodbeginpage',
				children: [
					{
						name: 'header',
						component: 'Layout',
						className: 'ttk-gl-app-finance-periodbegin-header',
						className: '{{ data.other.isShowBtn ? "ttk-gl-app-finance-periodbegin-header" : "ttk-gl-app-finance-periodbegin-header cborder"}}',
						id: 'ttk-gl-app-finance-periodbegin-header-id',
						children: [{
							name: 'left',
							component: 'Layout',
							className: 'ttk-gl-app-finance-periodbegin-header-left',
							children: [{
								name: 'year',
								component: 'Layout',
								className: 'ttk-gl-app-finance-periodbegin-header-left-year',
								children: [
									{
										name: 'subjectName',
										component: 'Input.Search',
										showSearch: true,
										placeholder: '请输入编码/名称',
										className: 'ttk-gl-app-finance-periodbegin-header-left-year-search',
										// onSearch:'{{$load}}',
										value: '{{data.other.positionCondition}}',
										onChange: '{{function(e){$searchChange(e.target.value)}}}',
										onSearch: `{{$fixPosition}}`
									},
									{
										name: 'date',
										component: '::div',
										className: 'ttk-gl-app-finance-periodbegin-header-left-year-enabledPeriodChange',
										children: [{
											name: 'dateName',
											component: '::span',
											children: '启用期间',
											style: { fontSize: '12px' }
										}, {
											name: 'date',
											component: 'DatePicker.MonthPicker',
											allowClear: false,
											placeholder: '',
											className: 'ttk-gl-app-finance-periodbegin-header-left-year-enabledPeriodChange-datepicker',
											value: '{{$stringToMoment(data.other.settedPeriod)}}',
											onChange: `{{function(d){$setField('data.other.settedPeriod', $momentToString(d,'YYYY-MM'))}}}`,
											// disabledDate: `{{function(current){ var disabledDate = new Date(data.other.settedPeriod)
											// 								return current && current.valueOf() < disabledDate
											// }}}`,
											disabled: '{{ !data.other.isResetVisible }}'
										}, {
											name: 'helpPopover',
											component: 'Popover',
											content: '存在已结账的期间，不能修改启用期间',
											placement: 'rightTop',
											overlayClassName: 'ttk-gl-app-finance-periodbegin-helpPopover',
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
							className: 'ttk-gl-app-finance-periodbegin-header-right',
							children: [
								{
									name: 'isBalance',
									component: 'Popover',
									placement: 'leftBottom',
									visible: '{{data.other.balanceShow}}',
									overlayClassName: 'ttk-gl-app-finance-periodbegin-isBalancePop',
									className: 'ttk-gl-app-finance-periodbegin-header-right-isBalancePop',
									content: '{{$getIsBalance()}}',
									children: [
										{
											name: 'btn',
											component: 'Button',
											className: 'ttk-gl-app-finance-periodbegin-header-right-isBalancePop-btn',
											children: '试算平衡',
											onClick: '{{$balanceModal}}'
										}
									],
								},
								{
									name: 'share',
									component: 'Icon',
									fontFamily: 'edficon',
									className: 'daochu',
									type: 'daochu',
									title: '导出',
									title: '导出',
									onClick: '{{$export}}'
								}
							]
						}]
					}, {
						name: 'tabHeaderWrapDiv',
						component: '::div',
						className: 'ttk-gl-app-finance-periodbegin-tabHeaderWrapDiv',
						children: [{
							name: 'tabHeaderDiv',
							component: '::div',
							className: '{{ data.other.isShowBtn ? "ttk-gl-app-finance-periodbegin-tabHeaderWrapDiv-tabHeaderDiv" : "ttk-gl-app-finance-periodbegin-tabHeaderWrapDiv-tabHeaderDiv cborder"}}',
							id: 'ttk-gl-app-finance-periodbegin-tabHeaderDiv-id',
							children: [{
								name: 'tabs',
								component: 'Tabs',
								className: 'ttk-gl-app-finance-periodbegin-tabs',
								type: 'card',
								activeKey: '{{data.filter.targetKey}}',
								onChange: '{{$tabChange}}',
								children: '{{$renderTabs()}}',

							}, {
								name: 'rightDiv',
								component: '::div',
								className: 'ttk-gl-app-finance-periodbegin-rightDiv',
								children: [
									{
										name: 'filter',
										children: '隐藏空数据',
										component: 'Checkbox',
										checked: "{{data.filter.isNullData}}",
										onChange: "{{$onFieldChange(_ctrlPath, data.filter.isNullData)}}"
									},
									{
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
										name: 'resetAccountPeriodBegin',
										component: 'Button',
										children: '重置',
										_visible: '{{$isShowResetBtn("reset")}}',
										className: 'ttk-gl-app-finance-periodbegin-header-right-export',
										style: { height: '28px', marginLeft: '8px', lineHeight: '28px', marginRight: '10px' },
										onClick: "{{$resetAccountPeriodBegin}}"
									}
								]
							}
							]
						}]
					}, {
						name: 'singleRowContent',
						className: '{{ data.other.isShowBtn ? "ttk-gl-app-finance-periodbegin-content" : "ttk-gl-app-finance-periodbegin-content cborder"}}',
						component: '::div',
						children: [
							{
								name: 'report1',
								component: 'VirtualTable',
								pagination: false,
								// lazyTable: '{{data.list &&data.list.length > 200 ? false : true }}',
								className: 'ttk-gl-app-finance-periodbegin-body',
								key:"{{data.other.stepRandom}}",
								allowColResize: true,
								id: '{{(data.filter.isCalcMulti || data.filter.isCalcQuantity)?"ttk-gl-app-finance-periodbegin-doubleRowContent-id":"ttk-gl-app-finance-periodbegin-singleRowContent-id"}}',
								emptyShowScroll: true,
								enableSequenceColumn: false,
								bordered: true,
								tableIsNotRefreshKey: 'periodbegin',
								style:{width: '100%'},
								scroll: '{{data.tableOption}}',
								// style: { width: '1300px' },
								// style: { width: "1000px", margin: "10px 0", minHeight: "400px" },
								// scroll: '{{ data.list&&data.list.length>0?{y: data.other.scrollY, x: data.other.scrollX}:{} }}',
								// scroll: { y: 500, x: 1300 },
								noDelCheckbox: true,
								dataSource: '{{data.list}}',
                matchIndex: '{{data.other.matchIndex}}',
								// onRow: '{{function(record, index){return $getRow(record, index)}}}',
								columns: '{{$tableColumns()}}',
								loading: '{{data.other.isLoading}}',
								onResizeEnd: '{{function(param){$resizeEnd(param)}}}',


							}
						]
					},
				]
			}, {
				name: 'cashflowperiodbeginpage',
				component: 'Layout',
				className: 'ttk-gl-app-finance-periodbegin-cashflowperiodbeginpage',
				_visible: '{{data.other.accountFlowBalancePageSwitch == 1002}}',
				children: [
					{
						name: 'header',
						component: '::div',
						className: '{{ data.other.isShowBtn ? "ttk-gl-app-finance-periodbegin-cashflowperiodbeginpage-cashflowheader" : "ttk-gl-app-finance-periodbegin-cashflowperiodbeginpage-cashflowheader cborder"}}',
						children: [{
							name: 'date',
							component: '::div',
							className: 'ttk-gl-app-finance-periodbegin-cashflowperiodbeginpage-cashflowheader-enabledPeriodChange',
							children: [{
								name: 'dateName',
								component: '::span',
								children: '启用期间',
								style: { fontSize: '12px' }
							}, {
								name: 'date',
								component: 'DatePicker.MonthPicker',
								allowClear: false,
								placeholder: '',
								className: 'ttk-gl-app-finance-periodbegin-cashflowperiodbeginpage-cashflowheader-datepicker',
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
								overlayClassName: 'ttk-gl-app-finance-periodbegin-helpPopover',
								children: {
									name: 'helpIcon',
									component: 'Icon',
									fontFamily: 'edficon',
									type: 'bangzhutishi',
									className: 'helpIcon'
								}
							}]
						}, {
							name: 'resetCashFlowPeriodBegin',
							component: 'Button',
							children: '重置',
							_visible: '{{$isShowResetBtn("reset")}}',
							style: { height: '30px', marginLeft: '8px', lineHeight: '30px' },
							onClick: "{{$resetCashFlowPeriodBegin}}"
						}
						]
					}, {
						name: 'doubleRowContent',
						className: '{{ data.other.isShowBtn ? "ttk-gl-app-finance-periodbegin-cashflowperiodbeginpage-cashflowcontent" : "ttk-gl-app-finance-periodbegin-cashflowperiodbeginpage-cashflowcontent cborder"}}',
						id: 'ttk-gl-app-finance-periodbegin-cashflowperiodbeginpage-cashflowcontent-id',
						component: '::div',
						children: [{
							name: 'report2',
							pagination: false,
							className: '{{$getTableClassName()}}',
							component: 'Table',
							emptyShowScroll: true,
							pagination: false,
							scroll: '{{ {y: data.other.cashFlwoScrollY, x:data.other.scrollX} }}',
							allowColResize: false,
							enableSequenceColumn: false,
							bordered: true,
							dataSource: '{{data.cashflowlist}}',
							columns: cashflowPeriodGridColumns,
							loading: '{{data.other.isLoading}}'
						}]
					}
				]
			},
			{
				name: 'footer1',
				className: 'ttk-gl-app-finance-periodbegin-pagination',
				component: '::div',
				id: 'ttk-gl-app-finance-periodbegin-pagination',
				_visible: '{{data.other.accountFlowBalancePageSwitch == 1001}}',
				children: [{
					name: 'pagination',
					component: 'Pagination',
					pageSizeOptions: ['300', '500'],
					pageSize: '{{data.pagination.pageSize}}',
					current: '{{data.pagination.currentPage}}',
					total: '{{data.pagination.totalCount}}',
					onChange: '{{$pageChanged}}',
					onShowSizeChange: '{{$sizePageChanged}}'
				}]
			},
		 {
				name: 'foot', //财务期初 上一步 下一步
				component: '::div',
				className: '',
				className: '{{ data.other.isShowBtn ? "ttk-gl-app-finance-periodbegin-footer" : "footervisible"}}',
				children: [{
					component: 'Button',
					children: '上一步',
					className: 'ttk-gl-app-finance-periodbegin-footer-btn preStepBtn',
					onClick: '{{$preStep}}'
				}, {
					component: 'Button',
					children: '完成',
					type: 'primary',
					className: 'ttk-gl-app-finance-periodbegin-footer-btn nextStepBtn',
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
					target: '.ttk-gl-app-finance-periodbegin-header-left-year-enabledPeriodChange',
					content: ['在这里可调整', {
						name: 'span',
						component: '::span',
						className: 'ttk-rc-intro-style',
						children: '启用期间'
					}],
					placement: 'right',
					disableBeacon: true,
				}, {
					target: '.ttk-gl-app-finance-periodbegin-header-right-export',
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
		width: '6%',
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
	},
	{
		width: '15%',
		align: 'center',
		title: '期初借方余额',
		key: 'beginAmountDr',
		align: 'center',
		name: 'beginAmountDr',
		dataIndex: 'beginAmountDr',
		render: "{{function(_rowIndex, v, index){return $renderColumns('beginAmountDr', v, _ctrlPath, index)}}}"
	},
	{
		width: '15%',
		align: 'center',
		title: '期初贷方余额',
		align: 'center',
		key: 'beginAmountCr',
		name: 'beginAmountCr',
		dataIndex: 'beginAmountCr',
		render: "{{function(_rowIndex, v, index){return $renderColumns('beginAmountCr', v, _ctrlPath, index)}}}"
	},
	{
		width: '15%',
		// align: 'right',
		title: '本年借方累计',
		key: 'amountDr',
		name: 'quantityCurYearDr.amountDr',
		dataIndex: 'amountDr',
		_visible: "{{data.other.enabledMonth == '1' ? false : true}}",
		render: "{{function(_rowIndex, v, index){return $renderColumns('amountDr', v, _ctrlPath, index)}}}"
	}, {
		width: '15%',
		// align: 'right',
		title: '本年贷方累计',
		key: 'amountCr',
		name: 'quantityCurYearCr.amountCr',
		dataIndex: 'amountCr',
		_visible: "{{data.other.enabledMonth == '1' ? false : true}}",
		render: "{{function(_rowIndex, v, index){return $renderColumns('amountCr', v, _ctrlPath, index)}}}"
	},
	{
		width: '15%',
		// align: 'right',
		title: '年初借方余额',
		key: 'yearBeginAmountDr',
		name: 'yearBeginAmountDr',
		dataIndex: 'yearBeginAmountDr',
		_visible: "{{data.other.enabledMonth == '1' ? false : true}}",
		render: "{{function(_rowIndex, v, index){return $renderSpan('yearBeginAmountDr', _rowIndex)}}}"
	},
	{
		width: '15%',
		// align: 'right',
		title: '年初贷方余额',
		key: 'yearBeginAmountCr',
		name: 'yearBeginAmountCr',
		_visible: "{{data.other.enabledMonth == '1' ? false : true}}",
		dataIndex: 'yearBeginAmountCr',
		render: "{{function(_rowIndex, v, index){return $renderSpan('yearBeginAmountCr', _rowIndex)}}}"
	},
	{
		title: '操作',
		key: 'voucherState',
		align: 'center',
		// fixed: 'right',
		className: 'table_fixed_width',
		// _visible: '{{!!data.other.isDisplayOperation}}', // 年份下拉选去掉操作不在受控制
		width: '60px',
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
		width: '15%',
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
	},
	{
		title: '期初借方余额',
		// key: 'beginBalance',
		// dataIndex: 'beginBalance',
		width: '20%',
		children: [{
			width: '20%',
			title: '数量',
			key: 'beginQuantityDr',
			dataIndex: 'beginQuantityDr',
			_visible: '{{!data.other.isDisplayOnlyAmount && data.filter.isCalcQuantity}}',
			render: "{{function(_rowIndex, v, index){return $renderColumns('beginQuantityDr', v, _ctrlPath, index)}}}"
		}, {
			width: '20%',
			title: '外币金额',
			key: 'beginOrigAmountDr',
			// align: 'right',
			dataIndex: 'beginOrigAmountDr',
			_visible: '{{!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti}}',
			render: "{{function(_rowIndex, v, index){return $renderColumns('beginOrigAmountDr', v, _ctrlPath, index)}}}"
		}, {
			width: '20%',
			title: "{{(!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti) ? '本位币金额' : '金额'}}",
			key: 'beginAmountDr',
			// align: 'right',
			dataIndex: 'beginAmountDr',
			render: "{{function(_rowIndex, v, index){return $renderColumns('beginAmountDr', v, _ctrlPath, index)}}}"
		}]
	},
	{
		title: '期初贷方余额',
		// key: 'beginBalance',
		// dataIndex: 'beginBalance',
		width: '20%',
		children: [{
			width: '20%',
			title: '数量',
			key: 'beginQuantityCr',
			dataIndex: 'beginQuantityCr',
			_visible: '{{!data.other.isDisplayOnlyAmount && data.filter.isCalcQuantity}}',
			render: "{{function(_rowIndex, v, index){return $renderColumns('beginQuantityCr', v, _ctrlPath, index)}}}"
		}, {
			width: '20%',
			title: '外币金额',
			key: 'beginOrigAmountCr',
			// align: 'right',
			dataIndex: 'beginOrigAmountCr',
			_visible: '{{!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti}}',
			render: "{{function(_rowIndex, v, index){return $renderColumns('beginOrigAmountCr', v, _ctrlPath, index)}}}"
		}, {
			width: '20%',
			title: "{{(!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti) ? '本位币金额' : '金额'}}",
			key: 'beginAmountCr',
			// align: 'right',
			dataIndex: 'beginAmountCr',
			render: "{{function(_rowIndex, v, index){return $renderColumns('beginAmountCr', v, _ctrlPath, index)}}}"
		}]
	},
	{
		title: '本年借方累计',
		// key: 'quantityCurYearDr',
		// dataIndex: 'quantityCurYearDr',
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
			// align: 'right',
			dataIndex: 'origAmountDr',
			_visible: '{{!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti}}',
			render: "{{function(_rowIndex, v, index){return $renderColumns('origAmountDr', v, _ctrlPath, index)}}}"
		}, {
			width: '20%',
			title: "{{(!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti) ? '本位币金额' : '金额'}}",
			key: 'amountDr',
			// align: 'right',
			dataIndex: 'amountDr',
			render: "{{function(_rowIndex, v, index){return $renderColumns('amountDr', v, _ctrlPath, index)}}}"
		}]
	},
	{
		title: '本年贷方累计',
		// key: 'quantityCurYearCr',
		// dataIndex: 'quantityCurYearCr',
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
			// align: 'right',
			dataIndex: 'origAmountCr',
			_visible: '{{!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti}}',
			render: "{{function(_rowIndex, v, index){return $renderColumns('origAmountCr', v, _ctrlPath, index)}}}"
		}, {
			width: '20%',
			title: "{{(!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti) ? '本位币金额' : '金额'}}",
			key: 'amountCr',
			// align: 'right',
			dataIndex: 'amountCr',
			render: "{{function(_rowIndex, v, index){return $renderColumns('amountCr', v, _ctrlPath, index)}}}"
		}]
	},
	{
		title: '年初借方余额',
		// key: 'yearBeginBalance',
		// dataIndex: 'yearBeginBalance',
		_visible: '{{data.other.isNotJanuary}}',
		width: '20%',
		children: [{
			width: '20%',
			title: '数量',
			key: 'yearBeginQuantityDr',
			dataIndex: 'yearBeginQuantityDr',
			_visible: '{{!data.other.isDisplayOnlyAmount && data.filter.isCalcQuantity}}',
			render: "{{function(_rowIndex, v, index){return $renderSpan('yearBeginQuantityDr', _rowIndex)}}}"
		}, {
			width: '20%',
			title: '外币金额',
			// align: 'right',
			key: 'yearBeginOrigAmountDr',
			dataIndex: 'yearBeginOrigAmountDr',
			_visible: '{{!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti}}',
			render: "{{function(_rowIndex, v, index){return $renderSpan('yearBeginOrigAmountDr', _rowIndex)}}}"
		}, {
			width: '20%',
			title: "{{(!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti) ? '本位币金额' : '金额'}}",
			key: 'yearBeginAmountDr',
			// align: 'right',
			dataIndex: 'yearBeginAmountDr',
			render: "{{function(_rowIndex, v, index){return $renderSpan('yearBeginAmountDr', _rowIndex)}}}"
		}]
	},
	{
		title: '年初贷方余额',
		// key: 'yearBeginBalance',
		// dataIndex: 'yearBeginBalance',
		_visible: '{{data.other.isNotJanuary}}',
		width: '20%',
		children: [{
			width: '20%',
			title: '数量',
			key: 'yearBeginQuantityCr',
			dataIndex: 'yearBeginQuantityCr',
			_visible: '{{!data.other.isDisplayOnlyAmount && data.filter.isCalcQuantity}}',
			render: "{{function(_rowIndex, v, index){return $renderSpan('yearBeginQuantityCr', _rowIndex)}}}"
		}, {
			width: '20%',
			title: '外币金额',
			key: 'yearBeginOrigAmountCr',
			// align: 'right',
			dataIndex: 'yearBeginOrigAmountCr',
			_visible: '{{!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti}}',
			render: "{{function(_rowIndex, v, index){return $renderSpan('yearBeginOrigAmountCr', _rowIndex)}}}"
		}, {
			width: '20%',
			title: "{{(!data.other.isDisplayOnlyAmount && data.filter.isCalcMulti) ? '本位币金额' : '金额'}}",
			key: 'yearBeginAmountCr',
			// align: 'right',
			dataIndex: 'yearBeginAmountCr',
			render: "{{function(_rowIndex, v, index){return $renderSpan('yearBeginAmountCr', _rowIndex)}}}"
		}]
	},
	{
		width: '60px',
		title: '操作',
		key: 'voucherState',
		fixed: '{{!data.other.isNotJanuary ? "" : "right"}}',
		align: 'center',
		className: 'table_fixed_width',
		// _visible: '{{!!data.other.isDisplayOperation}}', // 年份下拉选去掉操作不在受控制
		render: "{{function(record, v, index){return $operateCol(record, index)}}}"
	}
]

export const cashflowPeriodGridColumns = [
	{
		width: '57%',
		title: '项目',
		dataIndex: 'name',
		key: 'name',
	}, {
		width: '10%',
		title: '行次',
		key: 'accountName',
		dataIndex: 'rowNo',
	},
	{
		title: '金额',
		key: 'amount',
		dataIndex: 'amount',
		width: '33%',
		render: "{{function(_rowIndex, v, index){return $renderCashFlowPBColumns('amount', v, _ctrlPath, index)}}}"
	},
]

export function getInitState() {
	return {
		data: {
			tableOption: {
					x: 1000,
					y: 400,
					h: 123,
					class: 'ttk-gl-app-finance-periodbegin-accountperiodbeginpage'
			},
			list: [],
			filter: {
				targetKey: '5000010001',
				isCalcQuantity: false,
				isCalcMulti: false,
				isNullData: false
			},
			pagination: {
				currentPage: 1,
				totalCount: 0,
				pageSize: 300,
				totalPage: 0
			},
			other: {
				// scrollX: 1400,
				isBalancePopShow: true,
				yearList: [],
				isNoDispose: true,
				amountTipShow: true,
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
				scrollY: 200,
				scrollX: 1300,
				haveMonthlyClosing: false, //是否月结
				accountingStandards: true, //是否为小企业会计准则
				ts: undefined,
				customAttribute: 0,
				stepEnabled: false,
				isShowBtn: false,
				stepRandom: Math.random(),
				cashflowDisabled: true,
				accountFlowBalancePageSwitch: PERIODBEGIN_ACCOUNTPERIODBEGIN,
				cashFlwoScrollY: 400,
				columnDto: [
					{
						caption: "编码",
					colIndex: 1,
					columnId: 500002,
					customDecideVisible: true,
					fieldName: "accountCode",
					id: 50000200001,
					idAlignType: 1000050001,
					idFieldType: 1000040001,
					idOrderMode: 1000060001,
					isFixed: false,
					isHeader: false,
					isMustSelect: false,
					isOrderMode: false,
					isSystem: false,
					isTotalColumn: false,
					isVisible: false,
					width: 78
					},
					{
						caption: "名称",
						colIndex: 2,
						columnId: 500002,
						customDecideVisible: true,
						fieldName: "accountName",
						id: 50000200002,
						idAlignType: 1000050001,
						idFieldType: 1000040001,
						idOrderMode: 1000060001,
						isFixed: false,
						isHeader: false,
						isMustSelect: false,
						isOrderMode: false,
						isSystem: false,
						isTotalColumn: false,
						isVisible: false,
						width: 258
					},
					{
						caption: "方向",
						colIndex: 3,
						columnId: 500002,
						customDecideVisible: true,
						fieldName: "directionName",
						id: 50000200003,
						idAlignType: 1000050001,
						idFieldType: 1000040001,
						idOrderMode: 1000060001,
						isFixed: false,
						isHeader: false,
						isMustSelect: false,
						isOrderMode: false,
						isSystem: false,
						isTotalColumn: false,
						isVisible: false,
						width: 42
					},
					{
						caption: "期初借方余额",
						colIndex: 4,
						columnId: 500002,
						customDecideVisible: true,
						fieldName: "beginAmountDr",
						id: 50000200004,
						idAlignType: 1000050003,
						idFieldType: 1000040002,
						idOrderMode: 1000060001,
						isFixed: false,
						isHeader: false,
						isMustSelect: false,
						isOrderMode: false,
						isSystem: false,
						isTotalColumn: false,
						isVisible: false,
						width: 126,
					},
					{
						caption: "期初贷方余额",
						colIndex: 5,
						columnId: 500002,
						customDecideVisible: true,
						fieldName: "beginAmountCr",
						id: 50000200005,
						idAlignType: 1000050003,
						idFieldType: 1000040002,
						idOrderMode: 1000060001,
						isFixed: false,
						isHeader: false,
						isMustSelect: false,
						isOrderMode: false,
						isSystem: false,
						isTotalColumn: false,
						isVisible: false,
						width: 126,
					},
					{
						caption: "本年借方累计",
						colIndex: 6,
						columnId: 500002,
						customDecideVisible: true,
						fieldName: "amountDr",
						id: 50000200006,
						idAlignType: 1000050003,
						idFieldType: 1000040002,
						idOrderMode: 1000060001,
						isFixed: false,
						isHeader: false,
						isMustSelect: false,
						isOrderMode: false,
						isSystem: false,
						isTotalColumn: false,
						isVisible: false,
						width: 126,
					},
					{
						caption: "本年贷方累计",
						colIndex: 7,
						columnId: 500002,
						customDecideVisible: true,
						fieldName: "amountCr",
						id: 50000200007,
						idAlignType: 1000050003,
						idFieldType: 1000040002,
						idOrderMode: 1000060001,
						isFixed: false,
						isHeader: false,
						isMustSelect: false,
						isOrderMode: false,
						isSystem: false,
						isTotalColumn: false,
						isVisible: false,
						width: 126
					},
					{
						caption: "年初借方余额",
						colIndex: 8,
						columnId: 500002,
						customDecideVisible: true,
						fieldName: "yearBeginAmountDr",
						id: 50000200008,
						idAlignType: 1000050003,
						idFieldType: 1000040002,
						idOrderMode: 1000060001,
						isFixed: false,
						isHeader: false,
						isMustSelect: false,
						isOrderMode: false,
						isSystem: false,
						isTotalColumn: false,
						isVisible: false,
						width: 126
					},
					{
						caption: "年初贷方余额",
						colIndex: 9,
						columnId: 500002,
						customDecideVisible: true,
						fieldName: "yearBeginAmountCr",
						id: 50000200009,
						idAlignType: 1000050003,
						idFieldType: 1000040002,
						idOrderMode: 1000060001,
						isFixed: false,
						isHeader: false,
						isMustSelect: false,
						isOrderMode: false,
						isSystem: false,
						isTotalColumn: false,
						isVisible: false,
						width: 126
					}
				],
				matchIndex: -1,
				matchBacktoZero: true
			},
			cashflowperiod: '',    //现金流量期初
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
		return num
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
export const ACCOUNTTYPE_NETASSETS = 5000010007  					//净资产
export const ACCOUNTTYPE_INCOME = 5000010008  						//收入
export const ACCOUNTTYPE_EXPENSES = 5000010009  			    //费用

export const PERIODBEGIN_ACCOUNTPERIODBEGIN = 1001				//科目期初
export const PERIODBEGIN_CASHFLOWPERIODBEGIN = 1002				//现金流量表期初
