export default {
	name: 'bovms-app-funds',
	version: "1.0.0",
	moduleName: '资金列表',
	description: '资金列表',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "bovms_app_funds")
	}
}