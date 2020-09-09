/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    /*
    person: {
        query: (option) => fetch.post('/v1/person/query', option)
    }*/

    stock: {
        // getWipCompleteBillList: (v)=>fetch.post('/v1/biz/bovms/stock/wipcomplete/getWipCompleteBillList',v),  // 存货主列表
        getWipCompleteBillList: (options) => fetch.post('/v1/biz/bovms/stock/wipcomplete/getWipCompleteBillList', options), //完工入库
        saveWipCompleteBillList: (v) => fetch.post('/v1/biz/bovms/stock/wipcomplete/saveWipCompleteBillList', v), //保存存货
        deleteWipCompleteByPeriod: (v) => fetch.post('/v1/biz/bovms/stock/wipcomplete/deleteWipCompleteByPeriod', v), // 删除完工入库单
        getInventoryTypesFromArchives: (v) => fetch.post('/v1/biz/bovms/stock/common/getInventoryTypesFromArchives', v), //存货列表
        cancelProductShare: (options)=>fetch.post('/v1/biz/bovms/stock/productshare/cancelProductShare',options),  // 删除生产成本分配列表
    }
}