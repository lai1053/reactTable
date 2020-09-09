//import config from './config'
//import * as data from './data'

export default {
	name: 'ttk-edf-app-beginner-guidance',
	version: "1.0.0",	
	moduleName: '新手引导',
	description: '新手引导',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-edf-app-beginner-guidance")
	}
}