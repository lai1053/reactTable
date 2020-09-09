export function getMeta() {
	return {
		name: 'root',
		className: 'qrCode',
		component: 'Layout',
		children: {
			name:'div',
			component: "::div",
			className: '{{data.url?"qrContainer":"qrContainer filterQr"}}',
			children: [{
				name: 'shareImg',
				component: 'Layout',
				children: '{{$renderContainer(data.url)}}'
				// children: '{{$renderContainer(data.url)}}'
			},{
				name: 'foot',
				className: 'weixin_popup_foot',
				component: '::div',
				children: '请使用微信或QQ“扫一扫”'
			},{
				name: 'foot',
				className: 'weixin_popup_foot',
				component: '::div',
				children: '将网页分享给好友'
			},]
		}
	}
}

export function getInitState() {
	return {
		data: {
			content: '微信分享',
			url: ''
		}
	}
}