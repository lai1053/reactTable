//import config from './config'
//import * as data from './data'

export default {
	name: "edfx-app-my-setting-xdz-change-password",
	version: "1.0.0",
	moduleName: "系统管理",
    description: "修改密码",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "edfx-app-my-setting-xdz-change-password")
	}
}