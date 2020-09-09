


export default {
	name: "assessment-chonghui",
	version: "1.0.0",
	description: "assessment-chonghui",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "assessment-chonghui")
	}
}