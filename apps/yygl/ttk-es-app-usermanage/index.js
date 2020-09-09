export default {
	name: 'ttk-es-app-usermanage',
	version: "1.0.0",
	moduleName: "基础档案",
    description: "部门人员列表",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-es-app-usermanage")
	}
}