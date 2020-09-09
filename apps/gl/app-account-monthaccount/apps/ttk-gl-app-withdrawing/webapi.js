/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch, tree} from 'edf-utils'
export default {
    widthdrawing: {
        init: () => {return null},
        getSubjects: () => fetch.post('/v1/gl/account/findCost_ProfitAndLossAccounts'),
        getAccountListForSupertaxSet: () => fetch.post('/v1/gl/account/getAccountListForSupertaxSet'),
        query: (option) => fetch.post('/v1/gl/GlSupertaxSet/query', option),
        update: (option) => fetch.post('/v1/gl/GlSupertaxSet/update', option),
        hasMaxPeriodSuperTaxDoc: (option) => fetch.post('/v1/gl/hasMaxPeriodSuperTaxDoc', option)
    }  
}