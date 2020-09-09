export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-es-app-download-taxpayer-information',
		children: [
			{
				name: 'list',
				component: '::div',
				style:{height:'200px'},
				className: 'ttk-es-app-download-taxpayer-information-list',
				children: '{{$renderStatement(data.list)}}'
			}
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
