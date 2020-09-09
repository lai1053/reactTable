export default {
    name: 'ttk-es-app-noticelist',
    version: "1.0.0",
    moduleName: "公告列表",
    description: "公告列表",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-es-app-noticelist")
    }
}