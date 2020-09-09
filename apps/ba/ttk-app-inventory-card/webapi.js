/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    getAccount: (option) => fetch.post('/v1/gl/account/query', { isEnable: true, isEndNode: true }),
    // getCode: () => fetch.post('/v1/edf/basearchive/getAutoCode', { archiveName: 'ba_inventory' }),
    getCode: (option) => fetch.post('/v1/edf/basearchive/getAutoCodeExt', option),
    findEnumList: (option) => fetch.post('/v1/edf/inventory/findEnumList', option),
    queryAll: (option) => fetch.post('/v1/edf/invType/queryAll', option),
    create: (option) => fetch.post('/v1/edf/inventory/create', option),
    update: (option) => fetch.post('/v1/edf/inventory/update', option),
    getSonListByPIdOrPCodeList: (option) => fetch.post('/v1/gl/account/getSonListByPIdOrPCodeList', option),
    isUsed: (option) => fetch.post('/v1/edf/inventory/isUsed', option)
}