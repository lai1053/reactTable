export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-scm-incomeexpenses-setting',
		children: [
			{
				name: 'ttk-scm-incomeexpenses-setting-btn',
				component: '::div',
				className: 'ttk-scm-incomeexpenses-setting-btn',
				_visible: '{{$getBottonVisible}}',
				children: [
					{
						name: 'add',
						component: 'Button',
						type: 'primary',
						children: '新增',
						className: 'btn',
						onClick: '{{$newClick}}'
					},
					{
						name: 'del',
						component: 'Button',
						children: '删除',
						className: 'btn',
						onClick: '{{$delDaphClick}}'
					}]
			},
			{
				name: 'ttk-scm-incomeexpenses-setting-tab-container',
				component: '::div',
				className: 'ttk-scm-incomeexpenses-setting-tab-container',
				children: [
					{
						name: 'tabNav',
						component: 'Tabs',
						animated: false,
						className: 'ttk-scm-incomeexpenses-setting-tabs',
						activeKey: '{{data.other.activeKey}}',
						onChange: "{{$tabChange}}",
						children: [
							{
								name: "option",
								component: 'Tabs.TabPane',
								className: 'ttk-scm-incomeexpenses-setting-tabs-tabpane',
								tab: {
									name: 'tab',
									component: '::div',
									children: '{{ data.other.incomeexpensesTab && data.other.incomeexpensesTab[_rowIndex].name }}'
								},
								key: "{{_rowIndex}}",
								children:
								{
									name: 'content',
									className: 'ttk-scm-incomeexpenses-setting-content',
									component: 'Table',
									pagination: false,
									allowColResize: false,
									enableSequenceColumn: false,
									loading: '{{data.table[_rowIndex].loading}}',
									bordered: true,
									scroll: '{{data.table[_rowIndex].tableOption}}',
									dataSource: '{{data.table[_rowIndex].list}}',
									rowSelection: undefined,
									checkboxKey: '{{data.table[_rowIndex].checkboxKey}}',
									checkboxChange: '{{$checkboxChange}}',
									checkboxValue: '{{data.table[_rowIndex].tableCheckbox.checkboxValue}}',
									columns: '{{$tableColumns(_rowIndex)}}',
									key: '{{_rowIndex}}'
								},
								_power: 'for in data.other.incomeexpensesTab',
							}
						]
					}]
			},
		]
	}
}

export function getInitState() {
	return {
		data: {
			table: [
				{
					list: [],
					tableCheckbox: {
						checkboxValue: [],
						selectedOption: []
					},
					loading: false,
					checkboxKey: 'id',
					tableOption: {
						x: 1
					},

				},
				{
					list: [],
					tableCheckbox: {
						checkboxValue: [],
						selectedOption: []
					},
					loading: false,
					checkboxKey: null,
					tableOption: {
						x: 1
					},

				},
				{
					list: [],
					tableCheckbox: {
						checkboxValue: [],
						selectedOption: []
					},
					loading: false,
					checkboxKey: 'id',
					tableOption: {
						x: 1
					},

				},
				{
					list: [],
					tableCheckbox: {
						checkboxValue: [],
						selectedOption: []
					},
					loading: false,
					checkboxKey: null,
					tableOption: {
						x: 1
					},

				},
				{
					list: [],
					tableCheckbox: {
						checkboxValue: [],
						selectedOption: []
					},
					loading: false,
					checkboxKey: null,
					tableOption: {
						x: 1
					},

				},
				{
					list: [],
					tableCheckbox: {
						checkboxValue: [],
						selectedOption: []
					},
					loading: false,
					checkboxKey: null,
					tableOption: {
						x: 1
					},
				},
			],
			other: {
				incomeexpensesTab: [{
					"id": 2001003, "code": "2001003", "name": "收入类型"
				}, {
					"id": 4001001, "code": "4001001", "name": "费用类型"
				}, {
					"id": 3001002, "code": "3001002", "name": "收款类型"
				}, {
					"id": 3001001, "code": "3001001", "name": "付款类型"
				}],
				activeKey: '0'
			},
			tplus: {
				account: [],
				softAppName: ""
			}
		}
	}
}