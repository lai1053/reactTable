/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    accountType: {
        getAccountTree: (option) => fetch.post('/v1/biz/core/docTemplate/queryAccountByBusiness', option),
        // getAccountList: (option) => fetch.post('/v1/biz/core/docTemplate/queryByAccountType', option),
        queryPageByAccountType: (option) => fetch.post('v1/biz/core/docTemplate/queryPageByAccountType', option),
        getInfluenceByCode: (option) => fetch.post('v1/biz/core/docTemplate/queryInfluenceByCode', option),
        getSubject: (option) => fetch.post('/v1/gl/account/query', option),
        saveAccountType: (option) => fetch.post('/v1/biz/core/docTemplate/saveOrUpdate', option),
        getAutoAccount: (option) => fetch.post('v1/edf/orgparameter/query', option),
        queryAccountList: (option) => fetch.post('v1/gl/asset/queryAccountList', option),
        create: (option) => fetch.post('/v1/biz/core/businessType/create', option),
        update: (option) => fetch.post('/v1/biz/core/businessType/update', option),
        delete: (option) => fetch.post('/v1/biz/core/businessType/delete', option),
    }
}