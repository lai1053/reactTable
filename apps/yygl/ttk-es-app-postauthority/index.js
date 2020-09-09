//import config from './config'
//import * as data from './data'

export default {
    name: "ttk-es-app-postauthority",
    version: "1.0.0",
    moduleName: "管理",
    description: "岗位权限",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-es-app-postauthority")
    }
}