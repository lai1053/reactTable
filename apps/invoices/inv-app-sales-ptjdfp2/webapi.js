/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    invoices: {
        getHwlxcsList: (option) => fetch.post('/v1/biz/invoice/getHwlxcsList', option),
        getSlvcsList: (option) => fetch.post('/v1/biz/invoice/getSlvcsList', option),
        getJsfscsList: (option) => fetch.post('/v1/biz/invoice/getJsfscsList', option),
        addXxfp: (option) => fetch.post('/v1/biz/invoice/xxfp/addXxfp', option),
        initiateAddOfXxfp: (option) => fetch.post('/v1/biz/invoice/xxfp/initiateAddOfXxfp', option),
        updateXxfp: (option) => fetch.post('/v1/biz/invoice/xxfp/updateXxfp', option),
        queryXxfp: (option) => fetch.post('/v1/biz/invoice/xxfp/queryXxfp', option),
        getSpbmList: (option) => fetch.get('/v1/biz/invoice/getSpbmList', option),
    }
}