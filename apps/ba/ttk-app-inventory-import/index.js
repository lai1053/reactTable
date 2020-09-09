//import config from './config'
//import * as data from './data'

export default {
    name: "ttk-app-inventory-import",
    version: "1.0.0",
    moduleName: "基础档案",
    description: "存货-导入",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-app-inventory-import")
    }
}