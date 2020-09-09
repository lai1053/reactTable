/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch,fetchCors } from 'edf-utils'

export default {
    unauthorized: {
        uncertifiedList: (option) => fetch.post('/v1/biz/scm/pu/arrival/uncertifiedList', option),
        certified: (option) => fetch.post('/v1/biz/scm/pu/arrival/certified', option),
        removeCertified: (option) => fetch.post('/v1/biz/scm/pu/arrival/removeCertified', option),
        queryCertified: () => fetch.post('/v1/biz/core/docTemplate/queryCertified', {}),
        saveCertified: (option) => fetch.post('/v1/biz/core/docTemplate/saveCertified', option),
        query: (option) => fetch.post('/v1/gl/account/query', option),
        getAccountGrade: () => fetch.post('/v1/gl/account/getAccountGradeSetting', {}),
        certifiedUpdate: (option) => fetch.post('/v1/biz/scm/pu/arrival/certifiedUpdate', option),
        common: (url, params, options) => fetchCors.post(url, params, options),//跨域通用接口
        saveAccount: (option) => fetch.post('/v1/biz/core/docTemplate/saveAccount', option),
    }
}