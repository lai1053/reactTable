/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
	tax: {
		getNewSbse: (option) => fetch.post('/v1/yygl/ysdj/getSbtz', option),	//
		refreshSbtz: (option) => fetch.post('/v1/yygl/ysdj/refreshSbtz', option),	//
		queryTaxAccountInner: (option) => fetch.post('/v1/tax/xdz/queryTaxAccountInner', option),	//
		exportExcel: (option) => fetch.formPost('/v1/yygl/ysdj/export', option),	//导出excel
		taxProgressExport: (option) => fetch.formPost('/v1/tax/xdz/taxProgressExport', option),	//导出excel
		getYsdjUrl: (option) => fetch.post('/v1/tax/ysdj/getSbtzJkxxUrl', option),

		
	}
}