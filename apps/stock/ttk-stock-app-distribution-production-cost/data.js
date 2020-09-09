export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
        // className: 'distribution-cost',
        children: '{{$renderPage()}}',
	}
}

export function getInitState() {
	return {
		data: {
			costRateErrorTips: '',
			totalSales: 100000,
			loading: false,
			isGenVoucher: false,
			tableOption:{
				y: 400
			},
			others: {
				title:'生产成本分配',
				month: '',
				costRate: '',
                updateBtn: '更新数据',
                delBtn: '删除',
				costRateErrorTips: '',
				isVoucher: false
			},
			list: [],
		}
	}
}