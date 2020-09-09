//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-app-subject-card",
	version: "1.0.4",
	moduleName:'科目启用设置',
	description: "科目启用设置弹框",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-app-subject-card")
	}
}