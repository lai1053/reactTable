


export default {
	name: "ttk-stock-app-inventory-intelligence",
	version: "1.0.0",
	description: "ttk-stock-app-inventory-intelligence",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-stock-app-inventory-intelligence")
	}
}