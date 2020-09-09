//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-gl-app-asset-list",
	version: "1.0.0",
	moduleName: '资产',
	description: "导账资产列表",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-gl-app-asset-list")
	}
}