export default {
	name: 'inv-app-check-certification-filter',
	version: "1.0.0",
	moduleName: '勾选发票——筛选条件',
	description: '勾选发票——筛选条件',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "inv-app-check-certification-filter")
	}
}