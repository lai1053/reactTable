//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-app-inventory-type-setting",
	version: "1.0.4",
	moduleName:'存货档案',
	description: "设置存货类型",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-app-inventory-type-setting")
	}
}