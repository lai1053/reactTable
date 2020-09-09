//import config from './config'
//import * as data from './data'

export default {
    name: "ttk-es-app-ztmanage-regain-query",
    version: "1.0.0",
    moduleName: "恢复账套查询",
    description: "恢复账套查询",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-es-app-ztmanage-regain-query")
    }
}