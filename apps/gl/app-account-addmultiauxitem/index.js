//import config from './config'
//import * as data from './data'

export default {
	name: "app-account-addmultiauxitem",
	version: "1.0.0",
	moduleName: '财务',
	description: '期初余额新增辅助项',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "app-account-addmultiauxitem")
	}
}
