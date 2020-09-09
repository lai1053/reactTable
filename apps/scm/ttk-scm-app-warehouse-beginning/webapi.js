/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

let prefix = "/v1/biz/scm/pu/arrival/"

export default {
    warehouseBegin: {
        query: (option) => fetch.post('/v1/biz/scm/st/rdrecord/queryenabletime', option),
        initPeriodBegin: (option) => fetch.post('/v1/biz/scm/st/rdrecord/initPeriodBegin', option),
        savePeriodBegin: (option) => fetch.post('/v1/biz/scm/st/rdrecord/savePeriodBegin', option),
        export: (option) => fetch.formPost('/v1/biz/scm/st/rdrecord/export', option),
        print: (option) => fetch.printPost('/v1/biz/scm/st/rdrecord/print', option),
        account: (option) => fetch.post('/v1/gl/account/query', {isEnable: true, isEndNode: true }),
        synchronization: (option) => fetch.post('/v1/biz/scm/st/rdrecord/synchronizationAmountAndQuantity', option),//同步
        inventorySubject: (option) => fetch.post('/v1/biz/scm/st/rdrecord/saveInventoryAccountAndSync', option), // 存货对应科目

        //暂估期初
        queryList: (option) => fetch.post('/v1/biz/scm/st/estimate/queryList', option),
        supplier: (option) => fetch.post('/v1/ba/supplier/queryList', option),//供应商
        inventory: (option) => fetch.post('/v1/ba/inventory/queryList', option),//存货
        batchCreateAndUpdate: (option) => fetch.post('/v1/biz/scm/st/estimate/batchCreateAndUpdate', option),//保存
        printEstimate: (option) => fetch.printPost('/v1/biz/scm/st/estimate/printProvisionalEstimate', option),
        exportEstimate: (option) => fetch.printPost('/v1/biz/scm/st/estimate/exportProvisionalEstimate', option),
        
    },
    queryByparamKeys: (option) => fetch.post('/v1/edf/orgparameter/queryByparamKeys', option)
}