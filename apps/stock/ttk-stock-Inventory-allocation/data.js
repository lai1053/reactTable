export function getMeta() {
	return {
		name: "root",
		component: "Layout",
		className: "ttk-stock-Inventory-allocation",
		children: "{{$renderPage()}}"
	}
}

export function getInitState() {
	return {
		data: {
			form: {
				enableDate: ""
			},
			list: [],
			other: {},
			migrationType: 1,
			allowMigration: 0,
			classConfirm: "ttk-stock-Inventory-allocation-div wqy"
		}
	}
}
