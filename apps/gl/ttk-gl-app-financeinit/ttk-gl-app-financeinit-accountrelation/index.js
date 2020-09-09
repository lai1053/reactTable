//import config from './config'
//import * as data from './data'
export default {
	name: "ttk-gl-app-financeinit-accountrelation",
	version: "1.0.1",
	moduleName: '财务',
	description: "财务期初-科目初始化",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-gl-app-financeinit-accountrelation")
	}
}