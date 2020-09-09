//import config from './config'
//import * as data from './data'

export default {
	name: "app-account-subjects-accounting",
	version: "1.0.0",
	moduleName: '财务',
	description: "辅助核算项目结转",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "app-account-subjects-accounting")
	}
}