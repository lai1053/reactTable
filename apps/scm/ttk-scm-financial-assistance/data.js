export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: '{{ data.content.isCurrent ? "ttk-scm-financial-assistance" : "ttk-scm-financial-assistance notcurrent" }}',
		children:
		[{
			name: 'openJchl',
			component: '::span',
			className: 'ttk-scm-financial-assistance-top',
			onClick: '{{ function(){ $openJchl() } }}',
			children: [/*{
				name: 'word',
				component: '::span',
				className: 'word',
				children: '注：查看发票详情，自动记账，一键全税种申报',
			}, */{
				name: 'btn',
				component: 'Button',
				className: 'openJchl',
				type: 'primary',
				children: '查看发票详情，自动生成申报表，立即体验',
			}],
		}, {
			name: 'ttk-scm-financial-assistance-tab',
			component: '::div',
			className: 'ttk-scm-financial-assistance-div',
			children: {
				name: 'tabNav',
				component: 'Tabs',
				activeKey: '{{data.other.activeKey}}',
				onChange:'{{$handletabchange}}',
				type: "card",
				children: {
					name: "option",
					component: 'Tabs.TabPane',
					tab: {
						name: 'tab',
						component: '::div',
						children: '{{ data.other.incomeexpensesTab && data.other.incomeexpensesTab[_rowIndex].name }}'
					},
					key: "{{ data.other.incomeexpensesTab && data.other.incomeexpensesTab[_rowIndex].id }}",
					children: {
						name: 'app',
						component: '::div',
						className: 'tab-app-item',
						children: {
							name: 'appload',
							component: 'AppLoader',
							active: '{{data.other.activeKey}}',
							//key: '{{data.other.incomeexpensesTab[_rowIndex].appName}}',
							appName: '{{data.other.incomeexpensesTab[_rowIndex].appName}}',
							appIndex: '{{_rowIndex}}',
							initData: '{{data.content}}'
						}
					},
					_power: 'for in data.other.incomeexpensesTab',
				}
			}
		}]
	}
}

export function getInitState() {
	return {
		data: {
			content: {},
			other: {
				activeKey:"1",
				incomeexpensesTab: [
					{
						"id": 1, "code": "2001003", "name": "概要", appName: 'ttk-scm-app-outline'
					},
					{
						"id": 2, "code": "3001002", "name": "进项发票明细", appName: 'ttk-scm-app-entry-invoice'
					},
					{
						"id": 3, "code": "4001001", "name": "销项发票明细", appName: 'ttk-scm-app-sales-invoice'
					},
					{
						"id": 4, "code": "4001003", "name": "增值税申报（按月）", appName: 'ttk-scm-app-add-tax'
					}
					,
					{
						"id": 5, "code": "4001004", "name": "增值税申报（累计）", appName: 'ttk-scm-app-add-tax-total'
					}
				],
			},
		}
	}
}