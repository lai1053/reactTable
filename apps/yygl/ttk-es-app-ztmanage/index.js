export default {
    name: 'ttk-es-app-ztmanage',
    version: "1.0.0",
    moduleName: "账套管理",
    description: "账套管理",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-es-app-ztmanage")
    }
}