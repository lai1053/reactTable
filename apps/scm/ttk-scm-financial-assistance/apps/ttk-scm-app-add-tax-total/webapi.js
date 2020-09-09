/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch, fetchCors } from 'edf-utils'

export default {
	addTaxTotal: {
		common: (url, params, options) => fetchCors.post(url, params, options),//跨域通用 自定义url
		queryMappingList: (option) => fetch.post('/v1/ba/customer/queryMappingList', option),//查询列表
		setMapping: (option) => fetch.post('/v1/ba/customer/setMapping', option),//修改
		configQuery: (option) => fetch.post('/v1/edf/linkConfig/query', option),//查询配置
		configExist: (option) => fetch.post('/v1/edf/linkConfig/exist', option),//是否有配置
		query: (option) => fetch.post('/v1/tax/jchelper/query', option),//是否有配置
		getSystemDate: (option) => fetch.post('/v1/edf/org/getSystemDate', option),
		export: (option) => fetch.formPost('/v1/tax/jchelper/export', option),
		print: (option) => fetch.printPost('/v1/tax/jchelper/print', option)
	}
}