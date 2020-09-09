


export default {
	name: "ttk-stock-app-inventory-picking-ruku",
	version: "1.0.0",
	description: "ttk-stock-app-inventory-picking-ruku",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-stock-app-inventory-picking-ruku")
	}
}