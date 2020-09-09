import webapi from './webapi'
// import logo from '../../../assets/img/logo.png'
import bar from './img/bar.png'

var _options = {
	webapi,
	goLogin: {
		appName: 'ttk-dzgl-app-login',
		appParams: {

		}
	},
	goAfterLogin: {
		appName: 'portal',
		appParams: {}
	},
	goOrgRegister: {
		appName: 'ttk-dz-app-orgregister',
		appParams: {}
	},
	logo: bar,
	bar: bar,
	goForgot: {
		appName: 'ttk-dzgl-app-forget-password',
		appParams: {}
	},
}

function config(options) {
	if (options) {
		Object.assign(_options, options)
	}
}

config.current = _options

export default config
