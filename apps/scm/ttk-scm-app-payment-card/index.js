//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-app-payment-card",
	version: "1.0.2",
	moduleName: '业务',
	description: "付款单",
	meta: null,
	components: [],
	//dependencies:['mk-aar-grid'],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-app-payment-card")
	}
}
