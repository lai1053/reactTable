export default {
	name: 'ttk-es-app-mediation-reverse-list',
	version: "1.0.0",
	moduleName: '中介列表',
	description: '中介列表',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-es-app-mediation-reverse-list")
	}
}