//import config from './config'
//import * as data from './data'

export default {
	name: "inv-app-fastAuthentication-upsecret",
	version: "1.0.0",
	moduleName: '发票采集',
	description: "密钥",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "inv-app-fastAuthentication-upsecret")
	}
}