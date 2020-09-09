import { Toast, Notification, Modal, Popconfirm, localeWrapper, Alert } from 'edf-component'
import { fetch, environment } from 'edf-utils'
// import { websql } from './../../../mk-js/core/mk-orm/src'
//import { websql } from 'mk-orm'
// import './mock.js' //脱离后台测试，启用mock，否则这行注释

var _options = {}

//配置fetch
fetch.config({
	mock: false, //脱离后台测试，启用mock，否则这行注释

	//fetch支持切面扩展（before,after），对restful api统一做返回值或者异常处理
	after: (response, url, data, header) => {
		// console.log(JSON.stringify({
		// 	url, data, vale: response.value
		// }))

		if (response.result) {
			if (response.token) { //登录后设置accessToken,根据需要调整
				fetch.config({ token: response.token })
			}
			if (url === '/v1/edf/user/login' || url === '/v1/edf/omp/login' || url === '/v1/edf/user/create' || url === '/v1/edf/org/checkCanUpdatePeriod' || url === '/v1/edf/connector/accessLogin'|| url === '/v1/edf/mini/login' || url === '/v1/edf/orgreportconvert/accessLogin') {
				return response
			}
			return response.value
		}
		else {
			if (data && data.isReturnValue) {
				return response
			}
			else {
				let errorCode = ''
				if (response.error && response.error.code) {
					errorCode = response.error.code
				}
				if (environment.isDevMode()) {
					//开发环境
					if (errorCode == '40100') {
						window.location.href = gotoLogin()
					}
					else{
						Modal.error({ title: '错误:' + errorCode || '', okText: '关闭', width: 600, bodyStyle: 'height:300px;overflow:auto;', content: response.error.message })
					}
				}
				else {
					//正式环境
					Toast.error(response.error.message)
					if (errorCode == '40100') {
						window.location.href = gotoLogin()
					}
					//Modal.error({ title: '错误：', okText: '关闭', content: response.error.code })
				}
				if (url === '/v1/edf/user/login' || url === '/v1/edf/org/checkCanUpdatePeriod') {
					return response
				}
				return
			}
		}
	}
})

function config(options) {
	Object.assign(_options, options)

	//对应用进行配置，key会被转换为'^<key>$'跟app名称正则匹配
	_options.apps && _options.apps.config({
		'*': {
			//webapi,//正式网站应该有一个完整webapi对象，提供所有web请求函数
			webProvider: fetch.mock,
			//dbProvider: websql,
			dbConfig: {
				name: 'test'
			},
		},
		'edfx-app-root': {
			startAppName: 'ttk-access-app-tranreport',
		}
	})

	//require('./mock.js')
	_options.targetDomId = 'app' //react render到目标dom
	_options.startAppName = 'edfx-app-root' //启动app名，需要根据实际情况配置

	_options.toast = Toast //轻提示使用组件，edf-meta-engine使用
	_options.notification = Notification //通知组件
	_options.modal = Modal //模式弹窗组件
	_options.popconfirm = Popconfirm //confirm提示组件
	_options.alert = Alert //alert
	_options.rootWrapper = (child) => localeWrapper('zh-CN', child) //国际化处理
	return _options
}

function gotoLogin(url) {
	return window.location.protocol + '//' + window.location.host
}

config.current = _options

export default config
