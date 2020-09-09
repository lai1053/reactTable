//import config from './config'
//import * as data from './data'

export default {
	name: "app-account-final-cetficate",
	version: "2.0.0",
	moduleName: '财务',
	description: '期末凭证',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "app-account-final-cetficate")
	}
}
