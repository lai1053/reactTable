//import config from './config'
// import * as data from './data'
// import component from './component'
// import action from './action'
// import reducer from './reducer'

export default {
	name: 'ttk-edf-app-article',
	version: "1.0.0",	
	moduleName: '金财学院',
	description: '金财学院',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-edf-app-article")
	}
}