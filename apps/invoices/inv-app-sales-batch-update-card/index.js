export default {
    name: 'inv-app-sales-batch-update-card',
    version: "1.0.0",
    moduleName: '批量修改销项发票',
    description: '批量修改销项发票',
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "inv-app-sales-batch-update-card")
    }
}