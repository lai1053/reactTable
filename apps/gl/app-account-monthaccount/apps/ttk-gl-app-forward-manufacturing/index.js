//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-gl-app-forward-manufacturing",
	version: "2.0.0",
	moduleName: '财务',
	description: '设置页面(结转研发成本、结转制造费用)',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-gl-app-forward-manufacturing")
	}
}
