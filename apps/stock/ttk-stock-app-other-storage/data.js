export function getMeta() {
	return {
		name: "root",
		component: "Layout",
		className: "ttk-stock-app-other-storage",
		children: ["{{$renderChildren()}}"]
	}
}

export function getInitState() {
	return {
		data: {
			content: 'Hello TTK!!! Successful project initialization',
			version: 'v2.1.0'
		}
	}
}