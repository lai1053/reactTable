//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-tplus-batch-get-current-account",
	version: "1.0.4",
	moduleName:'设置',
	description: "批量生成往来科目",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-tplus-batch-get-current-account")
	}
}