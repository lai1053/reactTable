//import config from './config'
//import * as data from './data'

export default {
    name: "ttk-edf-app-tax-type-change",
    version: "1.0.0",
    moduleName: "企业信息",
    description: "税费种选择",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-edf-app-tax-type-change")
    }
}
