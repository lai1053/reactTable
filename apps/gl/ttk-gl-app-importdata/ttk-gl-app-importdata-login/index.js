//import config from './config'
//import * as data from './data'
export default {
	name: "ttk-gl-app-importdata-login",
	version: "1.0.0",
	moduleName: '导账',
	description: "在线导账登陆",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-gl-app-importdata-login")
	}
}