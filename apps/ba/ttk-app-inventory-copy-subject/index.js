//import config from './config'
//import * as data from './data'

export default {
    name: "ttk-app-inventory-copy-subject",
    version: "1.0.0",
    moduleName: "基础档案",
    description: "科目复制档案",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-app-inventory-copy-subject")
    }
}