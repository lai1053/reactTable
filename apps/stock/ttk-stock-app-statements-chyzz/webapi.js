/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    getInvSetByPeroid: (option) => fetch.post('/v1/biz/bovms/stock/common/getInvSetByPeroid', option),
    init: (option) => fetch.post('/v1/biz/bovms/stock/inveset/init', option),
    query: (option) => fetch.post('/v1/biz/bovms/stock/report/checkaccount/query', option)
}