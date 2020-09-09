export default {
    name: 'inv-app-pu-collect-card',
    version: "1.0.0",
    moduleName: '一键读取销项',
    description: '一键读取销项',
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "inv-app-pu-collect-card")
    }
}