//import config from './config'
//import * as data from './data'

export default {
	name: "app-common-iframe",
	version: "1.0.0",
	description: "app-common-iframe",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "app-common-iframe")
	}
}