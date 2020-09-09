export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-stock-app-inventory-picking',
		children: '{{$renderPage()}}',
	}
}

export function getInitState() {
	return {
		data: {
            // hideFast: true,
			disalbledFPick: false,
			limit:{
				stateNow:'',
			},
			defaultPickerValue:'',
			listAll:{
				billBodyNum:'0',
				billBodyYbBalance:'0',
			},
			pagination:{
				pageSize:50,   // 每页默认显示数量
				current:1,	   // 当前页数
				total:0,	   // 总页数
			},
			inputVal: '',
			other: {
				activeTabKey:'1',
				isShowFirstTab:true,
			},
			form: {
				strDate:'',
				endDate:'',
                constom:'',
                voucherName: '',
                voucherIds: null
			},
			getInvSet: {
				endCostType: 1
			},
			list:[]
		}
	}
}