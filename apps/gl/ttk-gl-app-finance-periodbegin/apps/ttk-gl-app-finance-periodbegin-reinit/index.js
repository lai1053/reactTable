//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-gl-app-finance-periodbegin-reinit",
	version: "1.0.1",
	moduleName: '财务',
	description: '财务期初初始化',
	description: "ttk-gl-app-finance-periodbegin-reinit",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-gl-app-finance-periodbegin-reinit")
	}
}
