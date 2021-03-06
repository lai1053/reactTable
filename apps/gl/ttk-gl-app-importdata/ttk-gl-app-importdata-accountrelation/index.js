//import config from './config'
//import * as data from './data'
export default {
	name: "ttk-gl-app-importdata-accountrelation",
	version: "1.0.1",
	moduleName: '财务',
	description: "导账-科目对照",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-gl-app-importdata-accountrelation")
	}
}