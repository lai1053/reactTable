//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-app-unit-list",
	version: "1.0.0",
    moduleName: "基础档案",
    description: "计量单位列表",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-app-unit-list")
	}
}