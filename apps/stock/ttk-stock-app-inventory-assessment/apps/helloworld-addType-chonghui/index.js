


export default {
	name: "helloworld-addType-chonghui",
	version: "1.0.0",
	description: "helloworld-addType-chonghui",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "helloworld-addType-chonghui")
	}
}