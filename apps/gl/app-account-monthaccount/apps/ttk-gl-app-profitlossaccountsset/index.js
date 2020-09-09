export default {
	name: 'ttk-gl-app-profitlossaccountsset',
	version: "1.0.0",
	moduleName: '财务',
	description: '结账（结转汇兑损益-科目设置）',
	meta: null,	
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-gl-app-profitlossaccountsset")
	}
}