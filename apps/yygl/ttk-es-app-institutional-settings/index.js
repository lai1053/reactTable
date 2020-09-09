export default {
    name: 'ttk-es-app-institutional-settings',
    version: "1.0.0",
    moduleName: '管理',
    description: '机构设置',
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-es-app-institutional-settings")
    }
}