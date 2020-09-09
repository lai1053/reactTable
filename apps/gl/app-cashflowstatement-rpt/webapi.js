/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
    cashFlowStatement: {

		init: (option) => fetch.post('/v1/gl/report/cashFlowStatement/init', option),
		query: (option) => fetch.post('/v1/gl/report/cashFlowStatement/getData', option),
		print: (option) => fetch.printPost('/v1/gl/report/cashFlowStatement/print', option),
		export: (option) => fetch.formPost('/v1/gl/report/cashFlowStatement/export', option),
		periodBeginInit: () => fetch.post('/v1/gl/report/cashFlowStatement/periodBeginInit'),
		share: (option) => fetch.post('/v1/gl/report/cashFlowStatement/share', option),
		getRoleDtoList: () => fetch.post('/v1/ba/userRole/canDisplayOriginalButton'),
		getCarryForwardingFlag: () => fetch.post('/v1/gl/job/getCarryForwardingFlag'),
		queryDocCashFlowData: (option) => fetch.post('/v1/gl/report/cashFlowStatement/queryDocCashFlowData', option),
		getPrintConfig: (option) => fetch.post('/v1/gl/report/cashFlowStatement/getPrintConfig', option),
		savePrintConfig: (option) => fetch.post('/v1/gl/report/cashFlowStatement/savePrintConfig', option), 
	}
}