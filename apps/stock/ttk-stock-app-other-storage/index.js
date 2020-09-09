export default {
	name: 'ttk-stock-app-other-storage',
	version: "1.0.0",
	moduleName: '其他出入库',
	description: '其他出入库',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-stock-app-other-storage")
	}
}