/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch, fetchCors } from 'edf-utils'

export default {
	addTax: {
		common: (url, params, options) => fetchCors.post(url, params, options),//跨域通用 自定义url
		queryMappingList: (option) => fetch.post('/v1/ba/customer/queryMappingList', option),//查询列表
		setMapping: (option) => fetch.post('/v1/ba/customer/setMapping', option),//修改
		configQuery: (option) => fetch.post('/v1/edf/linkConfig/query', option),//查询配置
		configExist: (option) => fetch.post('/v1/edf/linkConfig/exist', option),//是否有配置
		query: (option) => fetch.post('/v1/tax/jchelper/query', option),//是否有配置
		getSystemDate: (option) => fetch.post('/v1/edf/org/getSystemDate', option),//是否有配置
		load: () => {
			return {
				list: [
					{
						"month": 1,
						"YNSEHJ": 1,
						"BQYJSE": 1,
						"ZYXSEFSL": 1,
						"ZXSESFL": 1,
						"ASYSLJSXSE": 1,
						"AJYBFJSXSE": 1,
						"MDTBFCKXSE": 1,
						"MSXSE": 1,
						"XXSE": 1,
						"JXSE": 1,
						"SQLDSE": 1,
						"JXSEZC": 1,
						"MDTYTSE": 1,
						"QMLDSE": 1,
						"JYBFJSDYNSE": 1,
					},
					{
						"month": 2,
						"YNSEHJ": 2,
						"BQYJSE": 2,
						"ZYXSEFSL": 2,
						"ZXSESFL": 2,
						"ASYSLJSXSE": 2,
						"AJYBFJSXSE": 2,
						"MDTBFCKXSE": 2,
						"MSXSE": 2,
						"XXSE": 2,
						"JXSE": 2,
						"SQLDSE": 2,
						"JXSEZC": 2,
						"MDTYTSE": 2,
						"QMLDSE": 2,
						"JYBFJSDYNSE": 2,
					},
					{
						"month": 3,
						"YNSEHJ": 3,
						"BQYJSE": 3,
						"ZYXSEFSL": 3,
						"ZXSESFL": 3,
						"ASYSLJSXSE": 3,
						"AJYBFJSXSE": 3,
						"MDTBFCKXSE": 3,
						"MSXSE": 3,
						"XXSE": 3,
						"JXSE": 3,
						"SQLDSE": 3,
						"JXSEZC": 3,
						"MDTYTSE": 3,
						"QMLDSE": 3,
						"JYBFJSDYNSE": 3,
					},{

					},{
						
					},{
						
					},{
						
					},{
						
					}
				]
			}
		},
		export: (option) => fetch.formPost('/v1/tax/jchelper/export', option),
		print: (option) => fetch.printPost('/v1/tax/jchelper/print', option)
	}
}