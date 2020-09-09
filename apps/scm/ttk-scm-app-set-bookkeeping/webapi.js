/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    query: (option) => fetch.post('/v1/biz/scm/invoice/queryKeepAccount', option),
    update: (option) => fetch.post('/v1/biz/scm/invoice/updateKeepAccount', option),
    bankAccount:(option)=>fetch.post('/v1/ba/bankAccount/queryList',option),
    initKeepAccount:(option)=>fetch.post('/v1/biz/scm/invoice/initKeepAccount',option),
}