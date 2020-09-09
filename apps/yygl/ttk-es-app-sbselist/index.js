//import config from './config'
//import * as data from './data'

export default {
    name: "ttk-es-app-sbselist",
    version: "1.0.0",
    moduleName: "统计",
    description: "申报税额",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-es-app-sbselist")
    }
}