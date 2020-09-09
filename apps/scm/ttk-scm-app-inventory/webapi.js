/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    inventory: {
        initSummaryRpt: (option) => fetch.post('/v1/biz/scm/st/rptservice/initSummaryRpt', option),
        getInventory: (option) => fetch.post('/v1/biz/scm/st/rptservice/inventorySummary', option),
        query: (option) => fetch.post('/v1/biz/scm/st/rdrecord/queryenabletime', option),
        export: (option) => fetch.formPost('/v1/biz/scm/st/rptservice/exportInventorySummary', option),
        print: (option) => fetch.printPost('/v1/biz/scm/st/rptservice/printInventorySummary', option),
        reCalcCost: (option) => fetch.post('/v1/biz/scm/st/rdrecord/reCalcCost', option),
        auditBatch: (option) => fetch.post('/v1/biz/scm/st/rdrecord/auditBatch', option),
        unauditBatch: (option) => fetch.post('/v1/biz/scm/st/rdrecord/unauditBatch', option),
        unauditAndauditBatch: (option) => fetch.post('/v1/biz/scm/st/rdrecord/unauditAndauditBatch', option),
        //暂估台账
        queryLedgerPEList: (option) => fetch.post('/v1/biz/scm/st/estimate/queryLedgerPEList', option),
        exportLedgerPEList: (option) => fetch.formPost('/v1/biz/scm/st/estimate/exportLedgerPEList', option),
        printLedgerPEList: (option) => fetch.printPost('/v1/biz/scm/st/estimate/printLedgerPEList', option),
    }
}