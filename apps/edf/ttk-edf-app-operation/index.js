//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-edf-app-operation",
	version: "1.0.0",
	description: "ttk-edf-app-operation",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-edf-app-operation")
	}
}