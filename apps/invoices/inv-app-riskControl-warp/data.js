export function getMeta() {
	return {
		name: 'root',
		component: 'Layout',
		className: 'inv-app-riskControl-warp',
		children: [{
			name: 'ControlIframe',
			id:'ControlIframe',
			className: 'inv-app-riskControl-warp-iframe',
			component: '::iframe',
			height: '100%',
			scrolling: 'auto',
			src:'{{data.url}}'
		}]
	}
}

export function getInitState() {
	return {
		data: {
			url:'',
			urlData: {
				key: '',
				url: '',
				encryptedData: ''
			},
			other: {
				loading: false,
			}
		}
	}
}