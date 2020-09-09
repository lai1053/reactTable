//import config from './config'
//import * as data from './data'

export default {
	name: "app-card-assets",
	version: "1.0.0",
	description: "app-card-assets",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "app-card-assets")
	}
}