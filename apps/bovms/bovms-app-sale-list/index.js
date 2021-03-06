export default {
    name: 'bovms-app-sale-list',
    version: "1.0.0",
    moduleName: '业务-销项列表',
    description: '业务-销项列表',
    meta: null,
    components: [],
    config: null,
    load: (cb) => {
        require.ensure([], require => {
            cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
        }, "bovms-app-sale-list")
    }
}