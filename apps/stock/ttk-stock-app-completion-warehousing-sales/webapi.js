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
    stock:{
        getSalesWarehousingList : (options)=>fetch.post('/v1/biz/bovms/stock/wipcomplete/getSalesWarehousingList',options),
        getInvSetByPeroid : (options)=>fetch.post('/v1/biz/bovms/stock/common/getInvSetByPeroid',options),
        cancelProductShare: (options)=>fetch.post('/v1/biz/bovms/stock/productshare/cancelProductShare',options),  // 删除生产成本分配列表
    }
}