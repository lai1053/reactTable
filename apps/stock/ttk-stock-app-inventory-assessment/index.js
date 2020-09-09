import PrintButton from '../components/common/PrintButton'
export default {
	name: 'ttk-stock-app-inventory-assessment',
	version: "1.0.0",
	moduleName: '模块名称',
	description: '测试页名称',
	meta: null,
	components: [{
		name: 'PrintButton',
		component: PrintButton
	}],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "ttk-stock-app-inventory-assessment")
	}
}