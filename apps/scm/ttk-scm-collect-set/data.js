import moment from 'moment'
import { consts } from 'edf-consts'

export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-collect-set',
		children: {
			name: 'demo',
			component: '::div',
			className: 'ttk-scm-collect-set-div',
			children: {
				name: 'mainTab',
				component: 'Tabs',
				onChange: '{{$changeTabs}}',
				children: [
					{
						name: 't1',
						component: 'Tabs.TabPane',
						tab: '设置记账方式',
						key: 1,
						children: {
							name: 'root1',
							component: 'Layout',
							className: 'ttk-scm-app-set-bookkeeping',
							children: [{
								name: 'main1',
								component: 'Spin',
								tip: '数据加载中...',
								spinning: '{{data.other.loading1}}',
								children: [
									{
										component: '::div',
										children: [
											{
												name: 'tips',
												component: '::div',
												children: '为更快捷的记账，请选择发票默认的结算方式和单据日期'
											},
											{
												name: 'boot-way',
												component: '::div',
												className: 'bookkeeping-item',
												children: [
													{
														component: '::div',
														children: '结算方式：',
														className: 'bookkeeping-item-title',
													}, {
														component: '::div',
														children: '{{$renderBookWay()}}'
													}
												]
											},
											{
												name: 'book-date',
												component: '::div',
												className: 'bookkeeping-item',
												children: [
													{
														component: '::div',
														className: 'bookkeeping-item-title',
														children: '单据日期：'
													},
													{
														component: '::div',
														children: '{{$renderBookDate()}}'
													}
												]
											},
											{
												name: 'tips',
												component: '::div',
												className: 'set-bookkeeping-tips',
												children: '注：选择具体账户时，默认本次采集的发票全部现结'
											},
										]
									},
								],
							}
							]
						}
					},
					{
						name: 't2',
						component: 'Tabs.TabPane',
						tab: '设置档案匹配规则',
						key: 2,
						children: {
							name: 'root',
							component: '::div',
							className: 'ttk-scm-fileRules-card',
							onMouseDown: '{{$mousedown}}',
							children: {
								name: 'load',
								component: 'Spin',
								tip: '数据处理中...',
								spinning: '{{data.other.loading2}}',
								children: [
									// {
									// 	name: 'check',
									// 	component: 'Checkbox',
									// 	className: 'checkbox',
									// 	children: '勾选，应付账款/预付账款非末级时按供应商名称自动生成二级科目',
									// 	checked: '{{data.form2.supplierAccountSet}}',
									// 	onChange: '{{function(e){$setInventory("data.form2.supplierAccountSet",e.target.checked)}}}'
									// },
									{
										name: 'details',
										component: 'DataGrid',
										headerHeight: 37,
										className: 'ttk-scm-fileRules-card-content',
										isColumnResizing: true,
										rowHeight: 37,
										enableSequence: false,
										ellipsis: true,
										rowsCount: "{{data.form2.details && data.form2.details.length}}",
										readonly: false,
										columns: [
											{
												name: 'goodsName',
												component: 'DataGrid.Column',
												columnKey: 'goodsName',
												width: 100,
												flexGrow: 1,
												header: {
													name: 'header',
													component: 'DataGrid.Cell',
													children: '发票-货物或劳务名称'
												},
												cell: {
													name: 'cell',
													component: "DataGrid.Cell",
													className: 'inventoryName',
													value: "{{data.form2.details[_rowIndex].inventoryName}}",
													_power: '({rowIndex})=>rowIndex',
													tip: true,
												}
											},
											{
												name: 'inventoryName',
												component: 'DataGrid.Column',
												columnKey: 'inventory',
												width: 100,
												flexGrow: 1,
												header: {
													name: 'header',
													component: 'DataGrid.Cell',
													children: '档案-存货名称',
													className: 'cell_header'
												},
												cell: {
													name: 'cell',
													//component: '{{$isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
													component: 'Select',
													//dropdownClassName: 'dropdown_cell',
													className: '{{$getCellClassName(_ctrlPath)}}',
													showSearch: true,
													allowClear: true,
													dropdownClassName: 'celldropdown',
													value: '{{data.form2.details[_rowIndex] && data.form2.details[_rowIndex].name}}',
													filterOption: '{{$filterOption}}',
													onChange: '{{function(v){$onFieldChange(v, _rowIndex)}}}',
													children: {
														name: 'option',
														component: 'Select.Option',
														value: '{{data.other.inventory && data.other.inventory[_lastIndex].id}}',
														children: '{{data.other.inventory && data.other.inventory[_lastIndex].fullName}}',
														_power: 'for in data.other.inventory'
													},
													dropdownFooter: {
														name: 'add',
														type: 'primary',
														component: 'Button',
														style: { width: '100%', borderRadius: '0' },
														children: '新增',
														onClick: '{{function(){$addRecordClick(_rowIndex)}}}'
													},
													_excludeProps: '{{$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
													_power: '({rowIndex}) => rowIndex',
												}
											},
											{
												name: 'accountName',
												component: 'DataGrid.Column',
												columnKey: 'account',
												_visible: '{{data.inventoryRelatedAccountEnable===true}}',
												width: 100,
												flexGrow: 1,
												header: {
													name: 'header',
													component: 'DataGrid.Cell',
													children: '科目',
													className: 'cell_header'
												},
												cell: {
													name: 'cell',
													// component: '{{$isFocus(_ctrlPath) ? "Select" : "DataGrid.TextCell"}}',
													component: 'Select',
													//dropdownClassName: 'dropdown_cell',
													className: '{{$getCellClassName(_ctrlPath)}}',
													showSearch: true,
													allowClear: false,
													dropdownClassName: 'celldropdown',
													value: '{{data.form2.details[_rowIndex] && data.form2.details[_rowIndex].inventoryRelatedAccountName}}',
													filterOption: '{{$filterOption}}',
													dropdownMatchSelectWidth: false,      
													dropdownStyle:{width:'225px'}, 
													onChange: '{{function(v){$onAccountFieldChange(v, _rowIndex)}}}',
													children: {
														name: 'select-option',
														component: 'Select.Option',
														value: '{{data.other.account && data.other.account[_lastIndex].id}}',
														children: '{{data.other.account && data.other.account[_lastIndex].codeAndName}}',
														_power: 'for in data.other.account'
													},
													dropdownFooter: {
														name: 'add',
														type: 'primary',
														component: 'Button',
														style: { width: '100%', borderRadius: '0' },
														children: '新增',
														onClick: '{{function(){$addSubjects(_rowIndex)}}}'
													},
													_excludeProps: '{{$isFocus(_ctrlPath) ? ["onClick"] : ["children"]}}',
													_power: '({rowIndex}) => rowIndex',
												}
											}
										]
									}]
							}
						}
					},
					{
						name: 't3',
						component: 'Tabs.TabPane',
						tab: '设置采集发票类型',
						key: 3,
						children: {
							name: 'root3',
							component: 'Layout',
							className: 'ttk-scm-invoice-type-set',
							children: {
								name: 'main3',
								component: 'Spin',
								tip: '数据加载中...',
								spinning: '{{data.other.loading3}}',
								children: [
									{
										name: 'tip1',
										component: '::div',
										className: 'type-item',
										children: '{{$isNormal()?"已认证的发票，均采集，未认证发票，按勾选项采集":"按勾选项采集，其中：海关缴款书，通行费发票均采集"}}'
									},
									{
										name: 'tip2',
										component: '::div',
										className: 'type-item',
										children: '其中：海关缴款书，通行费发票均采集',
										_visible: '{{$isNormal()}}'
									},
									{
										name: 'proper',
										component: '::div',
										className: 'type-item',
										children: {
											component: 'Checkbox',
											checked: '{{data.form3.proper=="1"?true:false}}',
											onChange: '{{function(e){$handleCheckboxChange("data.form3.proper",e.target.checked)}}}',
											children: '采集增值税专用发票'
										},
									},
									{
										name: 'ordinary',
										component: '::div',
										className: 'type-item',
										children: {
											component: 'Checkbox',
											checked: '{{data.form3.ordinary=="1"?true:false}}',
											onChange: '{{function(e){ $handleCheckboxChange("data.form3.ordinary",e.target.checked)}}}',
											children: '采集增值税普通发票'
										},
									},
									{
										name: 'electron',
										component: '::div',
										className: 'type-item',
										children: {
											component: 'Checkbox',
											checked: '{{data.form3.electron=="1"?true:false}}',
											onChange: '{{function(e){$handleCheckboxChange("data.form3.electron",e.target.checked)}}}',
											children: '采集电子发票'
										},
									},
									{
										name: 'tip3',
										component: '::div',
										className: "invoice-type-set-tip",
										children: '注： 勾选则采集对应类型的发票，不勾选，则不采集'
									}
								]
							}
						}
					}
				]
			},
		},
	}
}

export function getInitState() {
	return {
		data: {
			inventoryRelatedAccountEnable: false,
			form1: {
				accountDateSet: null,
				settlement: null,
				bankAccountId: null,
				id: null
			},
			form2: {
				inventorySet: false,
				customerSet: false,
				details: []
			},
			form3: {
				proper: null,
				ordinary: null,
				electron: null
			},
			other: {
				loading1: true,
				loading2: true,
				loading3: true,
				error: {},
				inventory: [],
				account: []
			},
			bankAccount: []
		}
	}
}
