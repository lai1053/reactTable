/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch, fetchCors } from 'edf-utils'

export default {
    tplus: {
        common: (url, params, options) => fetchCors.post(url, params, options),
        businessType: (option) => fetch.post('/v1/biz/core/businessType/queryChild', option)
    }
}