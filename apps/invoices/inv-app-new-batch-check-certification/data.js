export function getMeta() {
	return {
		name: "root",
		component: "Layout",
		className: "inv-app-new-batch-check-certification",
		children: ["{{$renderChildren()}}"]
	}
}

export function getInitState() {
	return {
		data: {
			loading: false,
			checked: null, //是否可签
			params: {
				customerNameOrMemCode: null, // 模糊查找字段，客户名称或助记码
				clientState: 4,
				totalSignState: null
			},
			defaultParams: {
				customerNameOrMemCode: null,
				clientState: 4,
				totalSignState: null
			},
			selectedRowKeys: [],
			tableSource: [],
			pageSize: 50,
			currentPage: 1,
			totalCount: 0,
			bsModalShow: false,
			batchNum: 0,
			linkModalShow: false,
			submitList: []
		}
	}
}
