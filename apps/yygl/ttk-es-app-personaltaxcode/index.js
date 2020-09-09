export default {
	name: 'ttk-es-app-personaltaxcode',
	version: "1.0.0",
	moduleName: '个税密码批量修改',
	description: '个税密码批量修改',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-es-app-personaltaxcode")
	}
}