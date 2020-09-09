export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
        className: 'ttk-stock-app-matchSubject',
        children: '{{$renderPage()}}'
	}
}

export function getInitState() {
	return {
		data: {
			loading: false,
			userId: '',
			inventoryClass: [],
			tableOption:{
				y: 400
			},
			radioValue: '0',
			radioOptions: [
				{ label: '全部', value: '0' },
				{ label: '已匹配', value: '1'},
				{ label: '未匹配', value: '2' }
			],
			selectedRowKeys: [],
			checkedRows: [],
			list:[],
			costList:[]
		}
	}
}