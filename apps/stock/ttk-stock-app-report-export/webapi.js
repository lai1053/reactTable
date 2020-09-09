/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    operation: {
        query: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/findBillTitleNum', option),
        querylist: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/findBillTitleList', option),
        createBillTitle: (list) => fetch.post('/v1/biz/bovms/stock/bill/title/createBillTitle', list),
        delete: (list) => fetch.post('/v1/biz/bovms/stock/bill/title/deleteBillTitle', list),
        queryone: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/findBillTitleById',option),
        getServerDate: () => fetch.post('/v1/edf/org/getSystemDate'),
        createBillTitleZGHCByFirst: (list) => fetch.post('/v1/biz/bovms/stock/bill/title/createBillTitleZGHCByFirst',list),
        findSupplierList: (list) => fetch.post('/v1/biz/bovms/stock/bill/title/findSupplierList', list),
        findInventoryEnumList: () => fetch.post('/v1/biz/bovms/stock/bill/title/findInventoryEnumList'),

    }
}