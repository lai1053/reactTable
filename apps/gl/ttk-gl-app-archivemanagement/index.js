export default {
	name: "ttk-gl-app-archivemanagement",
	version: "1.0.1",
	moduleName: '财务',
	description: "归档管理",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-gl-app-archivemanagement")
	}
}