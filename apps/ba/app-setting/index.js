//import config from './config'
//import * as data from './data'

export default {
	name: "app-setting",
	version: "1.0.0",
	description: "app-setting",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "app-setting")
	}
}