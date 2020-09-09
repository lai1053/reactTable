//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-app-expense-list",
	moduleName: '业务',
	description: '费用单单列表',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-app-expense-list")
	}
}