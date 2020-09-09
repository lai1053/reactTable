//import config from './config'
//import * as data from './data'

export default {
    name: "app-card-oldTaxNum",
    version: "1.0.0",
    moduleName: "企业信息",
    description: "旧税号卡片",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "app-card-oldTaxNum")
    }
}
