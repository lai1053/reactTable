import config from './config'
//import * as data from './data'

export default {
	name: "edfx-app-root",
	version: "1.0.6",
	description: "edfx-app-root",
	meta: null,
	components: [],
	config: config,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'))
		}, "edfx-app-root")
	}
}