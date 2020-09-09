// import config from './config'
// import * as data from './data'

export default {
	name: 'ttk-scm-app-voucher-ueight',
	version: "1.0.0",
	moduleName: 'U8凭证管理',
	description: 'U8凭证管理',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-app-voucher-ueight")
	}
}