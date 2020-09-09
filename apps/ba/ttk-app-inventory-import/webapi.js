/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    getAccount: (option) => fetch.post('/v1/gl/account/query', {isEnable: true, isEndNode: true }),
    getCode: () => fetch.post('/v1/edf/basearchive/getAutoCode', { archiveName: 'ba_inventory' }),
    create: (option) => fetch.post('/v1/edf/inventory/create', option),
    update: (option) => fetch.post('/v1/edf/inventory/update', option),
    download: (option) => fetch.formPost('/v1/edf/inventory/download', option),
    downloadExt: (option) => fetch.formPost('/v1/edf/inventory/downloadExt', option),
    export: (option) => fetch.post('/v1/edf/inventory/export', option),
    import: (option) => fetch.post('/v1/edf/inventory/import', option),
    importTong: (option) => fetch.post('/v1/biz/bovms/stock/invBal/import', option),
    initPeriod: (option) => fetch.post('/v1/biz/bovms/stock/inveset/initPeriod', option),
    getInvSetByPeroid: (option) => fetch.post('/v1/biz/bovms/stock/common/getInvSetByPeroid', option),
}