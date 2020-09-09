//import config from './config'
//import * as data from './data'

export default {
    name: "ttk-gl-app-financeinit-enterprise",
    version: "1.0.0",
    moduleName: '财务',
    description: "财务期初-入口",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-gl-app-financeinit-enterprise")
    }
}