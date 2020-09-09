import webapi from './webapi'
import bar from './img/bar.png'

var _options = {
	webapi,
	goLogin:{
		appName: 'edfx-app-login',
		appParams: {
			
		}
	},
	goAfterLogin: {
		appName: 'edfx-app-portal',
		appParams: {}
	},
	goOrgRegister:{
			appName: 'edfx-app-orgregister',
			appParams: {}
		},
	bar: bar,
	goForgot:{
		appName: 'edfx-app-forgot-password',
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