export default {
	name: 'inv-app-pu-cdpi-invoice-card',
	version: "1.0.0",
	moduleName: '发票采集',
	description: '海关专用缴款书',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "inv-app-pu-cdpi-invoice-card")
	}
}