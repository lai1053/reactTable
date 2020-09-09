//import config from './config'
//import * as data from './data'

export default {
    name: "ttk-es-app-job-account",
    version: "1.0.0",
    moduleName: "统计",
    description: "工作统计",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-es-app-job-account")
    }
}