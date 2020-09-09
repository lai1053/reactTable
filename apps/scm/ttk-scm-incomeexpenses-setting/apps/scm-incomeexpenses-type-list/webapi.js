/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    accountCard: {
        queryChild: (option) => fetch.post('/v1/biz/core/businessType/queryChild', option),
        delete: (option) => fetch.post('/v1/biz/core/businessType/delete', option),
        create: (option) => fetch.post('/v1/biz/core/businessType/create', option),
        update: (option) => fetch.post('/v1/biz/core/businessType/update', option),
    }
}