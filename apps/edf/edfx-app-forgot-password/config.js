import webapi from './webapi'

var _options = {
	webapi,
	goLogin:{
		appName: 'edfx-app-login',
		appParams: {}
	}
}

function config(options) {
	if (options) {
		Object.assign(_options, options)
	}
}

config.current = _options

export default config