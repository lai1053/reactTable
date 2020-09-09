//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-dzgl-app-agreement",
	version: "1.0.0",
	moduleName: "系统管理",
	description: "服务条款",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-dzgl-app-agreement")
	}
}
