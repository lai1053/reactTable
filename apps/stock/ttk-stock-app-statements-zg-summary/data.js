export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-stock-app-statements-zg-summary',
		children: '{{$renderPage()}}'
	}
}

export function getInitState() {
	return {
		data: {
			loading: false, // 页面
			isUnOpen: false, // 存货开关
			tableLoading: false, // 数据
			queryData: { // 筛选
				// period: '2019-01',
				inventoryClassId: 0
			},
			selectOptions: [{ // 类型
				id: 0,
				name: '全部'
			}],
			tableData: {}, // 报表数据
			scrollProps: { x: 1000, y: 400 }, // 主表格
			barWidth: 0, // 滚动条高度
		}
	}
}