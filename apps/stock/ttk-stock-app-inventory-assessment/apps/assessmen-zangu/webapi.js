/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    operation: {
        query: (option) => fetch.post('/v1/edf/operation/query', option),
        save: (list) => fetch.post('/v1/edf/operation/save', list),
        // findPreliminaryRetur: (list) => fetch.post('/v1/biz/bovms/stock/bill/title/findPreliminaryRetur', list),
        findPreliminaryRetur: (list) => fetch.post('/v1/biz/bovms/stock/zgservice/findPreliminaryRetur', list),
        getServerDate: () => fetch.post('/v1/edf/org/getSystemDate'),
        findBackDetail: () => fetch.post('/v1/biz/bovms/stock/bill/title/findBackDetail'),
        findAutomatic: (list) => fetch.post('/v1/biz/bovms/stock/bill/title/findAutomatic',list),
        findInventoryEnumList: () => fetch.post('/v1/biz/bovms/stock/bill/title/findInventoryEnumList'),

    }
}