/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
	cashflowstatement: {
		query: () => fetch.post('/v1/gl/report/cashFlowStatement/periodBeginInit', {}),
		save: (option) => fetch.post('/v1/gl/report/cashFlowStatement/savePeriodBegin', option),
		init: (option) => fetch.post('/v1/gl/report/cashFlowStatement/init', option),
		periodBeginInit: () => fetch.post('/v1/gl/report/cashFlowStatement/periodBeginInit'),
		// savePeriodBegin: (option) => fetch.post('/v1/gl/report/cashFlowStatement/savePeriodBegin', option)
    }
}