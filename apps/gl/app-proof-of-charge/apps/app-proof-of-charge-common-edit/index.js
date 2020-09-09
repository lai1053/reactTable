export default {
	name: "app-proof-of-charge-common-edit",
	version: "1.0.0",
	moduleName: '财务',
	description: '填制凭证',
	meta: null, 
	// components: [{
	// 	//appName:'app-proof-of-charge-common-edit',
	// 	name: 'MoneyCellHeader',
	// 	component: MoneyCellHeader
	// },{
	// 	//appName:'app-proof-of-charge-common-edit',
	// 	name: 'MoneyCell',
	// 	component: MoneyCell
	// },{
	// 	//appName:'app-proof-of-charge-common-edit',
	// 	name: 'SubjectDisplay',
	// 	component: SubjectDisplay
	// },{
	// 	//appName:'app-proof-of-charge-common-edit',
	// 	name: 'QuanAndForeCurrency',
	// 	component: QuanAndForeCurrency
	// }],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "app-proof-of-charge-common-edit")
	}
}
