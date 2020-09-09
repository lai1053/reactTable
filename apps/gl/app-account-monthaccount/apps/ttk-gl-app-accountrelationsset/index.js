// import AuxCellShow from './components/auxCellShow'
export default {
	name: 'ttk-gl-app-accountrelationsset',
	version: "1.0.0",
	moduleName: '财务',
	description: '结账（结转销售成本-科目对应设置）',
	meta: null,
	// components: [
	// 	{
	// 		appName:'ttk-gl-app-accountrelationsset',
	// 		name: 'AuxCellShow',
	// 		component: AuxCellShow
	// 	}
	// ],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-gl-app-accountrelationsset")
	}
}