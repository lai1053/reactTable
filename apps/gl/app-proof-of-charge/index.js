//import config from './config'
//import * as data from './data'
// import MoneyCellHeader from './components/moneyCellHeader' //'./components/moneyCellHeader'
// import MoneyCell from './components/moneyCell' //'./components/moneyCell'
// import SubjectDisplay from './components/subjectDisplay'
// import QuanAndForeCurrency from './components/quanAndForeCurrency'

export default {
	name: "app-proof-of-charge",
	version: "1.0.0",
	moduleName: '财务',
	description: '填制凭证',
	meta: null, 
	// components: [{
	// 	//appName:'app-proof-of-charge',
	// 	name: 'MoneyCellHeader',
	// 	component: MoneyCellHeader
	// },{
	// 	//appName:'app-proof-of-charge',
	// 	name: 'MoneyCell',
	// 	component: MoneyCell
	// },{
	// 	//appName:'app-proof-of-charge',
	// 	name: 'SubjectDisplay',
	// 	component: SubjectDisplay
	// },{
	// 	//appName:'app-proof-of-charge',
	// 	name: 'QuanAndForeCurrency',
	// 	component: QuanAndForeCurrency
	// }],
	config: null,
	load: (cb) => {
		require.ensure([], require => {
			cb(require('./component'), require('./action'), require('./reducer'), require('./data'), require('./config'))
		}, "app-proof-of-charge")
	}
}
