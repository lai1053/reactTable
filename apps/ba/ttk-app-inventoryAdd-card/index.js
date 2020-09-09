//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-app-inventoryAdd-card",
	version: "1.0.4",
	moduleName:'存货',
	description: "批量新增",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-app-inventoryAdd-card")
	}
}