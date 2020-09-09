/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch, fetchCors } from 'edf-utils'

let prefix = "/v1/biz/scm/sa/delivery/"

export default {
    queryAchivalAccount: (option) => fetch.post('/v1/biz/scm/sa/delivery/queryAchivalAccount', option),//
    saveAchivalAccount: (option) => fetch.post('/v1/biz/scm/sa/delivery/saveAchivalAccount', option),//
    getInvoiceInvMatch:(option)=>fetch.post('/v1/biz/scm/invoice/getInvoiceInvMatch',option),//列表
    checkAccountIsUsed: (option) => fetch.post('/v1/biz/scm/account/enable/checkAccountIsUsed', option),
    queryAccountEnable: (option) => fetch.post('/v1/biz/scm/account/enable/queryAccountEnable', option), //查询科目启用设置接口
    delivery: {
        // init: (option) => fetch.post('/v1/web/biz/scm/sa/delivery/init', option),
        init: (option) => fetch.post('/v1/biz/scm/sa/delivery/init', option),
        previous: (code) => fetch.post(prefix + 'previous', code),
        next: (code) => fetch.post(prefix + 'next', code),

        create: (option) => fetch.post(prefix + 'create', option),
        update: (option) => fetch.post(prefix + 'update', option),
        del: (option) => fetch.post(prefix + 'delete', option),
        audit: (option) => fetch.post(prefix + 'audit', option),
        unaudit: (option) => fetch.post(prefix + 'unaudit', option),
        queryByCustomer: (option) => fetch.post(prefix + 'queryByCustomer', option),
        updateEnclosure: (option) => fetch.post(prefix + 'attachmentUpdate', option),
        updateWithDetail: (option) => fetch.post('v1/edf/voucher/updateWithDetail', option),
        reInitByUser: (option) => fetch.post('/v1/edf/voucher/reInitByUser', option),
        revenueType: (option) => fetch.post('/v1/edf/enumDetail/findByEnumId', option),
        queryBaseArchives: (option) => fetch.post('/v1/ba/basearchive/queryBaseArchives', option)
    },
    tplus: {
        common: (url, params, options) => fetchCors.post(url, params, options),
        auditUpdate:(option) => fetch.post(prefix + 'auditUpdate', option),
    }
}