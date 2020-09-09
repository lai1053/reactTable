//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-app-collate-invoice-batch-update-inventory-account",
	version: "1.0.4",
	moduleName:'设置',
	description: "新增科目",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-app-collate-invoice-batch-update-inventory-account")
	}
}