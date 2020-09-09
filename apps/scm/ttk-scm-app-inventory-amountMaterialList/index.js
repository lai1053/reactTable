//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-app-inventory-amountMaterialList",
	version: "1.0.4",
	moduleName:'存货',
	description: "以销定产生成材料出库单",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-app-inventory-amountMaterialList")
	}
}