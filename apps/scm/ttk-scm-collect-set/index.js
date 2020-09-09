//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-collect-set",
	version: "1.0.4",
	moduleName:'业务生成档案规则',
	description: "生成档案规则设置",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-collect-set")
	}
}