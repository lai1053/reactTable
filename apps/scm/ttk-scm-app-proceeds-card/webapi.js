/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import {fetch} from 'edf-utils'

let prefix = "/v1/biz/scm/pu/arrival/"

export default {
	// arrival: {
	// 	// init: (option) => fetch.post('/v1/web/biz/scm/pu/arrival/init', option),
	// 	init: (option) => fetch.post('/v1/biz/scm/pu/arrival/init', option),
	// 	previous: (code) => fetch.post(prefix + 'previous', code),
	// 	next: (code) => fetch.post(prefix + 'next', code),
	// 	create: (option) => fetch.post(prefix + 'create', option),
	// 	update: (option) => fetch.post(prefix + 'update', option),
	// 	del: (option) => fetch.post(prefix + 'delete', option),
	// 	audit: (option) => fetch.post(prefix + 'audit', option),
	// 	unaudit: (option) => fetch.post(prefix + 'unaudit', option),
	// 	// queryByCustomer: (option) => fetch.post('/v1/web/arrival/queryByCustomer', option),
	// 	deleteBatch: (option) => fetch.post(prefix + 'deleteBatch', option),
	// 	auditBatch: (option) => {
	// 		throw '请实现批量审核功能'
	// 	},//fetch.post('v1/arrival/auditBatch', option),
	// 	// updateEnclosure: (option) => fetch.post('/v1/biz/scm/pu/arrival/attachmentUpdate', option)
	// 	updateEnclosure: (option) => fetch.post(prefix + 'attachmentUpdate', option),
	// 	queryBySupplier: (option) => fetch.post(prefix + 'queryBySupplier', option)
	// },
	proceedsCard: {
		updateEnclosure: (option) => fetch.post('/v1/biz/scm/arap/receive/attachmentUpdate', option),
		init: (option) => fetch.post('/v1/biz/scm/arap/receive/init', option),
		previous: (code) => fetch.post('/v1/biz/scm/arap/receive/previous', code),
		next: (code) => fetch.post('/v1/biz/scm/arap/receive/next', code),
		create: (option) => fetch.post('/v1/biz/scm/arap/receive/create', option),
		update: (option) => fetch.post('/v1/biz/scm/arap/receive/update', option),
		audit: (option) => fetch.post('/v1/biz/scm/arap/receive/audit', option),
		unaudit: (option) => fetch.post('/v1/biz/scm/arap/receive/unaudit', option),
		allAudit: (option) => fetch.post('/v1/biz/scm/arap/receive/auditBatch', option),
		allUnaudit: (option) => fetch.post('/v1/biz/scm/arap/receive/unauditBatch', option),
		delete: (option) => fetch.post('/v1/biz/scm/arap/receive/delete', option),
		allDelete: (option) => fetch.post('/v1/biz/scm/arap/receive/deleteBatch', option),
		bankAccount: (option) => fetch.post('/v1/ba/bankAccount/queryList', option),
		updateWithDetail: (option) => fetch.post('v1/edf/voucher/updateWithDetail', option),
		reInitByUser: (option) => fetch.post('/v1/edf/voucher/reInitByUser', option),
		customer: (option) => fetch.post('v1/ba/customer/queryList', option),
		supplier: (option) => fetch.post('v1/ba/supplier/queryList', option),
		person: (option) => fetch.post('v1/ba/person/queryList', option),
	}
}
