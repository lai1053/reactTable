//import config from './config'
//import * as data from './data'

export default {
    name: "ttk-es-app-mybusiness",
    version: "1.0.0",
    moduleName: "商机",
    description: "商机列表",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-es-app-mybusiness")
    }
}