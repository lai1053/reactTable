export default {
	name: 'ttk-gl-app-calculationcost',
	version: "1.0.0",	
	moduleName: '财务',
	description: '结账（结转销售成本-测算成本）',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-gl-app-calculationcost")
	}
}