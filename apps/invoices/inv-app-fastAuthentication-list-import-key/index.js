export default {
	name: 'inv-app-fastAuthentication-list-import-key',
	version: "1.0.0",
	moduleName: '更新秘钥',
	description: '更新秘钥',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "inv-app-fastAuthentication-list-import-key")
	}
}