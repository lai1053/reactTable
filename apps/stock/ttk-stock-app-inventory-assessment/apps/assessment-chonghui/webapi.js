/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    operation: {
        query: (option) => fetch.post('/v1/edf/operation/query', option),
        save: (list) => fetch.post('/v1/edf/operation/save', list),
        findBackDetail: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/findBackDetail',option),
    }
}