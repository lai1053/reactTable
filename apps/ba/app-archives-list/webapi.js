/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
	query: {
		customer: (option) => fetch.post('v1/ba/customer/queryList', option),
		supplier: (option) => fetch.post('v1/ba/supplier/queryList', option),
		inventory: (option) => fetch.post('v1/ba/inventory/queryList', option),
		project: (option) => fetch.post('v1/ba/project/queryList', option),
		currency: (option) => fetch.post('v1/ba/currency/queryList', option),
		unit: (option) => fetch.post('v1/ba/unit/queryList', option),
		bankAccount: (option) => fetch.post('v1/ba/bankAccount/queryList', option),
    },
	delete: {
		customer: (option) => fetch.post('v1/ba/customer/delete', option),
		supplier: (option) => fetch.post('v1/ba/supplier/delete', option),
		inventory: (option) => fetch.post('v1/ba/inventory/delete', option),
		project: (option) => fetch.post('v1/ba/project/delete', option),
		currency: (option) => fetch.post('v1/ba/currency/delete', option),
		unit: (option) => fetch.post('v1/ba/unit/delete', option),
		bankAccount: (option) => fetch.post('v1/ba/bankAccount/delete', option),
	}
}