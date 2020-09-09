//import config from './config'
//import * as data from './data'

export default {
	name: 'ttk-dzgl-app-frame',
	version: "1.0.0",	
	moduleName: '管理端frame',
	description: '管理端frame',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-dzgl-app-frame")
	}
}