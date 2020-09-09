//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-incomeexpenses-setting",
	version: "1.0.4",
	moduleName:'设置',
	description: "收支类型设置",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-incomeexpenses-setting")
	}
}