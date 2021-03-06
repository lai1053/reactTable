//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-edf-app-html2json",
	version: "1.0.0",
	moduleName: '系统管理',
	description: 'HTML转换页面模型',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-edf-app-html2json")
	}
}