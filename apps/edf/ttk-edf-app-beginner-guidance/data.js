export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-edf-app-beginner-guidance',
		children: {
			name: 'container',
			component: '::div',
			className: 'ttk-edf-app-beginner-guidance-container',
			children: [{
				name: 'img',
				component: '::img',
				src: '{{$getFlowChart()}}'
			}, {
				name: 'description',
				component: '::div',
				className: '{{!!data.data[_rowIndex].hasLink ? "hasLink" : "hasNoLink"}}',
				style: {top: '{{data.data[_rowIndex].top}}', left: '{{data.data[_rowIndex].left}}'},
				children: '{{data.data[_rowIndex].name}}',
				onClick: '{{function() {$openApp(data.data[_rowIndex].linkApp, data.data[_rowIndex].linkAppName, data.data[_rowIndex].appProps)}}}',
				_power: 'for in data.data',
			}]
		}
	}
}

export function getInitState() {
	return {
		data: {
			data: null
		}
	}
}