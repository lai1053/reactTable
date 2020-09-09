/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {

    invoices: {
        query: (option) => fetch.post('/v1/edf/operation/query', option),
        findInventoryList: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/findInventoryList', option),
        
        getSpbmList: (option) => fetch.get('/v1/biz/invoice/getSpbmList', option)
    }
}