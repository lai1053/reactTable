//import config from './config'
//import * as data from './data'

export default {
    name: "app-auxbalancesum-rpt",
    version: "1.0.1",
    moduleName: '财务',   
    description: "辅助余额表(辅助科目/科目辅助)",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "app-auxbalancesum-rpt")
    }
}