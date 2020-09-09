export default {
    name: 'ttk-es-app-ztconnetlist',
    version: "1.0.0",
    moduleName: "账套链接",
    description: "公告列表",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-es-app-ztconnetlist")
    }
}