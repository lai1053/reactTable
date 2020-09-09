export function getMeta() {
	return {
		name: "root",
		component: "Layout",
		className: "inv-app-new-check-certification",
		children: ["{{$renderChildren()}}"]
	}
}

export function getInitState() {
	return {
		data: {
			isInstall: false,
			loading: false,
			nsrsbh: "",
			skssq: null,
			clientState: null,
			current: "1"
		}
	}
}
