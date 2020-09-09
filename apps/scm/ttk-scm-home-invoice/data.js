export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-home-invoice',
		children: [{
			name: 'top',
			component: 'Layout',
			// className: 'edfx-app-hot-search-widget-top',
			children: [{
				name: 'header',
				component: 'Layout',
				className: 'ttk-scm-home-invoice-header',
				children: [{
					name: 'left',
					component: '::div',
					className: 'ttk-scm-home-invoice-header-left',
					children: [{
						name: 'left',
						component: '::span',
						children: '发票'
					}, {
						name: 'selectTime',
						component: '::div',
						className: 'edfx-app-home-voucher-header-left-select',
						children: {
							name: 'timeSelect',
							className: '',
							component: 'Select',
							showSearch: false,
							value: '{{data.period?data.period:data.periodList[0]}}',
							dropdownClassName: 'selectDate',
							onSelect: '{{function(v){$setField("data.period",v)}}}',
							children: {
								name: 'option',
								component: 'Select.Option',
								children: '{{data.periodList && data.periodList[_rowIndex]}}',
								key: '{{data.periodList && data.periodList[_rowIndex]}}',
								_power: 'for in data.periodList'
							}
						}
					}]
				},
				{
					name: 'right',
					component: '::div',
					className: 'ttk-scm-home-invoice-header-right',
					children: {
						name: 'btn',
						component: 'Radio.Group',
						onChange: `{{function(v){$fieldChange('data.form.value',v.target.value)}}}`,
						// defaultValue:'0',
						children: [
							{
								name: 'button1',
								component: 'Radio.Button',
								className: '{{data.type == "chart"?"focusIcon":"unfocusIcon"}}',
								value: '0',
								children: {
									name: 'baobiao',
									component: 'Icon',
									fontFamily: 'edficon',
									type: 'baobiao',
									title: '图表',
									key: 'chart',
									onClick: '{{$getChart}}'
								},
							}, {
								name: 'button2',
								component: 'Radio.Button',
								className: '{{data.type == "table"?"focusIcon":"unfocusIcon"}}',
								value: '1',
								children: {
									name: 'table',
									component: 'Icon',
									fontFamily: 'edficon',
									type: 'biaoge',
									title: '列表',
									key: 'table',
									onClick: '{{$getTable}}'
								},
							},
							{
								name: 'refresh',
								component: 'Icon',
								fontFamily: 'edficon',
								className: 'refresh homeIcon',
								type: 'shuaxin',
								title: '刷新',
								onClick: '{{$refresh}}'
							},
							{
								name: '展开',
								component: 'Icon',
								fontFamily: 'edficon',
								className: 'unfold homeIcon',
								type: '{{data.fold ? "shouhui" : "zhankai"}}',
								title: '{{data.fold ? "收回" : "展开"}}',
								onClick: '{{function(){$fold("business")}}}'
							},
						]
					}
				}
				]
			}, {
				name: 'tabNav',
				component: 'Tabs',
				onChange: '{{function(){$changeTab()}}}',
				children: [{
					name: "option",
					component: 'Tabs.TabPane',
					tab: [{
						name: 'tab',
						component: '::div',
						children: "{{ data.other.businessArr && data.other.businessArr[_rowIndex].name }}",
					}],
					key: "{{ data.other.businessArr && data.other.businessArr[_rowIndex].id }}",
					_power: 'for in data.other.businessArr'
				}]
			}, {
				name: 'spin',
				component: 'Spin',
				tip: '数据加载中...',
				spinning: '{{data.loading}}',
				children: [{
					name: 'text',
					component: '::div',
					className: 'ttk-scm-home-invoice-text',
					_visible: '{{data.form.textDisplay}}',
					children: [{
						name: 'span',
						component: '::span',
						className: 'ttk-scm-home-invoice-span',
						children: [
							'预估税负率:', {
								name: 'code',
								component: '::span',
								className: 'code',
								children: "{{data.form.estimatedNegativeRate}}",
								title: "{{data.form.estimatedNegativeRate}}",
							}, {
								name: 'popover',
								component: 'Popover',
								content: '{{$getPopoverContent()}}',
								// content: '小规模纳税人：税负率 = 销项税额/销售收入',
								placement: 'rightTop',
								overlayClassName: 'helpPopover',
								overlayClassName: 'ttk-scm-home-invoice-helpPopover',
								children: {
									name: 'icon',
									component: 'Icon',
									fontFamily: 'edficon',
									type: 'bangzhutishi',
								}
							}
						]
					},
					{
						name: 'span',
						component: '::span',
						className: 'ttk-scm-home-invoice-span',
						children: [
							'应交增值税:', {
								name: 'code',
								component: '::span',
								className: 'code',
								children: "{{data.form.estimatedStressAddTax}}",
								title: "{{data.form.estimatedStressAddTax}}",
							}, '元',
						]
					},
					{
						name: 'span',
						component: '::span',
						className: 'ttk-scm-home-invoice-span',
						_visible: '{{data.form.code=="arrival" ? data.vatTaxpayer != data.smallScaleTaxPayer : true}}',
						children: [
							{
								name: 'word',
								component: '::span',
								children: '{{ data.vatTaxpayer != data.smallScaleTaxPayer && data.form.code=="arrival" ? "已抵扣税额:" : "销项税额:"}}'
							}, {
								name: 'code',
								component: '::span',
								className: 'code',
								children: "{{data.form.taxTotal ? data.form.taxTotal : 0}}",
								title: "{{data.form.taxTotal ? data.form.taxTotal : 0}}",
							}, '元'
						]
					}, {
						name: 'bottom',
						component: '::span',
						className: 'ttk-scm-home-invoice-span',
						_visible: '{{data.form.code=="arrival" ? (data.form.textDisplay !==false && (data.vatTaxpayer == data.smallScaleTaxPayer)) : false }}',
						//_visible: '{{data.vatTaxpayer == data.smallScaleTaxPayer}}',
						children: [
							'价税合计:', {
								name: 'bottom',
								component: '::span',
								className: 'bottom',
								children: "{{data.form.taxInclusiveAmountTotal}}",
							}, '元'
						]
					}
					]
				}, {
					name: 'text1',
					component: '::div',
					className: 'ttk-scm-home-invoice-text1',
					_visible: '{{data.form.textDisplay}}',
					children: [{
						name: 'span',
						component: '::span',
						_visible: '{{data.form.sflDisplay}}',
						className: 'ttk-scm-home-invoice-span',
						children: [
							'行业税负率:', {
								name: 'code',
								component: '::span',
								className: 'code',
								children: "{{data.form.sfl}}",
								title: "{{data.form.sfl}}",
							},
						]
					}, {
						name: 'bottom1',
						component: '::span',
						className: 'ttk-scm-home-invoice-span',
						_visible: '{{data.form.code=="arrival" ? (data.form.textDisplay !==false && (data.vatTaxpayer != data.smallScaleTaxPayer)) : data.form.textDisplay !==false}}',
						//_visible: '{{data.vatTaxpayer != data.smallScaleTaxPayer}}',
						children: [
							'价税合计:', {
								name: 'bottom',
								component: '::span',
								className: 'bottom1',
								children: "{{data.form.taxInclusiveAmountTotal}}",
							}, '元'
						]
					}]
				}, {
					name: 'center',
					component: '::div',
					className: 'ttk-scm-home-invoice-center',
					children: [
						{
							name: 'content',
							component: '::div',
							className: 'ttk-scm-home-invoice-content',
							key: '{{data.mathRandom}}',
							children: '{{$getContent()}}'
						}
					]
				}]
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			fold: "",
			periodList: [],
			loading: false,
			mathRandom: 0,
			type: 'chart',
			form: {
				value: '0',
				invoiceSum: 0,
				taxTotal: 0,
				taxInclusiveAmountTotal: 0,
				estimatedNegativeRate: '0%',
				estimatedStressAddTax: 0,
				sfl: '--',
				sflDisplay: true,
			},
			keys: [],
			other: {
				mathRandom: Math.random(),
				action: 'out',
				emptyData: true,
				businessArr: [
					{
						"id": 2001001, "code": "2001001", "name": "销项"
					},
					{
						"id": 3001002, "code": "3001002", "name": "进项"
					},
				],
			}
		}
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
export function clearThousandsPosition(num) {
	if (num && num.toString().indexOf(',') > -1) {
		let x = num.toString().split(',')
		return parseFloat(x.join(""))
	} else {
		return num
	}
}