export default {
	name: 'ttk-es-app-workbench',
	version: "1.0.0",
	moduleName: '工作台',
	description: '工作台',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-es-app-workbench")
	}
}
