//import config from './config'
//import * as data from './data'
export default {
    name: "ttk-gl-app-importdata-success",
    version: "1.0.0",
    moduleName: '财务',
    description: "导账-完成",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-gl-app-importdata-success")
    }
}