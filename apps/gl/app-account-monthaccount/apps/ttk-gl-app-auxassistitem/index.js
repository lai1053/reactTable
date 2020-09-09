//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-gl-app-auxassistitem",
	version: "1.0.0",
	moduleName: '财务-科目对照',
	description: '添加辅助项',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-gl-app-auxassistitem")
	}
}
