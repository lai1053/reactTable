/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch, fetchCors } from 'edf-utils'

export default {
    tplus: {
        common: (url, params, options) => fetchCors.post(url, params, options),
        configSave: (option) => fetch.post('/v1/edf/linkConfig/save', option),//保存到配置
        configDelete: (option) => fetch.post('/v1/edf/linkConfig/delete', option),//删除配置
        configQuery: (option) => fetch.post('/v1/edf/linkConfig/query', option),//查询配置
        configExist: (option) => fetch.post('/v1/edf/linkConfig/exist', option),//是否有配置
        updateBatchByparamKey: (option) => fetch.post('/v1/edf/orgparameter/updateBatchByparamKey', option),
        queryedf: (option) => fetch.post('/v1/edf/orgparameter/query', option),
        queryExternalDoc: () => fetch.post('/v1/biz/scm/sa/delivery/queryExternalDoc'),
        syncAccount: (option) => fetch.post('/v1/biz/core/docTemplate/syncAccount',option),
    }
}