//import config from './config'
//import * as data from './data'
export default {
	name: "ttk-gl-app-sourceaccount-auxlist",
	version: "1.0.0",
	moduleName: '财务期初',
	description: "科目重新匹配-原科目辅助项",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-gl-app-sourceaccount-auxlist")
	}
}