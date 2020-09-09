/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    findEnumList: (option) => fetch.post('/v1/edf/inventory/findEnumList', option),
    getAccount: (option) => fetch.post('/v1/gl/account/query', { isEnable: true }),
    queryAll: (option) => fetch.post('/v1/edf/invType/queryAll', option),
    createBatch: (option) => fetch.post('/v1/edf/inventory/createBatch', option),
    autoMatch: (option) => fetch.post('/v1/biz/bovms/generate/inventory/autoMatch', option), //科目自动匹配接口
    checkRecords: (option) => fetch.post('/v1/biz/bovms/generate/inventory/checkRecords', option), //检查数据完整性
    codeHandlerCreateBatch: (option) => fetch.post('/v1/biz/bovms/generate/inventory/codeHandlerCreateBatch', option),
    getSonListByPIdOrPCodeList: (option) => fetch.post('/v1/gl/account/getSonListByPIdOrPCodeList', option)
}