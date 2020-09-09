export default {
	name: "ttk-ba-app-basetting",
	version: "1.0.0",
	moduleName: '档案',
	description: "档案设置",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-ba-app-basetting")
	}
}
