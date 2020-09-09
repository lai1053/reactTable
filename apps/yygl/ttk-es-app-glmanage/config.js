import webapi from './webapi'

var _options = {
	webapi,
	goAfterLogout: {
		appName: 'edfx-app-login',
		appParams: {}
	},
	goDzgl: {
		appName: 'ttk-edf-app-dzgl-portal',
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
