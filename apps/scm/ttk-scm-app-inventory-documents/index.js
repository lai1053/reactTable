//import config from './config'
//import * as data from './data'

export default {
	name: "ttk-scm-app-inventory-documents",
	version: "1.0.2",
	moduleName: '库存单据',
	description: "库存单据",
	meta: null,
	components: [],
	//dependencies:['mk-aar-grid'],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-scm-app-inventory-documents")
	}
}