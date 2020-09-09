export function getMeta() {
	return {
		name: "root",
		component: "Layout",
		className: "bovms-app-order-list",
		children: "{{$renderPage()}}",
	}
}

export function getInitState() {
	return {
		data: {
			content: "在线购买套餐",
			version: "v2.1.0",
			isPay: false,
			payUrl: "",
		},
	}
}
