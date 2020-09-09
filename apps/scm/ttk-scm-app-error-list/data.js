export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'ttk-scm-app-error-list',
		children: {
			component: "Spin",
			spinning: false,
			children: [
				{
					component: '::div',
					style: {
						maxHeight: 337,
						overflow: scroll,
						paddingRight:7,
					},
					children:'{{$renderLi()}}'
				}
			]
		}
	}
}

export function getInitState() {
	return {
		data: {
			success: [],
			fail: [],
			loading: true
		}
	}
}