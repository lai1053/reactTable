import moment from 'moment'
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-add-tax-total',
		children: [
			{
				name: 'header',
				component: '::div',
				className: "{{data.isFromOneself?'ttk-scm-app-add-tax-total-header height45':'ttk-scm-app-add-tax-total-header'}}",
				style: { height: '45px', lineHeight: '44px' },
				children: [{
					name: 'left',
					component: '::div',
					className: 'ttk-scm-app-add-tax-total-header-left',
					children: [{
						name: 'date',
						component: '::span',
						className: 'date-span',
						_visible: "{{!data.isFromOneself}}",
						children: '{{"汇总数据：（" + data.sksq + "-" + data.sksz + "）"}}'
					},{
						name: 'dateControl',
						component: '::span',
						className: 'date-span',
						_visible: "{{data.isFromOneself}}",		
						children: [
							{
								name: 'dateLeft',
								component: '::span',
								children: '汇总数据：'
							},{
								name: 'date',
								component: 'DateRangeMonthPicker',
								className: 'ttk-scm-app-add-tax-header-date',
								format: "YYYY-MM",
								popupStyle: { zIndex: 10 },
								mode: ['month', 'month'],
								disabledStartDate: '{{$disabledStartDate}}',
								endEnableDate:'{{data.end || ""}}',
								onPanelChange: '{{$onPanelChange}}',
								value: '{{$getNormalDateValue()}}'
							}
						],			
					},{
						name: 'refreshBtn',
						component: 'Icon',
						fontFamily: 'edficon',
						type: 'shuaxin',
						className: 'mk-normalsearch-reload',
						title:'刷新',
						style: { marginTop: '7px' },
						_visible: "{{data.isFromOneself}}",						
						onClick: '{{$downloadText}}'
					}]
				},{
					name: 'right',
					component: '::div',
					className: 'ttk-scm-app-add-tax-total-header-right',
					_visible: "{{!data.isFromOneself}}",
					onClick: '{{$downloadText}}',
					children: [{
						name: 'btn',
						component: 'Button',
						className: 'btn',
						size: 'small',
						children: '同步数据',
					}]
				}, {
					name: 'export',
					component: '::div',
					className: 'ttk-scm-app-add-tax-total-header-export',
					_visible: "{{data.isFromOneself}}",	
					children: [{
						name: 'daochu',
						component: 'Icon',
						fontFamily: 'edficon',
						className: 'daochu',
						type: 'daochu',
						title: '导出',
						onClick: '{{$export}}'
					}, {
						name: 'dayin',
						component: 'Icon',
						fontFamily: 'edficon',
						className: 'dayin',
						type: 'dayin',
						onClick: '{{$print}}',
						title: '打印'
		
					}]
				}]
			},
			{
				name: 'content',
				component: 'Layout',
				className: 'ttk-scm-app-add-tax-total-content',
				children:  [{
					name: 'dataGrid',
					component: 'DataGrid',
					className: 'ttk-scm-app-add-tax-form-details',
					headerHeight: 37,
					isColumnResizing: false,
					rowHeight: 37,
					ellipsis: true,
					rowsCount: "{{data.list.length}}",
					columns: "{{$getColumns()}}",
				}]
			}
		]
	}
}

export function getInitState() {
	return {
		data: {
			sksq: '',
			sksz: '',
			skszStr: '',
			sksqStr: '',
			list: [],
			isFromOneself: false,
			filter: {
				simpleCondition:null
			},
			other: {
				columns: [{
					caption: "序号",
					fieldName: "seq",
					idAlignType: 1000050002,
					width: 42
				},{
					caption: "所属月份",
					fieldName: "ssyf",
					idAlignType: 1000050002,
					width: 91
				},{
					caption: "24_应纳税额合计",
					fieldName: "ynse",
					idAlignType: 1000050003,
					flexGrow: 1,
					width: 111
				},{
					caption: "27_本期已缴税额",
					fieldName: "bqyjse",
					// fieldName: "BQYJSE",
					idAlignType: 1000050003,
					flexGrow: 1,
					width: 111
				},{
					caption: "主要销售额税负率（不含免税）",
					fieldName: "zyxsesfl",
					// fieldName: "ZYXSEFSL",
					idAlignType: 1000050003,
					flexGrow: 1,
					width: 182
				},{
					caption: "总销售额税负率",
					fieldName: "zxsesfl",
					// fieldName: "ZXSESFL",
					idAlignType: 1000050003,
					flexGrow: 1,
					width: 103
				},{
					caption: "1_按适用税率计税销售额",
					fieldName: "asysljsxse",
					idAlignType: 1000050003,
					flexGrow: 1,
					width: 151
				},{
					caption: "5_按简易征收办法计税销售额",
					fieldName: "ajybfjsxse",
					idAlignType: 1000050003,
					flexGrow: 1,
					width: 175
				},{
					caption: "7_免、抵、退办法出口销售额",
					fieldName: "mdtbfckxse",
					idAlignType: 1000050003,
					flexGrow: 1,
					width: 175
				},{
					caption: "8_免税销售额",
					fieldName: "msxse",
					idAlignType: 1000050003,
					flexGrow: 1,
					width: 175
				},{
					caption: "11_销项税额",
					fieldName: "xxse",
					idAlignType: 1000050003,
					flexGrow: 1,
					width: 175
				},{
					caption: "12_进项税额",
					fieldName: "jxse",
					idAlignType: 1000050003,
					flexGrow: 1,
					width: 175
				},{
					caption: "13_上期留抵税额",
					fieldName: "sqldse",
					idAlignType: 1000050003,
					flexGrow: 1,
					width: 175
				},{
					caption: "14_进项税额转出",
					fieldName: "jxsezc",
					idAlignType: 1000050003,
					flexGrow: 1,
					width: 175
				},{
					caption: "15_免抵退应退税额",
					fieldName: "mdtytse",
					idAlignType: 1000050003,
					flexGrow: 1,
					width: 175
				},{
					caption: "20_期末留抵税额",
					fieldName: "qmldse",
					idAlignType: 1000050003,
					flexGrow: 1,
					width: 175
				},{
					caption: "21_简易计税办法计算的应纳税额",
					fieldName: "jybfYnse",
					idAlignType: 1000050003,
					flexGrow: 1,
					width: 200
				}]
			},
			loading: false, //grid加载状态
		}
	}
}