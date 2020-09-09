

export default {
	name: "ttk-scm-home-invoice",
	version: "1.0.0",
	moduleName: '业务',
	description: "首页进销项",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-home-invoice")
	}
}