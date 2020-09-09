/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch, fetchCors } from 'edf-utils'

export default {
    tplus: {
        auditBatchForTPlusSa: (option) => fetch.post('/v1/biz/scm/sa/delivery/auditBatchForTPlus', option),//
        updateBatchForTPlusSa: (option) => fetch.post('/v1/biz/scm/sa/delivery/updateBatchForTPlus', option),//
        auditBatchForTPlusPu: (option) => fetch.post('v1/biz/scm/pu/arrival/auditBatchForTPlus', option),//
        updateBatchForTPluPu: (option) => fetch.post('/v1/biz/scm/pu/arrival/updateBatchForTPlus', option),//
        configQuery: (option) => fetch.post('/v1/edf/linkConfig/query', option),//查询配置
        common: (url, option, options) => fetchCors.post(url, option, options),//带url的跨域通用接口
        customer: (option) => fetch.post('/v1/ba/customer/queryMappingList', option),//客户列表
        supplier: (option) => fetch.post('/v1/ba/supplier/queryMappingList', option),//供应商列表
        inventory: (option) => fetch.post('/v1/ba/inventory/queryMappingList', option),//存货档案列表
        businessType: (option) => fetch.post('/v1/biz/core/businessType/queryChild', option),//收入类型费用类型列表
        settle: (option) => fetch.post('/v1/biz/core/docTemplate/queryBankAccountMappingList', option),//结算方式
        inventoryType: (option) => fetch.post('/v1/biz/core/docTemplate/queryPageByAccountType', option),//存货分类列表
        customerSet: (option) => fetch.post('/v1/ba/customer/setMapping', option),//设置客户
        inventorySet: (option) => fetch.post('/v1/ba/inventory/setMapping', option),//设置存货
        bussinessSet: (option) => fetch.post('/v1/biz/core/businessType/update', option),//收入类型费用类型设置
        settleSet: (option) => fetch.post('/v1/biz/core/docTemplate/saveBankAccountMapping', option),//修改结算方式
        supplierSet: (option) => fetch.post('/v1/ba/supplier/setMapping', option),//修改供应商
        inventoryTypeSet: (option) => fetch.post('/v1/biz/core/docTemplate/saveOrUpdate', option),//存货分类修改
        tax: (option) => fetch.post('/v1/biz/core/docTemplate/queryTaxTemplate', option),//增值税
        taxSet: (option) => fetch.post('/v1/biz/core/docTemplate/updateTaxTemplate', option),//增值税修改
        inventoryQuery: (option) => fetch.post('/v1/ba/inventory/queryList', option),//存货列表
        auditUpdateSa: (option) => fetch.post('/v1/biz/scm/sa/delivery/auditUpdate', option),
        auditUpdatePu: (option) => fetch.post('/v1/biz/scm/pu/arrival/auditUpdate', option),
        auditSa: (option) => fetch.post('/v1/biz/scm/sa/delivery/audit', option),
        auditPu: (option) => fetch.post('/v1/biz/scm/pu/arrival/audit', option),
        asset: (option) => fetch.post('/v1/biz/core/docTemplate/queryPageByAccountType', option),//资产
        saveAccount: (option) => fetch.post('/v1/biz/core/docTemplate/saveAccount', option),//保存科目
        generateArchive: (option) => fetch.post('/v1/biz/scm/invoice/generateArchive', option),//保存科目
        queryAccountEnable: (option) => fetch.post('/v1/biz/scm/account/enable/queryAccountEnable', option),
        saveRevenueAccount: (option) => fetch.post('/v1/biz/scm/sa/delivery/saveRevenueAccount', option),//对接保存收入科目
        ruleGet: (option) => fetch.post('/v1/biz/scm/archival/account/rule/get', option),//对接保存收入科目
        updateStarCode: (option) => fetch.post('/v1/biz/scm/archival/account/rule/updateStarCode', option)//对接保存收入科目
    }
}