//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-app-cost-table",
	version: "1.0.0",	
	moduleName: '成本计算表',
	description: '成本计算表',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-app-cost-table")
	}
}