export default {
	name: 'ttk-es-app-customer',
	version: "1.0.0",
	moduleName: '客户资料',
	description: '客户资料',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-es-app-customer")
	}
}