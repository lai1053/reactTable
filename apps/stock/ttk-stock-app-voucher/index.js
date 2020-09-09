


export default {
	name: "ttk-stock-app-voucher",
	version: "1.0.0",
	dvoucherescription: "ttk-stock-app-voucher",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-stock-app-voucher")
	}
}