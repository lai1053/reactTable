//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-detailedHabit-card",
	version: "1.0.4",
	moduleName:'出入库明细表凭证习惯',
	description: "出入库明细表凭证习惯",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-detailedHabit-card")
	}
}