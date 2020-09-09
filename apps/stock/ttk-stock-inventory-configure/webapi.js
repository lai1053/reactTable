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
    query: (option) => fetch.post('/v1/edf/operation/query', option),
    findInventoryList: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/findInventoryList', option),
    init: (option) => fetch.post('/v1/biz/bovms/stock/inveset/init', option), // 获取存货设置信息
    createInveSet:(option) => fetch.post('/v1/biz/bovms/stock/inveset/createInveSet', option), // 更改存货信息
    findFirstInveSet: () => fetch.get('/v1/biz/bovms/stock/inveset/findFirstInveSet'),
    getServerDate: () => fetch.post('/v1/edf/org/getSystemDate'),
    periodDate: (option) => fetch.post('/v1/edf/perioddate/update', option),
    initKmSet: () => fetch.post('/v1/biz/bovms/stock/inveset/initKmSet'),
    initPeriod: () => fetch.post('/v1/biz/bovms/stock/inveset/initPeriod'), 
    getInvSetByPeroid: (list) => fetch.post('/v1/biz/bovms/stock/common/getInvSetByPeroid', list), // 获取存货信息
    checkIsDelete: (option) => fetch.post('/v1/biz/bovms/stock/inveset/checkIsDelete', option), // 检查是否存在单据
    deleteWithCheck: (option) => fetch.post('/v1/biz/bovms/stock/inveset/deleteWithCheck', option), // 删除存货记录
    checkExistBill: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/checkExistSetService', option), // 检查是否存在单据--特定单据
    getUserDetail: (option) => fetch.post('/v1/yygl/person/getUserDetail', option), // 管理岗判断
    initData: (option) => fetch.post('/v1/biz/bovms/stock/inveset/initData', option), // 初始化存货
}
