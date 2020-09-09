//import config from './config'
//import * as data from './data'

export default {
	name: "edfx-business-subject-card",
	version: "1.0.4",
	moduleName:'设置',
	description: "科目设置卡片",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "edfx-business-subject-card")
	}
}