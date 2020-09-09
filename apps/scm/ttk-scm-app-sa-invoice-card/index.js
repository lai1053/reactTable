//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-app-sa-invoice-card",
	version: "1.0.2",
	moduleName: '业务',
	description: '销项发票',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-app-sa-invoice-card")
	}
}