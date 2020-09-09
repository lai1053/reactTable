import moment from 'moment'
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-collect-result',
		children: [
			{
				component: '::div',
				className:'main',
				children: [
					{
						name: 'text',
						component: 'Layout',
						_visible: '{{data.flag}}',
						className: 'ttk-scm-app-collect-result-text',
						children: [{
							component: 'Layout',
							className: 'ttk-scm-app-collect-result-text1',
							children: ['发票份数:', {
								name: 'code',
								component: '::span',
								style: { marginLeft: 10, marginRight: 10},
								children: '{{data.form.allInvoiceSum}}',
							},'金额汇总:', {
								name: 'code',
								component: '::span',
								style: { marginLeft: 10, marginRight: 10},
								children: '{{data.form.allAmountTotal}}',
							},'税额汇总:', {
								name: 'code',
								component: '::span',
								style: { marginLeft: 10, marginRight: 10},
								children: '{{data.form.allTaxTotal}}',
							},'价税合计汇总:', {
								name: 'code',
								component: '::span',
								style: { marginLeft: 10, marginRight: 10},
								children: '{{data.form.allAmountAndTaxTotal}}',
							}]
						}]
					},
					{
						name: 'header',
						component: '::div',
						_visible: '{{data.dateVisible}}',
						className: 'ttk-scm-app-invoice-summary-headerContent',
						children: {
							name: 'header-content',
							component: '::div',
							className: 'ttk-scm-app-invoice-summary-header',
							children: [{
								name: 'date',
								component: 'DatePicker.MonthPicker',
								format: "YYYY-MM",
								allowClear: false,
								className: "mk-rangePicker",
								value: '{{data.date}}',
								onChange: '{{$dateChange}}',
								disabledDate: '{{$disabledRangePicker}}'
							}, {
								component: 'Icon',
								fontFamily: 'edficon',
								type: 'shuaxin',
								className: 'ttk-scm-app-invoice-summary-header-reload',
								onClick: '{{$refresh}}',
							}, {
								name: 'lblDocCount',
								component: 'Layout',
								className: 'ttk-scm-app-invoice-summary-header-label',
								children: null
							},
							{
								component: 'Icon',
								fontFamily: 'edficon',
								type: 'dayin',
								className: 'dayin',
								onClick: '{{$print}}',
								title: '打印'

							}, {
								component: 'Icon',
								fontFamily: 'edficon',
								className: 'daochu',
								type: 'daochu',
								title: '导出',
								onClick: '{{$export}}'
							}]
						}
					},
					{
						name:'total',
						component:'::div',
						_visible: '{{$isXgm()&&data.dateVisible}}',
						className:'ttk-scm-app-invoice-summary-totalContent',
						children:[
							{
							name:'span1',
							component:'::span',
							children:'{{"本月认证："+data.puArrivalAuthenticat.authenticatSum+"份"}}'
						},
						{
							name:'span2',
							component:'::span',
							children:'{{"已认证税额："+data.puArrivalAuthenticat.taxTotal+"元"}}'
						},
						{
							name:'span3',
							component:'::span',
							children:'{{"已认证金额："+data.puArrivalAuthenticat.amountTotal+"元"}}'
						},
						{
							name:'span4',
							component:'::span',
							children:'{{"已认证价税合计："+data.puArrivalAuthenticat.amountAndTaxTotal+"元"}}'
						}
					]
					},
					{
						name:'total',
						component:'::div',
						_visible: '{{data.crossCertificationNum!=undefined}}',
						className:'ttk-scm-app-invoice-summary-totalContent',
						children:'{{"本次采集"+data.invoiceSum+"张发票，其中"+data.crossCertificationNum+"张是跨月认证发票，将显示到认证月"}}'
					},
					{
						className:'{{data.vatOrEntry==0?"ttk-scm-app-collect-result-Body sa-collect-result":"ttk-scm-app-collect-result-Body pu-collect-result"}}',
						name: 'report',
						component: 'Table',
						key: '{{data.tableKey}}',
						remberName: 'ttk-scm-app-collect-result',
						loading: '{{data.loading}}',
						pagination: false,
						scroll: '{{data.list.length > 0 ? data.tableOption : undefined  }}',
						rowSelection: null,
						allowColResize: false,
						onChange: '{{$tableOnchange}}',
						noDelCheckbox: false,
						bordered: true,
						dataSource: '{{data.list}}',
						columns: '{{$renderColumns()}}',
						rowKey: "id", //主键
						rowClassName: '{{$renderRowClassName}}',
					}
				]
			}, {
				name: 'foot',
				component: '::div',
				style: {
					textAlign: 'center',
					padding: '10px 16px',
					height:51
				},
				children: {
					component: 'Button',
					type: 'primary',
					children: '关闭',
					onClick: '{{$onOk}}',
					style: {
						textAlign: 'center',
						width: 59.3,
                        height: 30,
					},
				}
			}
		]
	}
}

export function getInitState() {
	return {
		data: {
			list: [],
			form: {
				allInvoiceSum: 0,
				allAmountTotal: 0,
				allTaxTotal: 0,
				allAmountAndTaxTotal: 0,
			},
			flag: false,
			tableKey: 1000,
			tableOption: {
				x:0.01
			},
			loading: true,
			dateVisible: true,
			//date: moment().subtract(1, "months").startOf('month'),
			date:null,
			puArrivalAuthenticat:{
				
			}
		}
	}
}
