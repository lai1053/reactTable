


export default {
	name: "ttk-stock-app-voucher-batch",
	version: "1.0.0",
	dvoucherescription: "ttk-stock-app-voucher-batch",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-stock-app-voucher-batch")
	}
}