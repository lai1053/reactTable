import config from './config'
//import * as data from './data'

export default {
    name: "app-card-inventory-batch-change",
    version: "1.0.0",
    moduleName: "基础档案",
    description: "存货批量修改卡片",
    meta: null,
    components: [],
    config: config,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'))
        }, "app-card-inventory-batch-change")
    }
}
