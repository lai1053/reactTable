export default {
    name: "ttk-edf-app-order-detail",
    version: "1.0.0",
    moduleName: '系统管理',
    description: "订单详情",
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "ttk-edf-app-order-detail")
    }
}