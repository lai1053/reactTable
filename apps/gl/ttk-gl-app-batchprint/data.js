export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-gl-app-batchprint',
		children: {
			name: 'spin',
			component: 'Spin',
			tip: "数据处理中...",
			spinning: '{{data.loading}}',
			children: [{

				name: 'header',
				component: '::div',
				className: 'header',
				children: [

					// 	{
					// 	name: 'printset',
					// 	component: 'Button',
					// 	children: '打印设置',
					// 	className: 'btn',
					// 	onClick: '{{$printSet}}'
					// }, 

					{
						name: 'batchPrint',
						component: 'Button',
						children: '批量打印',
						className: 'btn',
						type: 'primary',
						onClick: '{{$batchPrint}}'
					}, {
						name: 'batchPrint',
						component: 'Button',
						children: '批量导出',
						className: 'btn',
						type: 'primary',
						onClick: '{{$batchExport}}'
					}]
			}, {
				name: 'content',
				component: '::div',
				className: 'content',
				children: [{
					name: 'grp1',
					className: 'grouptitle',
					component: '::div',
					children: [{
						component: '::span',
						children: '打印期间'
					}, {
						component: '::div',
						className: 'dashline'
					}]
				}, {
					name: 'data',
					component: 'DateRangeMonthPicker',
					format: "YYYY-MM",
					allowClear: false,
					startEnableDate: '{{data.enableDate}}',
					popupStyle: { zIndex: 10 },
					mode: ['month', 'month'],
					onChange: '{{$onPanelChange}}',
					value: '{{$getNormalDateValue()}}'
				}, {
					name: 'grp2',
					className: 'grouptitle',
					component: '::div',
					children: [{
						component: '::span',
						children: '报表打印'
					}, {
						component: '::div',
						className: 'dashline'
					}]
				}, {
					component: '::div',
					className: 'reports',
					children: '{{$renderGroupData("reports",data.rptList)}}'
				}, {
					name: 'grp3',
					className: 'grouptitle',
					component: '::div',
					children: [{
						component: '::span',
						children: '账簿打印'
					}, {
						component: '::div',
						className: 'dashline'
					}]
				}, {
					component: '::div',
					className: 'reports',
					children: '{{$renderGroupData("accountBooks",data.rptList)}}'
				}]
			}]
		}
	}
}
export function getInitState() {
	return {
		data: {
			loading: false,
			enabledPeriod: '',
			printOption: {
				startDate: '',
				endDate: '',
				reports: [],
				accountBooks: []
			},
			rptList: [
				{ type: 'reports', label: '资产负债表', value: 'balanceSheet' },
				{ type: 'reports', label: '利润表', value: 'profitStatement' },
				{ type: 'reports', label: '现金流量表', value: 'cashFlowStatement' },
				{ type: 'accountBooks', label: '余额表', value: 'balanceSumRpt' },
				//{ type: 'accountBooks', label: '总账', value: 'Orange9' },
				//{ type: 'accountBooks', label: '明细账', value: 'Orange2' },
				//{ type: 'accountBooks', label: '辅助总账', value: 'Orange3' },
				//{ type: 'accountBooks', label: '辅助明细账', value: 'Orange4' },
				//{ type: 'accountBooks', label: '辅助余额表', value: 'Orange5' },
				{ type: 'accountBooks', label: '凭证汇总表', value: 'certificateCollect' },
				//{ type: 'accountBooks', label: '多栏账', value: 'Orange7' },
				//{ type: 'accountBooks', label: '销售明细账', value: 'Orange8' },
			]
		}
	}
}