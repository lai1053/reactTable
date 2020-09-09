//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-app-warehouse-import",
	version: "1.0.0",
	moduleName: '存货期初',
	description: "存货期初导入",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-app-warehouse-import")
	}
}