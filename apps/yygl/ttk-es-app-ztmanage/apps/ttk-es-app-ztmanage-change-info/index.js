//import config from './config'
//import * as data from './data'

export default {
    name: "ttk-es-app-ztmanage-change-info",
    version: "1.0.0",
    moduleName: '系统管理',
    description: "新建企业",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-es-app-ztmanage-change-info")
    }
}