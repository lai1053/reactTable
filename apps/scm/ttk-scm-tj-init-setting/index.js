//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-tj-init-setting",
	version: "1.0.4",
	moduleName: "业务",
    description: "T+生成凭证",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-tj-init-setting")
	}
}