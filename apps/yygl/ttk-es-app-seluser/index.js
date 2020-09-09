export default {
	name: 'ttk-es-app-seluser',
	version: "1.0.0",
	moduleName: '选择人员',
	description: '选择人员',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-es-app-seluser")
	}
}