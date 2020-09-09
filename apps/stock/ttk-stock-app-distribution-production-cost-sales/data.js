export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
        // className: 'distribution-cost-sales',
        children: '{{$renderPage()}}'
	}
}

export function getInitState() {
	return {
		data: {
			// forbidden: false,
			costRateErrorTips: '',
			totalSales: 100000,
			loading: false,
			isGenVoucher: false,
			tableOption: {
				y: 400
			},
			others: {
				title: '生产成本分配',
				month: '',
				costRate: 0,
                updateBtn: '更新数据',
                delBtn: '删除',
				costRateErrorTips: '',
				isVoucher: false
			},
			list: [],
		}
	}
}