export default {
    name: 'inv-app-product-select',
    version: "1.0.0",
    moduleName: '商品信息选择',
    description: '商品信息选择',
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "inv-app-product-select")
    }
}