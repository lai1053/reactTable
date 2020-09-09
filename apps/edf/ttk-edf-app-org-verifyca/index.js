//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-edf-app-org-verifyca",
	version: "1.0.1",
	moduleName: '系统管理',
	description: '验证CA',
	description: "ttk-edf-app-org-verifyca",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-edf-app-org-verifyca")
	}
}
