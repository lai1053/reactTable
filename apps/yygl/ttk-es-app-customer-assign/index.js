export default {
	name: 'ttk-es-app-customer-assign',
	version: "1.0.0",
	moduleName: '客户分配',
	description: '分配权限',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-es-app-customer-assign")
	}
}