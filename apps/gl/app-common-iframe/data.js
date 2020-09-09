export function getMeta() {
	return {
		name: 'root',
		className: 'app-common-iframe',
		component: '::div',
		children: [{
			name: 'iframe',
			className: 'app-common-iframe-iframe',
			component: '::iframe',
			src: '{{data.content}}'
		}]
	}
}

export function getInitState() {
	return {
		data: {
			content: 'http://webapi.aierp.cn:8089/'
		}
	}
}