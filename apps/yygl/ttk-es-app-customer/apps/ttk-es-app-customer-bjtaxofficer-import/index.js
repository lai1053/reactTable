//import config from './config'
//import * as data from './data'

export default {
    name: "ttk-es-app-customer-bjtaxofficer-import",
    version: "1.0.0",
    moduleName: "基础档案",
    description: "北京办税人员导入",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "tttk-es-app-customer-bjtaxofficer-import")
    }
}