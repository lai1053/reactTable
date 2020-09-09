//import config from './config'
//import * as data from './data'

export default {
	name: "app-proof-of-list-import",
	version: "1.0.0",
	moduleName: '凭证管理',
	description: "凭证管理-导入",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "app-proof-of-list-import")
	}
}