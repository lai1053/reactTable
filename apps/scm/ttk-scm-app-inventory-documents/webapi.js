/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

let prefix = "/v1/biz/scm/st/rdrecord/"

export default {
    inventoryDoc: {
        query: (option) => fetch.post('/v1/biz/scm/st/rdrecord/queryenabletime', option),
        getBussinessType: (option = {}) => fetch.post('/v1/biz/scm/st/rdrecord/bussinesstype', option),
        initCreate: (option) => fetch.post('/v1/biz/scm/st/rdrecord/initCreate', option),
        getcode: (option = {}) => fetch.post(`${prefix}getcode`, option),
        previous: (code) => fetch.post(prefix + 'previous', code),
        next: (code) => fetch.post(prefix + 'next', code),
        createApi: (option) => fetch.post(prefix + 'create', option),
        update: (option) => fetch.post(prefix + 'update', option),
        del: (option) => fetch.post(prefix + 'delete', option),
        findById: (option) => fetch.post(prefix + 'queryById', option),
        getSetting: (option={}) => fetch.post(prefix + 'settings', option),
        audit: (option) => fetch.post(prefix + 'audit', option),
        unaudit: (option) => fetch.post(prefix + 'unaudit', option),
        deleteBatch: (option) => fetch.post(prefix + 'deleteBatch', option),
        updateEnclosure: (option) => fetch.post(prefix + 'attachmentUpdate', option),
        queryBySupplier: (option) => fetch.post(prefix + 'queryBySupplier', option),
        updateWithDetail: (option) => fetch.post('v1/edf/voucher/updateWithDetail', option),
        reInitByUser: (option) => fetch.post('/v1/edf/voucher/reInitByUser', option),
        queryTime: () => fetch.post('v1/biz/scm/st/rdrecord/queryenabletime', {}),        
        getEnableDate: (option = {}) => fetch.post('/v1/biz/scm/st/rdrecord/queryenabletime', option),
        reCalcCost: (option) => fetch.post('/v1/biz/scm/st/rdrecord/reCalcCost', option),
        queryInventory: (option) => fetch.post('v1/ba/inventory/queryList', option), // 存货分类（/选择产成品生成）
        produceAccordToSales: (option) => fetch.post('v1/biz/scm/st/rdrecord/product/produceAccordToSales', option),  // 入库
        getCostKeeping: (option) => fetch.post('v1/biz/scm/st/rdrecord/product/getCostKeeping', option),  
        deleteAndProduceAccordToSales: (option) => fetch.post('v1/biz/scm/st/rdrecord/product/deleteAndProduceAccordToSales', option),  // 入库
        produceAccordToSalesMaterial: (option) => fetch.post('v1/biz/scm/st/rdrecord/material/produceAccordToSales', option), // 出库 
        deleteAndProduceAccordToSalesMaterial: (option) => fetch.post('v1/biz/scm/st/rdrecord/material/deleteAndProduceAccordToSales', option),  // 出库
        isNeedReCalcCost: (option) => fetch.post('v1/biz/scm/st/rdrecord/product/isNeedReCalcCost', option),  
        getCalcMode: (option) => fetch.post('/v1/biz/scm/st/rdrecord/getCalcMode', option), 
        totalAndAmount: (option) => fetch.post('/v1/biz/scm/st/rdrecord/material/totalAndAmount', option),
        queryMaterialPro: (option) => fetch.post('v1/biz/scm/st/rdrecord/loadMaterialInventoryList', option),// 存货分类（选择原料生成/）
        loadPeriodEndData: (option) => fetch.post('v1/biz/scm/st/rdrecord/material/loadPeriodEndData', option),// 存货结存  数据
        saveInfluenceRelation: (option) => fetch.post('v1/biz/scm/st/rdrecord/material/saveInfluenceRelation', option),// 保存匹配关系
        getInfluenceRelation: (option) => fetch.post('v1/biz/scm/st/rdrecord/material/getInfluenceRelation', option),// 获取匹配关系
        auditBatch: (option) => fetch.post('/v1/biz/scm/st/rdrecord/auditBatch', option),//生成凭证
        unauditBatch: (option) => fetch.post('/v1/biz/scm/st/rdrecord/unauditBatch', option),//删除凭证
        initRatioAccountList: (option) => fetch.post('v1/biz/scm/st/rdrecord/initRatioAccountList', option),
        queryRecoilPEList: (option) => fetch.post('/v1/biz/scm/st/estimate/queryRecoilPEList', option),
        createRecoilBill: (option) => fetch.post('/v1/biz/scm/st/estimate/createRecoilBill', option),
        queryPurchaseBackwashed: (option) => fetch.post('/v1/biz/scm/st/relation/queryPurchaseBackwashed', option),
    },
    queryByparamKeys: (option) => fetch.post('/v1/edf/orgparameter/queryByparamKeys', option)
}