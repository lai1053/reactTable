import moment from 'moment'
import { consts } from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-inventory-account-set',
		children: {
			name: 'demo',
			component: '::div',
			className: 'ttk-scm-inventory-account-set-div',
			children: {
				name: 'mainTab',
				component: 'Tabs',
				onChange: '{{$changeTabs}}',
				children: [
					{
						name: 't1',
						component: 'Tabs.TabPane',
						tab: '新增存货规则',
						key: 1,
						children: {
							name: 'root1',
							component: 'Layout',
							style: { height: '297px' },
							children: {
								name: 'main1',
								component: 'Spin',
								tip: '数据加载中...',
								spinning: '{{data.loading1}}',
								children: {
									name: 'RadioGroup',
									component: 'Radio.Group',
									onChange: '{{$handleOnChangeSetType}}',
									value: '{{data.inventoryNameSet}}',
									children: [
										{
											name: 'Radio1',
											component: 'Radio',
											className: 'ttk-scm-inventory-account-set-radio',
											value: 1,
											children: '按品名+规格型号自动生成存货名称'
										},
										{
											name: 'Radio2',
											component: 'Radio',
											className: 'ttk-scm-inventory-account-set-radio',
											value: 0,
											children: '按品名自动生成存货名称'
										}
									]
								}
							}
						}
					},
					/*{
						name: 't2',
						component: 'Tabs.TabPane',
						tab: '存货及服务科目',
						_visible: '{{data.vatOrEntry===1}}',
						key: 2,
						children: {
							name: 'table',
							component: 'Table',
							key: '{{data.tableKey}}',
							bordered: true,
							pagination: false,
							scroll: '{{data.invAccountList.length>0?data.tableOption:{} }}',
							className: 'ttk-scm-inventory-account-set-table-wrapper',
							loading: '{{data.loading2}}',
							columns: '{{$renderColumns()}}',
							dataSource: '{{data.invAccountList}}',
						}
					},*/
					{
						name: 't3',
						component: 'Tabs.TabPane',
						tab: '计量单位设置',
						key: 3,
						children: {
							name: 'root1',
							component: 'Layout',
							style: { height: '297px' },
							children: [{
								name: 'main1',
								component: 'Spin',
								tip: '数据加载中...',
								spinning: '{{data.loading1}}',
								children: [
									{
										name: 'Radio1',
										component: 'Checkbox',
										className: 'ttk-scm-inventory-account-set-checkbox',
										checked: '{{data.isHideUnit}}',
										onChange: '{{$hideUitOnChange}}',
										children: '隐藏计量单位'
									},
									{
										name: 'popover',
										component: 'Popover',
										content: '隐藏计量单位，则在理票界面不显示计量单位列，发票上商品计量单位和存货中计量单位不同时，不做转换',
										placement: 'rightTop',
										overlayClassName: 'ttk-scm-app-sa-invoice-card-helpPopover',
										children: {
											name: 'icon',
											component: 'Icon',
											fontFamily: 'edficon',
											type: 'bangzhutishi',
											className: 'helpIcon'
										}
									}]
							},
							]
						}
					},
				]
			},
		},
	}
}

export function getInitState() {
	return {
		data: {
			loading1: false,
			loading2: false,
			invAccountList: [],
			inventoryNameSet: null,
			isHideUnit: false,
			tableOption: {

			},
			tableKey: 1000,
			inventoryAccount: [],
			vatOrEntry: null
		}
	}
}
