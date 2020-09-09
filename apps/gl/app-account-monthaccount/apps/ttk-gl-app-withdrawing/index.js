//import config from './config'
//import * as data from './data'
export default {
    name: "ttk-gl-app-withdrawing",
    version: "1.0.0",
    moduleName: '财务',
    description: "期末凭证-计提附加税费",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-gl-app-withdrawing")
    }
}