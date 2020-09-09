export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-gl-app-report-list-root',
		children: [{
			name: 'tabs',
			component: 'Tabs',
			defaultActiveKey:"balance",
			onChange:'{{function(v) {return $handleOnchangeTab(v)}}}',
			animated:false,
			children:[{
				name: 'tab1',
				component: 'Tabs.TabPane',
				tab:"资产负债表",
				key: 'balance',
				children:{
					name: 'table',
					component: 'Table',
					emptyShowScroll: true,
					pagination: false,
					className: 'ttk-gl-app-report-list-root-table1',
					// className: '{{$handleClassName("balance")}}',
					allowColResize: false,
					enableSequenceColumn: false,
					loading: '{{data.tab1.loading}}',
					bordered: true,
					scroll: '{{data.tab1.tableOption}}',
					dataSource: '{{data.tab1.tableList}}',
					noDelCheckbox: true,
					// columns: '{{$tableColumnsTab1()}}',
					columns: '{{$tableColumns("tab1")}}',
					style: {height: "450px"}
				}
			},{
				name: 'tab2',
				component: 'Tabs.TabPane',
				tab:"利润表",
				key:'profit',
				children:{
					name: 'table',
					component: 'Table',
					emptyShowScroll: true,
					lazyTable: true,
					pagination: false,
					className: 'ttk-gl-app-report-list-root-table2',
					// className: '{{$handleClassName("profit")}}',
					allowColResize: false,
					enableSequenceColumn: false,
					loading: '{{data.tab2.loading}}',
					bordered: true,
					scroll: '{{data.tab2.tableOption}}',
					dataSource: '{{data.tab2.tableList}}',
					noDelCheckbox: true,
					// columns: '{{$tableColumnsTab2()}}',
					columns: '{{$tableColumns("tab2")}}',
					style: {height: "450px"}
				}
			}]
		}]
	}
}

export function getInitState() {
	return {
		data: {
			tab1: {
				loading: false,
				tableHead:[{title: "资产", name: "col1", colName: "A", isAmount: false},
				{title: "行次", name: "col2", colName: "B", isAmount: false},
				{title: "期末余额", name: "col3", colName: "C", isAmount: true, rowNoField: "col2"},
				{title: "年初余额", name: "col4", colName: "D", isAmount: true, rowNoField: "col2"},
				{title: "负债和所有者权益", name: "col5", colName: "E", isAmount: false},
				{title: "行次", name: "col6", colName: "F", isAmount: false},
				{title: "期末余额", name: "col7", colName: "G", isAmount: true, rowNoField: "col6"},
				{title: "年初余额", name: "col8", colName: "H", isAmount: true, rowNoField: "col6"}],
				tableList: [],
				tableOption: {},
				accountingStandardsId: null
			},
			tab2: {
				loading: false,
				tableHead:[{title: "项目", name: "col1", colName: "A", isAmount: false},
				{title: "行次", name: "col2", colName: "B", isAmount: false},
				{title: "本年累计金额", name: "col3", colName: "C", isAmount: true, rowNoField: "col2"},
				{title: "本月金额", name: "col4", colName: "D", isAmount: true, rowNoField: "col2"}],
				tableList: [],
				tableOption: {},
				accountingStandardsId: null
			},
		}
	}
}