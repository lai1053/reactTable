export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-stock-app-inventory-picking-ruku',
		children: '{{$renderPage()}}',
	}
}

export function getInitState() {
	return {
		data: {
			loading: false,
			form: {
				code: '',
				name:'',
				cdate:'',
				supplierName:'',
				operater: 'liucp',
			},
			columns: [],
			list: [
			],
			listAll: {
				numSum: '',
				ybbalanceSum: ''
			},
			other: {
				error:{},
			},
			basic:{
				enableDate:''
			}
		}
	}
}