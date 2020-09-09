import webapi from './webapi'

var _options = {
	webapi,
	goAfterLogin: {
		appName: 'edfx-app-portal',
		appParams: {}
	},
	goRegister:{
		appName: 'edfx-app-register',
		appParams: {}
	},
	goForgot:{
		appName: 'edfx-app-forgot-password',
		appParams: {}
	},
	goGlPortal: {
		appName: 'ttk-edf-app-dzgl-portal',
		appParams: {}
	},
	goDzglRegister: {
		appName: 'ttk-dzgl-app-register-choose',
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