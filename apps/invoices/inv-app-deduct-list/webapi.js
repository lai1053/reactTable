/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch} from 'edf-utils'

export default {
    invoices: {
        // 抵扣统计列表
        queryDktjList: (option) => fetch.post('v1/biz/invoice/jxfp/queryDktjList.do', option),
    }
}