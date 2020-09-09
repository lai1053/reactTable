import webapi from './webapi'
// import logo_erp from '../../../assets/img/logo_erp.png'
// import logo_zc from '../../../assets/img/logo_zc.png'
import logo_min from './img/logo-min.png'

var _options = {
	webapi,
	goAfterLogout: {
		appName: 'ttk-dzgl-app-login',
		appParams: {}
	},
	goDanhu: {
		appName: 'edfx-app-portal',
		appParams: {}
	},
	logo_erp: logo_min,
	logo_zc:logo_min,
	logo_min
}

function config(options) {
	if (options) {
		Object.assign(_options, options)
	}
}

config.current = _options

export default config
