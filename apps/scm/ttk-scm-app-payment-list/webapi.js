/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import {fetch} from 'edf-utils'

export default {
	payment: {
		init: (option) => fetch.post('/v1/biz/scm/arap/payList/init', option),
		audit: (option) => fetch.post('/v1/biz/scm/arap/pay/audit', option),
		unaudit: (option) => fetch.post('/v1/biz/scm/arap/pay/unaudit', option),
		allAudit: (option) => fetch.post('/v1/biz/scm/arap/pay/auditBatch', option),
		allUnaudit: (option) => fetch.post('/v1/biz/scm/arap/pay/unauditBatch', option),
		delete: (option) => fetch.post('/v1/biz/scm/arap/pay/delete', option),
		allDelete: (option) => fetch.post('/v1/biz/scm/arap/pay/deleteBatch', option),
		bankAccount: (option) => fetch.post('/v1/ba/bankAccount/queryList', option),
		export: (option) => fetch.formPost('/v1/biz/scm/arap/payList/export', option),
		batchUpdate: (option) => fetch.post('/v1/edf/columnDetail/save', option), //批量保存栏目明细
		reInitByUser: (option) => fetch.post('/v1/edf/column/reInitByUser', option),//栏目重新初始化，恢复成预置数据
        findByParam: (option) => fetch.post('/v1/edf/column/findByParam', option),
        updateWithDetail: (option) => fetch.post('/v1/edf/column/updateWithDetail', option),
        batchUpdate: (option) => fetch.post('/v1/edf/columnDetail/save', option) //批量保存栏目明细
	}
}
