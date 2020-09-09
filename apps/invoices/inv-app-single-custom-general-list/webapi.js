/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    invoice: {
        queryAccountById: (option) => fetch.post('/v1/biz/invoice/queryAccountById', option),
        queryColumnVo: (option) => fetch.post('/v1/biz/invoice/queryColumnVo', option),
        deleteColumn: (option) => fetch.post('/v1/biz/invoice/deleteColumn', option),
        upDateColumn: (option) => fetch.post('/v1/biz/invoice/fpxxColumnUpdate', option),
        getPsbInvoiceUrl: (option) => fetch.post('/v1/biz/invoice/getPsbInvoiceUrl', option),
        queryUserDetail : (option) => fetch.post('/v1/biz/invoice/queryUserDetail ', option),  // 权限查看
    
    }
}