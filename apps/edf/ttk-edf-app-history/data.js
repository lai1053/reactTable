export function getMeta() {
	return {
		name: 'root',
		component: '::div',
		className: 'ttk-edf-app-history',
		onScroll: '{{$handleScroll}}',
		children: [{
			name: 'tree',
			component: 'Timetree',
			history: '{{data.history}}',
			link: '{{$openLink}}'
		}]
	}
}

export function getInitState() {
	return {
		data: {
			history: {},
			other: {
				position: 0
			}
		}
	}
}