//import config from './config'
//import * as data from './data'

export default {
	name: "app-sumaccount-rpt",
	version: "1.0.1",
	moduleName: '财务',
	description: "总账",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "app-sumaccount-rpt")
	}
}