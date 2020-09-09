//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-app-warehouse-detail",
	version: "1.0.0",
	moduleName: '出入库明细表',
	description: "出入库明细表",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-app-warehouse-detail")
	}
}