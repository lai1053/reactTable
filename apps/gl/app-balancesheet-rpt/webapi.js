/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
	balancesheet: {
		init: (option) => fetch.post('/v1/gl/report/balanceSheet/init', option),
		query: (option) => fetch.post('/v1/gl/report/balanceSheet/getData', option),
		print: (option) => fetch.printPost('/v1/gl/report/balanceSheet/print', option),
		export: (option) => fetch.formPost('/v1/gl/report/balanceSheet/export', option),
		share: (option) => fetch.post('/v1/gl/report/balanceSheet/share', option),
		resetArApAccount: (option) => fetch.post('v1/gl/report/balanceSheet/getParam', option),
		portal: () => fetch.post('/v1/gl/portal/init'),
		getPrintConfig: (option) => fetch.post('/v1/gl/report/balanceSheet/getPrintConfig', option),
		savePrintConfig: (option) => fetch.post('/v1/gl/report/balanceSheet/savePrintConfig', option), 
		getCarryForwardingFlag: () => fetch.post('/v1/gl/job/getCarryForwardingFlag')
	}
}