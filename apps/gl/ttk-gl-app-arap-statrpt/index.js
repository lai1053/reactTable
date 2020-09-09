//import config from './config'
//import * as data from './data'

export default {
    name: "ttk-gl-app-arap-statrpt",
    version: "1.0.1",
    moduleName: '财务',
    description: "应收统计表",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-gl-app-arap-statrpt")
    }
}
