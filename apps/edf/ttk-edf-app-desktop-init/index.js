//import config from './config'
// import * as data from './data'
// import component from './component'
// import action from './action'
// import reducer from './reducer'

export default {
	name: 'ttk-edf-app-desktop-init',
	version: "1.0.0",	
	moduleName: '初始化',
	description: '初始化',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-edf-app-desktop-init")
	}
}