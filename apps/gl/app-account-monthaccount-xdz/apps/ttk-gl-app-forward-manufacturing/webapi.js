/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    manufacturingCost: {
        init: (option) => fetch.post('/v1/gl/factoryOverhead/init', option), //初始化查询       
        update: (option) => fetch.post('/v1/gl/factoryOverhead/update', option),
        getProportion: (option) => fetch.post('/v1/gl/userdefinedcertificatetemplate/getProportionByCreditAccountId', option)
    },
    developmentCost: {
        init: (option) => fetch.post('/v1/gl/RDExpenses/init', option),      
        update: (option) => fetch.post('/v1/gl/RDExpenses/update', option),       
    }
}
