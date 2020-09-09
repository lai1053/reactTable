//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-ba-app-subjects-create-inventory",
	version: "1.0.0",
    moduleName: "基础档案",
    description: "科目生成档案-存货",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-ba-app-subjects-create-inventory")
	}
}
