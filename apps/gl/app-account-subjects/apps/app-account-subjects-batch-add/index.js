//import config from './config'
//import * as data from './data'

export default {
	name: "app-account-subjects-batch-add",
	version: "1.0.0",
	moduleName: '财务',
	description: "科目批量新增",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "app-account-subjects-batch-add")
	}
}