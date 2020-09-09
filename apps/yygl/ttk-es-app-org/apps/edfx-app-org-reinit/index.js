//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-es-app-org-reinit",
	version: "1.0.0",
	description: "ttk-es-app-org-reinit",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-es-app-org-reinit")
	}
}