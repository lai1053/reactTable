


export default {
	name: "ttk-stock-app-report-export",
	version: "1.0.0",
	dvoucherescription: "ttk-stock-app-report-export",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-stock-app-report-export")
	}
}