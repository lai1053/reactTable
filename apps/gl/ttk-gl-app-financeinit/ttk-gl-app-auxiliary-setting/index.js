//import config from './config'
//import * as data from './data'
export default {
    name: "ttk-gl-app-auxiliary-setting",
    version: "1.0.0",
    moduleName: '财务',
    description: "财务期初-辅助核算设置",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-gl-app-auxiliary-setting")
    }
}