export default {
	name: 'ttk-es-app-card-person',
	version: "1.0.0",
	moduleName: '用户管理',
	description: '添加用户',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-es-app-card-person")
	}
}