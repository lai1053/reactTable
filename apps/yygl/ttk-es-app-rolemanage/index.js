export default {
	name: 'ttk-es-app-rolemanage',
	version: "1.0.0",
	moduleName: '角色管理',
	description: '角色管理列表',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-es-app-rolemanage")
	}
}