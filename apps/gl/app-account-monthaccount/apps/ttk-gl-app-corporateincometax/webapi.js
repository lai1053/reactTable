/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch, tree} from 'edf-utils'
export default {
    corporateincometax: {
        init: () => {return null},
        query: (option) => fetch.post('/v1/gl/incomeTaxSet/query', option),
        update: (option) => fetch.post('/v1/gl/incomeTaxSet/update', option),
        hasMaxPeriodSuperTaxDoc: (option) => fetch.post('/v1/gl/hasMaxPeriodSuperTaxDoc', option)
    }  
}