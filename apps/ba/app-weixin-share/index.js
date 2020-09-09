//import config from './config'
//import * as data from './data'

export default {
	name: "app-weixin-share",
	version: "1.0.0",
	moduleName:'财务',
	description: "微信/QQ分享",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "app-weixin-share")
	}
}