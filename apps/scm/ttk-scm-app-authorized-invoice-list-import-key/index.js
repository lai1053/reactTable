//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-app-authorized-invoice-list-import-key",
	version: "1.0.0",
	moduleName: '资产',
	description: "资产导入",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-app-authorized-invoice-list-import-key")
	}
}