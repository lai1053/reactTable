/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
	financeinit: {
		/**
         * 重新匹配界面初始化接口
         */
		reHandMatchInit: (option) => fetch.post('/v1/gl/accountPeriodBegin/reHandMatchInit', option),
		/**
         * 重新匹配确定接口
         */
		reHandMatch: (option) => fetch.post('/v1/gl/accountPeriodBegin/reHandMatch', option),		
	}
}