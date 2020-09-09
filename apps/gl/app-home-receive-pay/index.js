//import config from './config'
// import * as data from './data'
// import component from './component'
// import action from './action'
// import reducer from './reducer'

export default {
	name: "app-home-receive-pay",
	version: "1.0.0",
	moduleName:'财务',
	description: "应收应付",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "app-home-receive-pay")
	}
}