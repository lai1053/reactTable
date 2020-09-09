//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-es-app-ztmanage-import-success",
	version: "1.0.0",
	moduleName: '账套管理',
	description: '导入成功信息提示',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-es-app-ztmanage-import-success")
	}
}
