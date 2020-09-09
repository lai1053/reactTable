//import config from './config'
//import * as data from './data'

export default {
    name: "app-card-customer-category",
    version: "1.0.0",
    moduleName: "分类设置",
    description: "客户卡片",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "app-card-customer-category")
    }
}