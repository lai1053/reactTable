/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch,fetchCors } from 'edf-utils'

export default {
    incomeexpensesCard: {
        init: (option) => fetch.post('/v1/biz/core/businessType/init', option), 
        queryChild: (option) => fetch.post('/v1/biz/core/businessType/queryChild', option),
        create: (option) => fetch.post('/v1/biz/core/businessType/create', option),
        update: (option) => fetch.post('/v1/biz/core/businessType/update', option),
        query: (option) => fetch.post('/v1/gl/account/query', option),
        //saveSettleTemplate: (option) => fetch.post('/v1/biz/core/docTemplate/saveSettleTemplate', option),//修改结算凭证模板
        saveSettleTemplate:(option)=>fetch.post('/v1/biz/core/docTemplate/saveBankAccountMapping',option),
        saveOrUpdate: (option) => fetch.post('/v1/biz/core/docTemplate/saveOrUpdate', option),//修改存货类别
        updateTaxTemplate: (option) => fetch.post('/v1/biz/core/docTemplate/updateTaxTemplate', option),//修改增值税
        getQueryCode:(option) => fetch.post('/v1/biz/core/businessType/queryCode', option), // 新增收入类型编码
    },
    tplus:{
        common: (url, params, options) => fetchCors.post(url, params, options),//跨域通用接口
    }
}