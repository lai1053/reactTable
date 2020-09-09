//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-es-app-org",
	version: "1.0.10",
	moduleName: "新代账",
    description: "纳税人信息",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-es-app-org")
	}
}