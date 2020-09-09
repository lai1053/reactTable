/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
    profitStatement: {
		init: (option) => fetch.post('/v1/gl/report/profitStatement/init', option),
		query: (option) => fetch.post('/v1/gl/report/profitStatement/getData', option),
		print: (option) => fetch.printPost('/v1/gl/report/profitStatement/print', option),
		export: (option) => fetch.formPost('/v1/gl/report/profitStatement/export', option),
		share: (option) => fetch.post('/v1/gl/report/profitStatement/share', option),
		getCarryForwardingFlag: () => fetch.post('/v1/gl/job/getCarryForwardingFlag'),
		getPrintConfig: (option) => fetch.post('/v1/gl/report/profitStatement/getPrintConfig', option),
		savePrintConfig: (option) => fetch.post('/v1/gl/report/profitStatement/savePrintConfig', option), 
	}
}
