/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
    downloadPdf4Rz: (option) => fetch.post('/v1/biz/scm/invoice/downloadPdf4Rz', option),
    refreshResult: (option) => fetch.post('/v1/biz/scm/pu/arrival/updateArrivalAuthenticateStatus', option),
    send: (option) => fetch.post('/v1/biz/scm/invoice/send', option),
    collecteData1: (option) => fetch.post('/v1/biz/scm/invoice/collecteDataAsync', option),//采集发票第一步
    asyncRequestResult: (option, date) => fetch.post2('/v1/biz/scm/invoice/asyncRequestResult', option, date),//采集发票第二步
    init: (option) => fetch.post('/v1/biz/scm/pu/arrival/queryListAuthenticated', option), //列表初始化
    queryInvoiceSum:(option)=>fetch.post('/v1/biz/scm/sa/delivery/queryAuthenticateNegativeRate',option),
    hasReadSJInfo: (option) => fetch.post('/v1/edf/dlxx/hasReadSJInfo', option),
    getNoDisplay: (option) => fetch.post('/v1/biz/scm/invoice/getNoDisplay ', option),//
}
