//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-es-app-download-taxpayer-information",
	version: "1.0.0",
	moduleName: '客户资料',
	description: '下载纳税人信息',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-es-app-download-taxpayer-information")
	}
}
