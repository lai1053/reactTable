//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-es-app-sjxx",
	version: "1.0.0",
	moduleName: '商机管理',
	description: '选择商机类型',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-es-app-sjxx")
	}
}
