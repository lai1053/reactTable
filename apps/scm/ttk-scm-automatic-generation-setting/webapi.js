/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch, fetchCors } from 'edf-utils'

export default {
    query: (option) => fetch.post('/v1/biz/scm/archival/account/rule/get',option),
    saveRule: (option) => fetch.post('/v1/biz/scm/archival/account/rule/saveRule',option),
    common: (url, option, options) => fetchCors.post(url, option, options),//带url的跨域通用接口
    queryAccountEnable: (option) => fetch.post('/v1/biz/scm/account/enable/queryAccountEnable', option),
    /*consumerClass: (option) => fetch.post('/v1/biz/common/consumerClass/query',option),
    supplierClass: (option) => fetch.post('/v1/biz/common/supplierClass/query',option),
    inventoryClass: (option) => fetch.post('/v1/biz/common/inventoryClass/manualQuery',option),
    account: (option) => fetch.post('/v1/biz/common/account/query',option),*/
}