//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-automatic-generation-setting",
	version: "1.0.4",
	moduleName: "业务",
    description: "发票自动生成档案设置",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-automatic-generation-setting")
	}
}