import webapi from './webapi'

var _options = {
	webapi,
	goAfterLogin: {
		appName: 'edfx-app-portal',
		appParams: {}
	},
	goRegister:{
		appName: 'ttk-dzgl-app-register',
		appParams: {}
	},
	goRegisterCheck:{
		appName: 'ttk-dzgl-app-register-choose',
		appParams: {}
	},
	goForgot:{
		appName: 'ttk-dzgl-app-forget-password',
		appParams: {}
	},
	goGlPortal: {
		appName: 'ttk-edf-app-dzgl-portal',
		appParams: {}
	},
	goDzglRegister: {
		appName: 'ttk-dzgl-app-register',
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
