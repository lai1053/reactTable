/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    accountCard: {
        getAccountList: (option) => fetch.post('/v1/biz/core/docTemplate/queryByAccountType', option),
        saveAccountType: (option) => fetch.post('/v1/biz/core/docTemplate/saveOrUpdate', option),
        saveBatch: (option) => fetch.post('/v1/biz/core/docTemplate/saveBatch', option),
        getSubject: (option) => fetch.post('/v1/gl/account/query', option),
        getById: (option) => fetch.post('/v1/gl/asset/editAssetById', option),
        updateAsset: (option) => fetch.post('/v1/gl/asset/update', option),
    }
}