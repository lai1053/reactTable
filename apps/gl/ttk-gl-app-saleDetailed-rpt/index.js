//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-gl-app-saleDetailed-rpt",
	version: "1.0.1",
	moduleName: '财务',
	description: "销售明细表",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-gl-app-saleDetailed-rpt")
	}
}