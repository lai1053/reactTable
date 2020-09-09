export default {
    name: 'inv-app-sales-jdcxsfp',
    version: "1.0.0",
    moduleName: '机动车销售发票(销项)-新增',
    description: '机动车销售发票(销项)-新增',
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "inv-app-sales-jdcxsfp")
    }
}