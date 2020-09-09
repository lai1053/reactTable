export default {
	name: 'ttk-es-app-open-operate-pre',
	version: "1.0.0",
	moduleName: '开通运营',
	description: '测试页名称',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-es-app-open-operate-pre")
	}
}
