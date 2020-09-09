//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-app-split-sheet",
	version: "1.0.2",
	moduleName: '拆分',
	description: "拆分列表",
	meta: null,
	components: [],
	//dependencies:['mk-aar-grid'],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-app-split-sheet")
	}
}