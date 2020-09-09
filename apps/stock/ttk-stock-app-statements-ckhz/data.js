export function getMeta() {
    return {
        name: 'root',
		component: 'Layout',
        className: 'ttk-stock-app-statements-ckhz',
        children: ["{{$renderPage()}}"]
    }
}

export function getInitState() {
	return {
		data: {

		}
	}
}