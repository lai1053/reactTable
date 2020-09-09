export default {
	name: 'inv-app-deduct-list',
	version: "1.0.0",
	moduleName: '抵扣统计——头部筛选条件',
	description: '抵扣统计——头部筛选条件',
	meta: null,
	components: [],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "inv-app-deduct-list")
	}
}