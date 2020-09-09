/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    invoice: {
        batchUpdateJxfp: (option) => fetch.post('/v1/biz/invoice/jxfp/batchUpdateJxfp', option),
        getNsrZgrdXx: (option) => fetch.post('/v1/biz/invoice/getNsrZgrdXx', option),//是否辅导期纳税人
    }
}