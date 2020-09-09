// import {columnData} from './fixedData'
export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'assessment-chonghui',
		onMouseDown: '{{$mousedown}}',
		children: [
			{
				name: 'ttk-stock-app-spin',
				className: 'ttk-stock-app-spin',
				component: '::div',
				_visible: '{{data.loading}}',
				children: '{{$stockLoading()}}'
			},
			{
				name: 'content',
				component: 'Layout',
				className: 'assessment-chonghui-content',
				children: '{{$renderTable()}}'
			},
	]
	}
}

export function getInitState() {
	return {
		data: {
			columnData: [],
			form: {
				code: '',
				operater: 'liucp',
			},
			list: [
			],
			
			
			columns: [],
			tableOption:{
				x:1,
				y: 301
            },
			other: {
				error:{},
			},
			basic:{
				enableDate:''
			}, 
			loading: false
		}
	}
}