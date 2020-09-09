export function getMeta() {
    return {
        name: 'root',
		component: 'Layout',
        className: 'ttk-stock-app-statements-sales-gross-profitRate-backgroundColor',
        children: ["{{$renderPage()}}"]
    }
}

export function getInitState() {
	return {
		data: {

		}
	}
}