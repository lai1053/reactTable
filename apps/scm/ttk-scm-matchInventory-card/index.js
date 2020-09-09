//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-matchInventory-card",
	version: "1.0.4",
	moduleName:'业务生成档案规则',
	description: "匹配存货",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-matchInventory-card")
	}
}