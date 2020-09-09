//import config from './config'
//import * as data from './data'

export default {
    name: "edf-company-manage",
    version: "1.0.0",
    moduleName: '系统管理',
    description: "企业管理",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "edf-company-manage")
    }
}