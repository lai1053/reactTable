/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
	importapi: {
		/**
         * 数据初始化（获取手工匹配科目列表）
         */
		getGlAccountList: (option) => fetch.post('/v1/gl/imp/getGlAccountList', option),
		/**
         * 保存（保存手工匹配结果）
         */
		setImpGlAccountRelation: (option) => fetch.post('/v1/gl/imp/setImpGlAccountRelation', option),		
	}
}