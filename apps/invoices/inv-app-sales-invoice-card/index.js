export default {
    name: 'inv-app-sales-invoice-card',
    version: "1.0.0",
    moduleName: '销项发票查看页面',
    description: '销项发票查看页面',
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "inv-app-sales-invoice-card")
    }
}