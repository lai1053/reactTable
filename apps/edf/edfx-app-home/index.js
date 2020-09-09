//import config from './config'
//import * as data from './data'

export default {
	name: "edfx-app-home",
	version: "1.0.4",
	moduleName: "系统管理",
    description: "我的桌面",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "edfx-app-home")
	}
}