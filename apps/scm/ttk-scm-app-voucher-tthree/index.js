// import config from './config'
// import * as data from './data'

export default {
	name: 'ttk-scm-app-voucher-tthree',
	version: "1.0.0",
	moduleName: 'K3WISE凭证管理',
	description: 'K3WISE凭证管理',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-app-voucher-tthree")
	}
}