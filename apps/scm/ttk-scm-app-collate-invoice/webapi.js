/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch, fetchCors } from 'edf-utils'

export default {
    // 往来科目
    queryAccountSa: (option) => fetch.post('/v1/biz/scm/sa/delivery/queryAccount', option),
    queryAccountPu: (option) => fetch.post('/v1/biz/scm/pu/arrival/queryAccount', option),
    getSupplier: (option) => fetch.post('/v1/biz/scm/invoice/supplier/query', option), // 供应商档案列表
    updateSupplier: (option) => fetch.post('/v1/biz/scm/invoice/supplier/updateBatch', option),
    getCustomer: (option) => fetch.post('/v1/biz/scm/invoice/customer/query', option),  // 供应商档案列表
    updateCustomer: (option) => fetch.post('/v1/biz/scm/invoice/customer/updateBatch', option),
    getSubject: (option) => fetch.post('/v1/biz/scm/invoice/queryAccountByName', option),
    getCustomerOption: (option) => fetch.post('/v1/ba/customer/queryList', option),  // 供应商下拉
    getSupplierOption: (option) => fetch.post('/v1/ba/supplier/queryList', option),  // 供应商下拉
    setAccountCustomer: (option) => fetch.post('/v1/ba/customer/setAccountRelationship', option),  // 自动生成往来科目
    setAccountSupplier: (option) => fetch.post('/v1/ba/supplier/setAccountRelationship', option),  // 自动生成往来科目
    saveCustomerAccountBatch: (option) => fetch.post('/v1/biz/scm/sa/delivery/saveCustomerAccountBatch', option),  // 客户保存接口
    saveSupplierAccountBatch: (option) => fetch.post('/v1/biz/scm/pu/arrival/saveSupplierAccountBatch', option),  // 供应商保存接口
    queryAccountByNameAutomatic: (option) => fetch.post('/v1/biz/scm/invoice/queryAccountByNameAutomatic', option),

    //结算科目
    settleSaBatch: (option) => fetch.post('/v1/biz/scm/sa/delivery/settleBatch', option),//销项批量结算
    saSettleList: (option) => fetch.post('/v1/biz/scm/sa/delivery/listSellte', option),//销项结算科目列表
    puSettleList: (option) => fetch.post('/v1/biz/scm/pu/arrival/listSettle', option),//进项结算科目列表
    settlePuBatch: (option) => fetch.post('/v1/biz/scm/pu/arrival/settleBatch', option),//进项批量结算
    checkAccountIsUsed: (option) => fetch.post('/v1/biz/scm/account/enable/checkAccountIsUsed', option),//检测科目是否有发生额
    archivesGenerationArrival: (option) => fetch.post('/v1/biz/scm/pu/arrival/archivesGeneration', option),//批量生成档案及明细科目
    archivesGenerationDelivery: (option) => fetch.post('/v1/biz/scm/sa/delivery/archivesGeneration', option),//批量生成档案及明细科目

    //存货科目
    getInvoiceInvMatch: (option) => fetch.post('/v1/biz/scm/invoice/getInvoiceInvMatch', option),//列表
    accountQuery: (option) => fetch.post('/v1/gl/account/query', option),//存货科目
    inventory: (option) => fetch.post('/v1/biz/scm/sa/delivery/queryInventory', {}),//销项存货列表
    queryInventory: (option) => fetch.post('/v1/biz/scm/pu/arrival/queryInventory', option),//进项存货列表
    getInvoiceInvSave: (option) => fetch.post('/v1/biz/scm/invoice/saveInvoiceInvMatch', option),//保存
    getAuditPu: (option) => fetch.post('/v1/biz/scm/pu/arrival/auditBatch', option), // 进项生成凭证
    getAuditSa: (option) => fetch.post('/v1/biz/scm/sa/delivery/auditBatch', option), //销项生成凭证
    generateInventory: (option) => fetch.post('/v1/biz/scm/invoice/generateInventory', option), //批量生成存货
    generateInventoryAccount: (option) => fetch.post('/v1/biz/scm/invoice/generateInventoryAccount', option), //批量生成存货科目
    auditSa: (option) => fetch.post('/v1/biz/scm/sa/delivery/audit', option),//销项卡片生成凭证
    auditPu: (option) => fetch.post('/v1/biz/scm/pu/arrival/audit', option),//进项卡片生成凭证
    generateRevenueAccount: (option) => fetch.post('/v1/biz/scm/invoice/generateRevenueAccount', option),//自动生成收入科目
    queryRevenueAccount: (option) => fetch.post('/v1/biz/scm/invoice/queryRevenueAccount', option),//收入科目
    queryRevenueAccountForArrival: (option) => fetch.post('/v1/biz/scm/invoice/queryRevenueAccountForArrival', option),//存货科目
}