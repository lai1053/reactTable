/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
	importapi: {
		/**
         * 数据列表
         */
		getDisplayDate: () => fetch.post('/v1/gl/report/queryDate', {}), 
		querySofttype: () => fetch.post('/v1/edf/importaccount/querySofttype',{}),
		botImpInit: () => fetch.post('/v1/edf/importaccount/botImpInit',{}),	
		/**
         * 登陆
         */
		createTask: (option) => fetch.post('/v1/edf/importaccount/createTask', option),	
		
	}
}