//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-app-estimate-import",
	version: "1.0.0",
	moduleName: '暂估期初',
	description: "暂估期初导入",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-app-estimate-import")
	}
}