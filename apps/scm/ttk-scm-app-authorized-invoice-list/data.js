export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-authorized-invoice-list',
		children: [
			{
				name: 'header',
				component: '::div',
				className: 'ttk-scm-app-authorized-invoice-list-header',
				children: [
					{
						name: 'row1',
						component: '::div',
						className: 'ttk-scm-app-authorized-invoice-list-header-item1',
						children: [
							{
								name: 'left',
								component: '::div',
								className: 'ttk-scm-app-authorized-invoice-list-header-item1-left',
								children: [
									{
										name: 'datelabel',
										component: '::div',
										style: {
											width: 54,
											fontSize: 12
										},
										children: '开票日期'
									},
									{
										name: 'beginInvoiceDate',
										component: 'DatePicker',
										onChange: '{{$beginInvoiceDateOnChange}}',
										value: '{{data.searchValue.beginInvoiceDate}}',
										//disabledDate: '{{$disabledStartDate}}',
										onOpenChange: '{{$handleStartOpenChange}}',
										className: 'ttk-scm-app-authorized-invoice-list-header-item1-left-datepicker',
									},
									{
										name: 'spacer',
										component: '::div',
										style: {
											padding: '0 3px'
										},
										children: '-'
									},
									{
										name: 'endInvoiceDate',
										component: 'DatePicker',
										open: '{{data.other.endOpen}}',
										onChange: '{{$endInvoiceDateOnChange}}',
										value: '{{data.searchValue.endInvoiceDate}}',
										disabledDate: '{{$disabledendInvoiceDate}}',
										onOpenChange: '{{$handleEndOpenChange}}',
										className: 'ttk-scm-app-authorized-invoice-list-header-item1-left-datepicker',
									},
									{
										name: 'refreshBtn',
										component: 'Icon',
										fontFamily: 'edficon',
										type: 'shuaxin',
										title: '刷新',
										className: 'mk-normalsearch-reload',
										onClick: '{{function(){$request()}}}'
									}
								]
							},
							{
								name: 'right',
								component: '::div',
								className: 'ttk-scm-app-authorized-invoice-list-header-item1-right',
								children: [
									{
										name: 'send',
										component: 'Button',
										className: 'ttk-scm-app-authorized-invoice-list-header-item1-left-button',
										//type: 'primary',
										onClick: '{{$oneKeyCollectClick}}',
										children: '采集发票'
									},
									{
										name: 'send',
										component: 'Button',
										className: 'ttk-scm-app-authorized-invoice-list-header-item1-left-button',
										type: 'primary',
										onClick: '{{$handleConfirmSend}}',
										children: '发送认证'
									},
									{
										name: 'update',
										component: 'Button',
										className: 'ttk-scm-app-authorized-invoice-list-header-item1-left-button',
										onClick: '{{$refreshResult}}',
										loading: '{{data.iconLoading}}',
										children: '更新认证状态'
									},
									{
										name: 'dropdown',
										component: 'Dropdown',
										//className: 'ttk-scm-app-authorized-invoice-list-header-item1-left-button',
										overlay: {
											name: 'menu',
											component: 'Menu',
											onClick: '{{$handleMoreOpeate}}',
											children: [
												// {
												// 	name: 'oneKeyCollectClick',
												// 	component: 'Menu.Item',
												// 	className: 'app-asset-list-disposal',
												// 	key: 'oneKeyCollectClick',
												// 	children: '采集发票',
												// },
												{
													name: 'downloadPdf4Rz',
													component: 'Menu.Item',
													className: "app-asset-list-disposal",
													key: 'downloadPdf4Rz',
													children: '下载认证结果'
												},
												{
													name: 'importKey',
													component: 'Menu.Item',
													className: "app-asset-list-disposal",
													key: 'importKey',
													children: '设置密钥'
												}
											]
										},
										children: {
											name: 'internal',
											component: 'Button',
											//className: 'ttk-scm-app-authorized-invoice-list-header-item1-left-button',
											children: [
												{
													name: 'word',
													component: '::span',
													children: '更多'
												},
												{
													name: 'more',
													component: 'Icon',
													type: 'down'
												}
											]
										}
									},
								]
							}

						]
					},
					{
						name: 'row2',
						component: '::div',
						className: 'ttk-scm-app-authorized-invoice-list-header-item2',
						children: {
							name: 'row1',
							component: '::div',
							className: 'ttk-scm-app-authorized-invoice-list-header-item2-row',
							children: [
								{
									name: 'period',
									component: '::div',
									className: 'ttk-scm-app-authorized-invoice-list-header-item2-row-item',
									children: [
										{
											name: 'lable',
											component: '::span',
											className: 'ttk-scm-app-authorized-invoice-list-header-item2-row-item-label',
											children: '当月销项税额'
										},
										{
											name: 'value',
											component: '::span',
											className: 'ttk-scm-app-authorized-invoice-list-header-item2-row-item-value',
											children: '{{data.cal.a}}'
										}
									]
								},
								{
									name: 'reduce',
									component: '::div',
									className: 'ttk-scm-app-authorized-invoice-list-header-item2-row-item-operator',
									children: '-'
								},
								{
									name: 'revenue',
									component: '::div',
									className: 'ttk-scm-app-authorized-invoice-list-header-item2-row-item',
									children: [
										{
											name: 'label',
											component: '::span',
											className: 'ttk-scm-app-authorized-invoice-list-header-item2-row-item-label',
											children: '当月销售收入'
										},
										{
											name: 'value',
											component: '::span',
											className: 'ttk-scm-app-authorized-invoice-list-header-item2-row-item-value',
											children: '{{data.cal.b}}'
										}
									],
								},
								{
									name: 'ride',
									component: '::div',
									className: 'ttk-scm-app-authorized-invoice-list-header-item2-row-item-operator',
									children: '×'
								},
								{
									name: 'burden',
									component: '::div',
									className: 'ttk-scm-app-authorized-invoice-list-header-item2-row-item',
									children: [
										{
											name: "label",
											component: '::span',
											className: 'ttk-scm-app-authorized-invoice-list-header-item2-row-item-label',
											style: {
												top: 35
											},
											children: '预估税负率'
										},
										{
											component: 'Input.AntNumber',
											onChange: '{{$handleChangeRate}}',
											onBlur: '{{$handleBlurRate}}',
											onFocus: '{{$handleFocusRate}}',
											value: '{{data.cal.c}}',
											precision: 2,
											formatter: '{{$antNubmerFromatter}}',
											parser: '{{$antNubmerParser}}',
											min: -999999999.99,
											max: 999999999.99,
											style: {
												height: '30px',
												lineHeight: '30px',
												fontSize: '14px',
												width: 100,
												textAlign: 'right'
											},
										}
									]
								},
								{
									name: 'percentsign',
									component: '::div',
									style: {
										height: '30px',
										lineHeight: '30px',
										marginLeft: '6px',
										fontSize: '14px'
									},
									children: '%'
								},
								{
									name: 'reducesign',
									component: '::div',
									className: 'ttk-scm-app-authorized-invoice-list-header-item2-row-item-operator',
									children: '-'
								},
								{
									name: 'retained',
									component: '::div',
									className: 'ttk-scm-app-authorized-invoice-list-header-item2-row-item',
									children: [
										{
											name: 'label',
											component: '::span',
											className: 'ttk-scm-app-authorized-invoice-list-header-item2-row-item-label',
											style: {
												top: 35
											},
											children: '上月留抵'
										},
										{
											name: 'value',
											component: 'Input.AntNumber',
											onChange: '{{$handleChangeRest}}',
											onFocus: '{{$handleFocusRest}}',
											onBlur: '{{$handleBlurRest}}',
											precision: 2,
											min: 0,
											minValue: 0,
											value: '{{data.cal.d}}',
											formatter: '{{$antNubmerFromatter}}',
											parser: '{{$antNubmerParser}}',
											style: {
												width: 108,
												height: '30px',
												lineHeight: '30px',
												fontSize: '14px',
												textAlign: 'right'
											}
										}
									]
								},
								{
									name: 'equelsign',
									component: '::div',
									className: 'ttk-scm-app-authorized-invoice-list-header-item2-row-item-operator',
									children: '='
								},
								{
									name: 'currentperiod',
									component: '::div',
									className: 'ttk-scm-app-authorized-invoice-list-header-item2-row-item',
									children: [
										{
											name: 'label',
											component: '::span',
											className: 'ttk-scm-app-authorized-invoice-list-header-item2-row-item-label',
											children: '当月建议认证进项税额',
											style:{
												width:130
											}
										},
										{
											name: 'value',
											component: '::span',
											className: 'ttk-scm-app-authorized-invoice-list-header-item2-row-item-value',
											children: [
												{
													name: 'a',
													component: '::span',
													children: '{{data.cal.r}}'
												},
												{
													name: 'b',
													component: '::span',
													style:{
														color:'red',
														marginLeft:2
													},
													children: '(当月已认证税额：'
												},
												{
													name: 'c',
													component: '::span',
													style:{
														color:'red',
													},
													children: ' {{data.cal.authenticatedTax}}'
												},
												{
													name: 'd',
													component: '::span',
													style:{
														color:'red',
													},
													children: ')'
												}
											]
										},
										{
											name: 'popover',
											component: 'Popover',
											content: '按预估税负率建议当期待认证的发票',
											placement: 'rightTop',
											overlayClassName: 'ttk-scm-app-authorized-invoice-list-helpPopover',
											children: {
												name: 'icon',
												component: 'Icon',
												fontFamily: 'edficon',
												type: 'bangzhutishi',
												className: 'helpIcon'
											}
										},
									]
								}
							]
						},
					},
					{
						name: 'row3',
						component: '::div',
						className: 'ttk-scm-app-authorized-invoice-list-header-item3',
						children: [
							{
								name: 'invoicenum',
								component: '::div',
								className: 'ttk-scm-app-authorized-invoice-list-header-item3-row',
								children: [
									{
										name: 'label',
										component: '::div',
										className: 'ttk-scm-app-authorized-invoice-list-header-item3-row-label',
										children: '发票号码',
									},
									{
										name: 'value',
										component: 'Input.Search',
										placeholder: '按发票号码查询',
										className: 'ttk-scm-app-authorized-invoice-list-header-item3-row-value',
										value: '{{data.searchValue.invoiceNumber}}',
										onChange: '{{function(v){$handleSearchValueChange(v,"invoiceNumber")}}}',
										onBlur: '{{function(){$request()}}}',
										onSearch: '{{function(){$request()}}}'
									},
								]
							},
							{
								name: 'invoicecode',
								component: '::div',
								className: 'ttk-scm-app-authorized-invoice-list-header-item3-row',
								children: [
									{
										name: 'label',
										component: '::div',
										className: 'ttk-scm-app-authorized-invoice-list-header-item3-row-label',
										children: '发票代码'
									},
									{
										name: 'value',
										component: 'Input.Search',
										placeholder: '按发票代码查询',
										className: 'ttk-scm-app-authorized-invoice-list-header-item3-row-value',
										value: '{{data.searchValue.invoiceCode}}',
										onChange: '{{function(v){$handleSearchValueChange(v,"invoiceCode")}}}',
										onBlur: '{{function(){$request()}}}',
										onSearch: '{{function(){$request()}}}'
									},
								]
							},
							{
								name: 'suppliername',
								component: '::div',
								className: 'ttk-scm-app-authorized-invoice-list-header-item3-row',
								children: [
									{
										name: 'label',
										component: '::div',
										className: 'ttk-scm-app-authorized-invoice-list-header-item3-row-label',
										children: '销方名称'
									},
									{
										name: 'value',
										component: 'Input.Search',
										placeholder: '按销方名称查询',
										className: 'ttk-scm-app-authorized-invoice-list-header-item3-row-value',
										value: '{{data.searchValue.supplierName}}',
										onChange: '{{function(v){$handleSearchValueChange(v,"supplierName")}}}',
										onBlur: '{{function(){$request()}}}',
										onSearch: '{{function(){$request()}}}'
									},
								]
							},
						]
					},
					{
						name: 'row4',
						component: '::div',
						className: 'ttk-scm-app-authorized-invoice-list-header-item4',
						children: [
							{
								name: 'left',
								component: '::div',
								className: 'ttk-scm-app-authorized-invoice-list-header-item4-left',
								children: [
									{
										name: 'status',
										component: '::div',
										style: {
											fontSize: 12,
											width: 54
										},
										children: '认证状态',
									},
									{
										name: 'statusgroup',
										component: 'Radio.Group',
										onChange: '{{function(v){$handleSearchValueChange(v,"authenticated")}}}',
										value: '{{data.searchValue.authenticated}}',
										children: [
											{
												name: 'all',
												component: 'Radio',
												key: 'all',
												value: null,
												children: '全部'
											},
											{
												name: 'not',
												component: 'Radio',
												key: 'not',
												value: false,
												children: '未认证'
											},
											{
												name: 'allright',
												component: 'Radio',
												key: 'allright',
												value: true,
												children: '已认证'
											}
										]
									},
									{

										name: 'checkbox',
										component: 'Checkbox',
										checked: '{{data.other.onlyShowSelected}}',
										style: { marginLeft: 16, fontSize: 12, color: '#333333' },
										onClick: '{{$handleOnlyShowSelected}}',
										children: '只显示本次选中的发票'
									}
								]
							},
							{
								name: 'right',
								component: '::div',
								className: 'ttk-scm-app-authorized-invoice-list-header-item4-right',
								_visible: '{{data.statistics.count>0}}',
								children: [
									{
										name: 'numlabel',
										component: '::div',
										children: '份数：'
									},
									{
										name: 'numvalue',
										component: '::div',
										style: {
											color: 'red'
										},
										children: '{{data.statistics.count}}'
									},
									{
										name: 'fen',
										component: '::div',
										style: {
											marginRight: 17,
											marginLeft: 3
										},
										children: '份'
									},
									{
										name: 'amountlabel',
										component: '::div',
										children: '金额：'
									},
									{
										name: 'amountvalue',
										component: '::div',
										style: {
											color: 'red'
										},
										children: '{{data.statistics.totalAmount}}'
									},
									{
										name: 'amountyuan',
										component: '::div',
										style: {
											marginRight: 17,
											marginLeft: 3
										},
										children: '元'
									},
									{
										name: 'taxlabel',
										component: '::div',
										children: '税额：',
									},
									{
										name: 'taxvalue',
										component: '::div',
										style: {
											color: 'red'
										},
										children: '{{data.statistics.totalTax}}'
									},
									{
										name: 'yuan',
										component: '::div',
										style: {
											marginLeft: 3
										},
										children: '元'
									},
								]
							}
						]
					}
				]
			},
			{
				name: 'table',
				component: 'Table',
				remberName: 'ttk-scm-app-authorized-invoice-list',
				className: 'ttk-scm-app-authorized-invoice-list-table',
				loading: '{{data.loading}}',
				key: '{{data.tableKey}}',
				checkboxKey: 'id',
				checkboxChange: '{{$checkboxChange}}',
				checkboxValue: '{{data.tableCheckbox.checkboxValue}}',
				pagination: false,
				scroll: '{{data.tableOption}}',
				bordered: true,
				rowClassName: '{{$renderRowClassName}}',
				dataSource: '{{data.list}}',
				columns: '{{$renderColumns()}}',
			},
			{
				name: 'footer',
				className: 'ttk-scm-app-authorized-invoice-list-footer',
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
			}
		]
	}
}

export function getInitState() {
	return {
		data: {
			loading: false,
			iconLoading: false,
			list: [],
			listAll: [],
			tableKey: 1000,
			tableOption: {},
			tableCheckbox: {
				checkboxValue: [],
				selectedOption: []
			},
			searchValue: {
				beginInvoiceDate: null,
				endInvoiceDate: null,
				authenticated: false
			},
			pagination: {
				pageSize: 20,
				currentPage: 1,
				totalCount: 0
			},
			other: {
				endOpen: false,
				onlyShowSelected: false
			},
			cal: {
				a: '0.00',
				b: '0.00',
				c: '0.00',
				d: '0.00',
				r: '0.00'
			},
			statistics: {
				count: 0,
				totalAmount: 0,
				totalTax: 0
			},
			sort: {
				authenticatedStatus: {
					order: null
				},
				invoiceDate: {
					order: 'asc'
				}
			}
		}
	}
}
