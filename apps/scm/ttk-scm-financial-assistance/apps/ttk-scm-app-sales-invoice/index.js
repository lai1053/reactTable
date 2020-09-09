//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-app-sales-invoice",
	version: "1.0.0",
	moduleName: '对接金财助手',
	description: "销项发票明细",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-app-sales-invoice")
	}
}