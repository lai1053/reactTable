export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-delete-info',
		children: [
			{
				name: 'list',
				component: '::div',
				style:{height:'200px'},
				className: 'ttk-es-app-delete-info-list',
				children: '{{$renderStatement(data.list)}}'
			},
		]
	}		
}

export function getInitState() {
	return {
		data: {
			percent: 0,
			list: [],
			loading: false,
		}
	}
}
