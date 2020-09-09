import { fromJS } from "immutable"
import moment from 'moment'
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-gl-app-multicolumnaccount-rpt',
		children: [{
			name: 'header',
			component: '::div',
			className: 'ttk-gl-app-multicolumnaccount-rpt-header',
			children: [{
				name: 'header-left',
				component: '::div',
				className: 'ttk-gl-app-multicolumnaccount-rpt-header-left',
				children: [{
					name: 'date',
					component: 'DateRangeMonthPicker',
					format: "YYYY-MM",
					allowClear: false,
					startEnableDate: '{{data.other.enabledDate}}',
					popupStyle: { zIndex: 10 },
					mode: ['month', 'month'],
					onChange: '{{$onPanelChange}}',
					value: '{{$getNormalDateValue()}}'
				}, {
					name: 'accountList',
					component: 'Select',
					value: '{{data.searchValue.accountId}}',
					placeholder: '请选择科目',
					className: 'selectone',
					filterOption: "{{$filterOption}}",
					onChange: "{{function(v){$onFieldChange(_ctrlPath, v)}}}",
					getPopupContainer: '{{function(){return document.querySelector(".ttk-gl-app-multicolumnaccount-rpt")}}}',
					children: {
						name: 'option',
						component: 'Select.Option',
						value: '{{data.other.accountList[_rowIndex].id}}',
						title: '{{data.other.accountList[_lastIndex].codeAndName}}',
						children: '{{data.other.accountList[_rowIndex].codeAndName}}',
						_power: 'for in data.other.accountList'
					}
				}, {
					name: 'secondCode',
					component: 'Select',
					value: '{{data.searchValue.secondCode}}',
					className: 'selecttwo',
					filterOption: "{{$filterOption}}",
					onChange: "{{function(v){$onFieldChange(_ctrlPath, v)}}}",
					getPopupContainer: '{{function(){return document.querySelector(".ttk-gl-app-multicolumnaccount-rpt")}}}',
					children: {
						name: 'option',
						component: 'Select.Option',
						value: '{{data.other.accountOrAuxList[_rowIndex].code}}',
						children: '{{data.other.accountOrAuxList[_rowIndex].name}}',
						title: '{{data.other.accountOrAuxList[_rowIndex].name}}',
						_power: 'for in data.other.accountOrAuxList'
					}
				}, {
					component: 'Icon',
					fontFamily: 'edficon',
					type: 'shuaxin',
					title: '刷新',
					className: 'reload',
					onClick: '{{$refresh}}',
				}]
			}, {
				name: 'header-right',
				component: '::div',
				className: 'ttk-gl-app-multicolumnaccount-rpt-header-right',
				children: [{
					name: 'showZeroData',
					children: '显示无余额无发生额数据',
					component: 'Checkbox',
					checked: "{{data.searchValue.showZeroData}}",
					onChange: "{{function(e){$onFieldChange(_ctrlPath, e.target.checked)}}}",
				}, {
					name: 'valueType',
					component: 'Select',
					value: '{{data.searchValue.valueType}}',
					className: 'selectthree',
					onChange: "{{function(v){$onFieldChange(_ctrlPath, v)}}}",
					getPopupContainer: '{{function(){return document.querySelector(".ttk-gl-app-multicolumnaccount-rpt")}}}',
					children: {
						name: 'option',
						component: 'Select.Option',
						value: '{{data.other.typeList[_rowIndex].code}}',
						children: '{{data.other.typeList[_rowIndex].name}}',
						_power: 'for in data.other.typeList'
					}
				}, {
					name: 'common',
					component: 'Dropdown',
					overlay: {
						name: 'menu',
						component: 'Menu',
						onClick: '{{$shareClick}}',
						children: [{
							name: 'weixinShare',
							component: 'Menu.Item',
							key: 'weixinShare',
							children: '微信/QQ'
						}, {
							name: 'mailShare',
							component: 'Menu.Item',
							key: 'mailShare',
							children: '邮件分享'
						}]
					},
					children: {
						name: 'internal',
						component: 'Button',
						type: 'primary',
						children: ['分享', {
							name: 'down',
							component: 'Icon',
							type: 'down'
						}]
					}
				}, {
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
			}]
		}, {
			name: 'voucherItems',
			component: 'Table',
			className: 'ttk-gl-app-multicolumnaccount-rpt-tbody',
			pagination: false,
			key: '{{Math.random()}}',
			loading: '{{data.loading}}',
			scroll: '{{data.list.length > 0 ? data.tableOption : {} }}',
			allowColResize: false,
			enableSequenceColumn: false,
			bordered: true,
			dataSource: '{{data.list}}',
			noDelCheckbox: true,
			onRow: '{{function(record){if(record.dataType==2||record.dataType==3){return {className: "totalRow"}}else{return {className: ""}}}}}',
			columns: '{{$renderColumns()}}'
		}, {
			name: 'footer',
			className: 'ttk-gl-app-multicolumnaccount-rpt-footer',
			component: '::div',
			children: [{
				name: 'pagination',
				component: 'Pagination',
				pageSize: '{{data.pagination.pageSize}}',
				current: '{{data.pagination.currentPage}}',
				total: '{{data.pagination.totalCount}}',
				onChange: '{{$pageChanged}}',
				onShowSizeChange: '{{$sizePageChanged}}'
			}]
		}]
	}
}
export function getInitState(option) {
	return {
		data: {
			tableOption: {
				x: 1200,
				y: null
			},
			headList: fromJS([]),
			list: fromJS([]),
			searchValue: {
				date_start: moment(new Date("2018-01")),
				date_end: moment(new Date("2018-01")),
				accountId: undefined, //科目ID
				secondCode: "",//下级科目或者辅助核算项
				valueType: null, // 0："本期借方发生额" 1："本期贷方发生额" 2："余额"
				showZeroData: false, //是否显示无余额无发生额数据
				isCalcCode: false, //是否辅助项				
			},
			pagination: {
				currentPage: 1,
				totalCount: 0,
				pageSize: 50,
				totalPage: 0
			},
			other: {
				accountList: [],
				accountOrAuxList: [],
				typeList: [],
				enabledDate: '2018-01'
			},
			loading: true
		}
	}
}
