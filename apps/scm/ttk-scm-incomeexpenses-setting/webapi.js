/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch, fetchCors } from 'edf-utils'

export default {
    incomeexpenses: {
        queryCategory: () => fetch.post('/v1/biz/core/businessType/queryCategory'),
        queryChild: (option) => fetch.post('/v1/biz/core/businessType/queryChild', option),
        delete: (option) => fetch.post('/v1/biz/core/businessType/delete', option),
        deleteBatch: (option) => fetch.post('/v1/biz/core/businessType/deleteBatch', option),
        update: (option) => fetch.post('/v1/biz/core/businessType/update', option),
        queryPageByAccountType: (option) => fetch.post('/v1/biz/core/docTemplate/queryPageByAccountType', option),

    },
    tplus: {
        configQuery: (option) => fetch.post('/v1/edf/linkConfig/query', option),//查询配置
        configExist: (option) => fetch.post('/v1/edf/linkConfig/exist', option),//是否有配置
        auditBatchForTPlusSa: (option) => fetch.post('/v1/biz/scm/sa/delivery/auditBatchForTPlus', option),//
        updateBatchForTPlusSa: (option) => fetch.post('/v1/biz/scm/sa/delivery/updateBatchForTPlus', option),//
        common: (url, params, options) => fetchCors.post(url, params, options),//跨域通用接口
        querySettleTemplate: (option) => fetch.post('/v1/biz/core/docTemplate/queryBankAccountMappingList', option),//结算方式
        queryTaxTemplate: (option) => fetch.post('/v1/biz/core/docTemplate/queryTaxTemplate', option),//增值税
    }
}