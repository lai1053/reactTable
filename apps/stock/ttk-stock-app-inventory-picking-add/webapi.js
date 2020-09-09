/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    operation: {
        findBillTitleNum: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/findBillTitleNum', option),
        // findBillTitleList: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/findBillTitleList', option),
        createBillTitle: (list) => fetch.post('/v1/biz/bovms/stock/bill/title/createBillTitle', list),
        // deleteBillTitle: (list) => fetch.post('/v1/biz/bovms/stock/bill/title/deleteBillTitle', list),
        findBillTitleById: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/findBillTitleById',option),
        getSystemDate: () => fetch.post('/v1/edf/org/getSystemDate'),
        // createBillTitleZGHCByFirst: (list) => fetch.post('/v1/biz/bovms/stock/bill/title/createBillTitleZGHCByFirst',list),
        updateBillTitle: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/updateBillTitle', option),

    }
}