import config from './config'
import * as data from './data'
export default {
    name: "inv-app-check-certification-list",
    version: "1.0.0",
    moduleName: "勾选认证",
    description: "勾选认证（已包含“勾选发票”和“勾选确认”）",
    meta: data.getMeta(),
    components: [],
    config: config,
    load: (cb) => {
        // require.ensure是啥
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'))
        }, "inv-app-check-certification-list")
    }
}