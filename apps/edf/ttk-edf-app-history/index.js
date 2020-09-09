//import config from './config'
//import * as data from './data'

export default {
	name: 'ttk-edf-app-history',
	version: "1.0.0",	
	moduleName: '历史更新',
	description: '历史更新',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-edf-app-history")
	}
}