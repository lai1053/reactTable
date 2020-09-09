export function getMeta() {
	return {
		name: "root",
		component: "Layout",
		className: "ttk-stock-app-statements-chyzz",
		children: "{{$renderPage()}}",
	}
}

export function getInitState() {
	return {
		data: {
			loading: true, // 页面
			isUnOpen: false, // 存货开关
			tableLoading: false, // 数据
			queryData: {
				// 筛选
				diff: 0,
				period: "2019-01",
			},
			selectOptions: [
				{
					// 差额类型
					value: 0,
					type: "全部",
				},
				{
					value: 1,
					type: "有差额",
				},
				{
					value: 2,
					type: "无差额",
				},
			],
			tableData: {}, // 报表数据
			scrollProps: { x: "100%", y: 400 }, // 主表格
			// mainList: [],
			barWidth: 0, // 滚动条高度
		},
	}
}
