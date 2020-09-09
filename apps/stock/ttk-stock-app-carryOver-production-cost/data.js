export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
        // className: 'ttk-stock-app-carryOver-product-cost',
        children: '{{$renderPage()}}'
	}
}

export function getInitState() {
	return {
		data: {
			storeList: null,
			storeParams: null,
			currentStep: null
			// pageTitle: '结转生产成本计算表',
			// loading: false,
			// isGenVoucher: false,
			// tableOption: {
			// 	x: 1400,
			// },
			// inventoryClass: [],
            // list: [],
            // month: ""	
		}
	}
}