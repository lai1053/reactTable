import webapi from './webapi'

var _options = {
	webapi,
  goTabTable:{
    appName:'ticket-tab-table',
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