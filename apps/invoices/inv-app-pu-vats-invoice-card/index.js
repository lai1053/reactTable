export default {
	name: 'inv-app-pu-vats-invoice-card',
	version: "1.0.0",
	moduleName: '发票采集',
	description: '增值税专用发票',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "inv-app-pu-vats-invoice-card")
	}
}