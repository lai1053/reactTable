//import config from './config'
//import * as data from './data'

export default {
	name: "app-account-report",
	version: "1.0.1",
	description: "app-account-report",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "app-account-report")
	}
}