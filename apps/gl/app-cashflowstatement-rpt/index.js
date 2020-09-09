//import config from './config'
//import * as data from './data'

export default {
	name: "app-cashflowstatement-rpt",
	version: "1.0.0",
	moduleName: '财务',
	description: "现金流量表",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "app-cashflowstatement-rpt")
	}
}