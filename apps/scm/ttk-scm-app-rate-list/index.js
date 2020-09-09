//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-app-rate-list",
	version: "1.0.0",
	moduleName: '毛利率',
	description: "毛利率表",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-app-rate-list")
	}
}