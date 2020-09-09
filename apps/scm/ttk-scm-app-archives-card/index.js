//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-app-archives-card",
	version: "1.0.4",
	moduleName:'发票自动生成档案设置',
	description: "发票自动生成档案设置弹框",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-app-archives-card")
	}
}