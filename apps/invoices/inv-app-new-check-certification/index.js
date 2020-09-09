export default {
	name: 'inv-app-new-check-certification',
	version: "2.0.0",
	moduleName: '勾选认证',
	description: '测试页名称',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "inv-app-new-check-certification")
	}
}