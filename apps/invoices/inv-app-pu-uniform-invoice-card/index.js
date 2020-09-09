export default {
    name: 'inv-app-pu-uniform-invoice-card',
    version: "1.0.0",
    moduleName: '发票采集',
    description: '农产品销售（收购）发票',
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "inv-app-pu-uniform-invoice-card")
    }
}