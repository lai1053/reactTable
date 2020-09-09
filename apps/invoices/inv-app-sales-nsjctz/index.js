export default {
    name: 'inv-app-sales-nsjctz',
    version: "1.0.0",
    moduleName: '纳税检查调整(销项)-新',
    description: '纳税检查调整(销项)-新',
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "inv-app-sales-nsjctz")
    }
}