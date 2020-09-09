//import config from './config'
//import * as data from './data'

export default {
	name: "app-scm-accountdescription-kthree",
	version: "1.0.4",
	moduleName:'业务',
	description: "对接财务帐套使用说明",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "app-scm-accountdescription-kthree")
	}
}