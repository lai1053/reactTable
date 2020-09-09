


export default {
	name: "assessmen-zangu",
	version: "1.0.0",
	description: "assessmen-zangu",
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "assessmen-zangu")
	}
}