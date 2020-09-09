import 'whatwg-fetch'
import {
	isAcrobatInstalledInIE
} from '../../../../../utils/fetch/pdfplugin'
import { environment } from 'edf-utils'
const {getBrowserVersion, isClientMode} = environment

const mockApi = {}
const mockData = {}
const _options = {}

export function config(options) {
	Object.assign(_options, options)
	if (options.token) {
		setAccessToken(options.token)
	}
}

export function mock(url, handler) {
	if (url && typeof url == "object") {
		Object.keys(url).forEach(u => {
			mock(u, url[u])
		})
	} else if (url.indexOf("*") != -1) {
		let paths = url.split('*')
		let pre = paths.shift()
		Object.keys(handler).forEach(key => {
			let theUrl = pre + key + paths.join('*')
			mock(theUrl, handler[key])
		})
	} else {
		mockApi[url] = handler;
	}
}




export function post(url, data, headers, option) {

	headers = {
		method: 'POST',
		//mode: 'cors',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'ttkhost': getIframeUrl(),
			...headers,
			token: getAccessToken()
		},
		body: JSON.stringify(data)
	}

	return new Promise((resolve, reject) => {
		fetch(url, headers)
			.then(function (response) {
				if (response.status == 504 || response.status == 502) {
					return {
						sysNetException: true
					}
					//return reject(response)
				}
				else if (response.status == 500 || response.status == 403 || response.status == 0) {
					return {
						networkException: true
					}
				}
				if(data && data.blob) {
					return response.blob()
				}
				return response.json()
			})
			.then(responseJson => {
				// responseJson = after(responseJson, url, data, headers)
				resolve(responseJson)
			})
			.catch(function (error) {
				if (error) {
					if (error.message && error.message.toLowerCase().indexOf('fetch') > -1) {
						return {
							networkException: true
						}
					}
				}
				return reject(error)
			})
	})

}



export function printPost(url, data, isFree) {
	data = data || {}

	var accessToken = getAccessToken()
	if (!!accessToken && !isFree) {
		data.token = accessToken
	}

	var keys = Object.keys(data)
	var tempWindow

	if (!!data['tempWindow']) {
		tempWindow = data['tempWindow']
	}

	if (!isAcrobatInstalledInIE()) {
		if (tempWindow != undefined) {
			tempWindow.close()
		}
		return
	}

	var postForm = document.createElement("form"),
		formatedUrl = formatUrl(url),
		index = 0

	postForm.method = "post"
	postForm.target = "_blank"

	for (var k of keys) {
		if (k == 'tempWindow') {
			continue
		}

		let val = data[k] == null ? false : true
		if (val) {
			var hiddenInput = document.createElement("input")
			hiddenInput.setAttribute("name", k)
			if (typeof data[k] == "object") {
				hiddenInput.setAttribute("value", JSON.stringify(data[k]))
				if (index == 0) {
					formatedUrl = formatedUrl + '?' + k + '=' + JSON.stringify(data[k])
				} else {
					formatedUrl = formatedUrl + '&' + k + '=' + JSON.stringify(data[k])
				}
			} else {
				hiddenInput.setAttribute("value", data[k])
				if (index == 0) {
					formatedUrl = formatedUrl + '?' + k + '=' + data[k]
				} else {
					formatedUrl = formatedUrl + '&' + k + '=' + data[k]
				}
			}
			index++
			postForm.appendChild(hiddenInput)
		}
	}
	let browserType = getBrowserVersion()

	if (tempWindow != undefined) {
		tempWindow.location.href = formatedUrl
		return
	}

	// if (isClientMode() && formatedUrl) {
	// 	//client模式下打开，chrome模式.防止token被截取
	// 	window.open(formatedUrl, "_blank")
	// 	return
	// }
	// // Edge、微信浏览器通过URL传递token等参数
	// else if (browserType && (browserType.edge || browserType.wechat)) {
	// 	//解决edge MicrosoftEdge 20.10240.16384.0 版本中弹不出打印页面得问题
	// 	window.open(formatedUrl, "_blank")
	// 	return;
	// } else {
		postForm.action = formatUrl(url)
	// }

	document.body.appendChild(postForm)
	postForm.submit()
	document.body.removeChild(postForm)
}


export function setApiRootPath(path) {
	if (path && path[path.length - 1] == ".") path = "https://" + path + "aierp.cn";
	else if (path && path.indexOf('/') != 0 && path.indexOf("http") != 0) path = "/" + path;
	sessionStorage['_apiRootPath'] = path;
}

function formatUrl(url) {
	return window.location.protocol + '//' + window.location.host + url
}

function getIframeUrl() {
	let _url = '';
	if (parent !== window) {
		var txtObject = window.name || '';
		if (txtObject.indexOf(';ttkhost=') > -1) {
			_url = txtObject.split(';ttkhost=')[1];
		}
		_url = _url ? _url : ''
		if (_url) {
			let regurl = _url.match(/^http(s)?:\/\/(.*?)\//)
			if (Array.isArray(regurl)) {
				if (regurl.length > 0) {
					_url = regurl[0];
				}
			}
		}
	}
	return _url;
}


function getAccessToken() {
	return sessionStorage['_accessToken'] || ''
}

function setAccessToken(token) {
	sessionStorage['_accessToken'] = token
}

function clearAccessToken() {
	sessionStorage['_accessToken'] = ''
}

export default {
	post,
	printPost
}
