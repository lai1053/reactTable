//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-app-inventory",
	version: "1.0.0",
	moduleName: '存货台账',
	description: "存货台账",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-app-inventory")
	}
}