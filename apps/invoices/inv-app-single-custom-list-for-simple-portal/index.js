export default {
    name: 'inv-app-single-custom-list-for-simple-portal',
    version: "1.0.0",
    moduleName: '票据发票采集单户',
    description: '简单门户调用的票据发票采集单户',
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "inv-app-single-custom-list-for-simple-portal")
    }
}