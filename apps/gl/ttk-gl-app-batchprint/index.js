export default {
	name: "ttk-gl-app-batchprint",
	version: "1.0.0",	
	moduleName: '财务',
	description: '批量打印',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-gl-app-batchprint")
	}
}