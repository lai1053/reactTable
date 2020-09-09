/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    certificate: {
        init: (option) => fetch.post('/v1/gl/doc/init', option),
        create: (option) => fetch.post('/v1/gl/doc/create', option),
        update: (option) => fetch.post('/v1/gl/doc/update', option),
        del: (option) => fetch.post('/v1/gl/doc/delete', option),
        audit: (option) => fetch.post('/v1/gl/doc/audit', option),
        antiAudit: (option) => fetch.post('/v1/gl/doc/unAudit', option),
        prev: (option) => fetch.post('/v1/gl/doc/previousDoc', option),
        next: (option) => fetch.post('/v1/gl/doc/nextDoc', option),
        findById: (option) => fetch.post('/v1/gl/doc/findById', option),
        getAccountBalance: (option) => fetch.post('/v1/gl/doc/getAccountBalance', option),
        getAccountsBalance: (option) => fetch.post('/v1/gl/doc/getAccountsBalance', option), //批量获取科目余额
        getNewDocCode: (option) => fetch.post('/v1/gl/doc/getNewDocCode', option),
        print: (option) => fetch.printPost('/v1/gl/docManage/print', option),
        updateEnclosure: (option) => fetch.post('/v1/gl/doc/updateEnclosure', option),
        download: (option) => fetch.post('/v1/edf/file/download',option),
        getPrintConfig: () => fetch.post('v1/gl/docManage/printConfig', {}),
        getBaseArchive: (option) => fetch.post('v1/gl/doc/queryItemInfo', option),
        copyDoc: (option) => fetch.post('/v1/gl/docManage/copyDoc', option),
        copyDocBatch: (option) => fetch.post('/v1/gl/docManage/copyDocBatch', option),
        createBatchForCopy: (option) => fetch.post('/v1/gl/doc/createBatchForCopy', option),
        used: (option) =>  fetch.post('/v1/gl/account/isUsedInCertificate', option),
        getAccountPeriodsBalance: (option) =>  fetch.post('/v1/gl/doc/getAccountPeriodsBalance', option),
    },
    summary: {
        query: (option) => fetch.post('/v1/ba/summary/queryList', option)
    },
    accountingSubject: {
        query: (option) => fetch.post('/v1/gl/account/query', option),
        add: (option) =>  fetch.post('/v1/gl/account/create', option)
    },
    currency: {
        queryList: (option) => fetch.post('/v1/ba/currency/queryList', option),
        update: (option) => fetch.post('/v1/ba/currency/update', option)
    },
    commonDoc: {
        query: (option) => fetch.post('/v1/gl/commonDoc/query', option),
        findById: (option) => fetch.post('/v1/gl/commonDoc/findById', option)
    }
}
