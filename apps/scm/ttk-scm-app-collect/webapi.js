/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
   // bankAccount:(option)=>fetch.post('/v1/ba/bankAccount/queryList',option),//账户列表
    getSettleDate:(option)=>fetch.post('/v1/gl/mec/getNeedMonthlyClosingPeriod',option),//获取结账日期
}