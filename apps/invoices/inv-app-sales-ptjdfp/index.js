export default {
    name: 'inv-app-sales-ptjdfp',
    version: "1.0.0",
    moduleName: '普通机打发票(销项)-新增',
    description: '普通机打发票(销项)-新增',
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "inv-app-sales-ptjdfp")
    }
}