//import config from './config'
//import * as data from './data'

export default {
	name: "app-proof-of-charge-common",
	version: "1.0.0",
	moduleName: '财务',
	description: '常用模板管理',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "app-proof-of-charge-common")
	}
}
