export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: '{{"ttk-stock-app-inventory-picking-fast-noBOM "+ data.currentStep}}',
		children: '{{$renderPage()}}',
	}
}

export function getInitState() {
	return {
		data: {
			loading: false,
			canSave: false,
			disabledNext: false,
			actualTotalNum: 0,
			actualTotalCash: 0,
			tableOption: {	y: 334, x: '100%' },
			gapTips: '库存有缺口，下一步将进行暂估处理',
			needToZangu: false,
			selectedRowKeys: [],
			lingliaoCash: 25000,
			list: [],
			gapList: [],
			footerNum: 20,
			footerCash: '29,888.00',
			currentStep: 'step1',
			form:{
				showPopoverCard: false,
				filterType: '',
				propertyDetailFilter: [],
				inputVal: '',
				rounding: false
			},
			obj: {
				"isDisable": false,
				"isReBack": false,
				"isDelete": false,
				"isFPDelete": false,
				"includeContentEmpty": false,
				"includeSystemData": false,
				"billBodyYbBalance": 49970, //--应领料总金额
				"billBodyDtoList": []
			},
			step3_list: []
		}
	}
}