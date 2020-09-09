import webapi from './webapi'

var _options = {
	webapi,
	assessment: {
		appName: 'ttk-scm-app-inventory-assessment',
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