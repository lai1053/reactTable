//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-es-app-customerassign-modal",
	version: "1.0.0",
	moduleName: '客户分配',
	description: '客户分配弹窗',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-es-app-customerassign-modal")
	}
}
