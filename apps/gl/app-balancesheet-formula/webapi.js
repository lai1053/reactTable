/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
	balancesheet: {
		getReportEditFormulaPageInfoForDoc: (option) => fetch.post('/v1/gl/reportTemplate/getReportEditFormulaPageInfoForDoc',option),
		getReportEditFormulaPageInfoForAdd: (option) => fetch.post('/v1/gl/reportTemplate/getReportEditFormulaPageInfoForAdd', option),//确定按钮接口
		getCalMoneyForAddFormula: (option) => fetch.post('/v1/gl/reportTemplate/getCalMoneyForAddFormula', option),//添加按钮接口
		resetReportTemplateFormula: (option) => fetch.post('/v1/gl/reportTemplate/resetReportTemplateFormula', option),//重置按钮接口
	}
}