export default {
    name: "ttk-edf-app-manage-import",
    version: "1.0.0",
    moduleName: '系统管理',
    description: "导入账套",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-edf-app-manage-import")
    }
}