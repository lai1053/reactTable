//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-tplus-inventory-card",
	version: "1.0.4",
	moduleName:'设置',
	description: "新增收支类型",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-tplus-inventory-card")
	}
}