export default {
    name: 'inv-app-sales-export-card',
    version: "1.0.0",
    moduleName: '导出销项发票',
    description: '导出销项发票',
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "inv-app-sales-export-card")
    }
}