//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-edf-app-voucher-detail-setting",
	version: "1.0.0",
	description: "ttk-edf-app-voucher-detail-setting",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-edf-app-voucher-detail-setting")
	}
}