


export default {
	name: "app-purchase-look",
	version: "1.0.0",
	description: "app-purchase-look",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "app-purchase-look")
	}
}