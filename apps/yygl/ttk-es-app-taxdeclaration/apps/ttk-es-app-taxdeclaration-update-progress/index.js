export default {
	name: 'ttk-es-app-taxdeclaration-update-progress',
	version: "1.0.0",
	moduleName: '更新进度',
	description: '测试页名称',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-es-app-taxdeclaration-update-progress")
	}
}
