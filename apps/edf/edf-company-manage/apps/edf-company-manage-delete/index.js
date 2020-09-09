//import config from './config'
//import * as data from './data'

export default {
	name: "edf-company-manage-delete",
	version: "1.0.0",
	description: "edf-company-manage-delete",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "edf-company-manage-delete")
	}
}
