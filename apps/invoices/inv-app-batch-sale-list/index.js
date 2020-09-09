export default {
    name: 'inv-app-batch-sale-list',
    version: "1.0.0",
    moduleName: '发票台账列表',
    description: '发票台账列表',
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "inv-app-batch-sale-list")
    }
}