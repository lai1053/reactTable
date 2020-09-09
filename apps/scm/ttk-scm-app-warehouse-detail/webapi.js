/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    inventoryDetail: {
        query: (option) => fetch.post('/v1/biz/scm/st/rdrecord/queryenabletime', option),
        queryenabletime: (option) => fetch.post('/v1/biz/scm/st/rdrecord/queryenabletime', option),
	    initDetail: (option) => fetch.post('/v1/biz/scm/st/rptservice/initInventoryDetail',option),
        getInventoryDetail: (option) => fetch.post('/v1/biz/scm/st/rptservice/inventoryDetail',option),
        export: (option) => fetch.formPost('/v1/biz/scm/st/rptservice/exportInventoryDetail', option),
        print: (option) => fetch.printPost('/v1/biz/scm/st/rptservice/printInventoryDetail', option),
        delete: (option) => fetch.post('/v1/biz/scm/st/rdrecord/delete', option),
        delDetails: (option) => fetch.post('/v1/biz/scm/st/rdrecord/batchDeleteInventories', option),
        auditBatch: (option) => fetch.post('/v1/biz/scm/st/rdrecord/auditBatch', option),
        unauditBatch: (option) => fetch.post('/v1/biz/scm/st/rdrecord/unauditBatch', option),
        reCalcCost: (option) => fetch.post('/v1/biz/scm/st/rdrecord/reCalcCost', option),
        queryRecoilPEList: (option) => fetch.post('/v1/biz/scm/st/estimate/queryRecoilPEList', option),
        createRecoilBill: (option) => fetch.post('/v1/biz/scm/st/estimate/createRecoilBill', option),
        queryPurchaseBackwashed: (option) => fetch.post('/v1/biz/scm/st/relation/queryPurchaseBackwashed', option),
    }
}