/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    dateCard: {
        createDate: (option) => fetch.post('/v1/biz/scm/st/rdrecord/createparam', option),
        updateCalcMode: (option) => fetch.post('/v1/biz/scm/st/rdrecord/updateCalcMode', option),
        getMaxMonthlyClosingPeriod: (option) => fetch.post('/v1/biz/scm/st/rdrecord/getMaxMonthlyClosingPeriod', option),
    }
}