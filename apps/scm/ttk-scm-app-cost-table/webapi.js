/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    /*
    person: {
        query: (option) => fetch.post('/v1/person/query', option)
    }*/
    queryCostAccount: (option) => fetch.post('/v1/biz/scm/st/rdrecord/queryCostAccount', option), // 查询列表
    export: (option) => fetch.formPost('/v1/biz/scm/st/rdrecord/exportCostAccount', option),
    print: (option) => fetch.printPost('/v1/biz/scm/st/rdrecord/printCostAccount', option),
    query: (option) => fetch.post('/v1/biz/scm/st/rdrecord/queryenabletime', option), //存货启用日期
}