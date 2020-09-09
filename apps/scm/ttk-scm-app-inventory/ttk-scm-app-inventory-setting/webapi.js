/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    dateCard: {
        createDate: (option) => fetch.post('/v1/biz/scm/st/rdrecord/createparam', option),
        getCalcMode: (option) => fetch.post('/v1/biz/scm/st/rdrecord/getCalcMode', option),
        updateCalcMode: (option) => fetch.post('/v1/biz/scm/st/rdrecord/updateCalcMode', option),
        changeSatrtDate: (option) => fetch.post('/v1/biz/scm/st/rdrecord/isCanModify', option),
        disableInventory: (option) => fetch.post('/v1/biz/scm/st/rdrecord/disableInventory ', option),
        getNeedMonthlyClosingPeriod:(option)=>fetch.post('/v1/gl/mec/getNeedMonthlyClosingPeriod',option),//获取结账日期
    }
}