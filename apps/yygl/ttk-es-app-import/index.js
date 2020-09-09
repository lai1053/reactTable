//import config from './config'
//import * as data from './data'

export default {
    name: "ttk-es-app-import",
    version: "1.0.0",
    moduleName: "基础档案",
    description: "人员导入卡片",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-es-app-import")
    }
}