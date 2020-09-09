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
        findSupplierList: (list) => fetch.post('/v1/biz/bovms/stock/bill/title/findSupplierList', list),
        queryone: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/findBillTitleById',option),
        getServerDate: () => fetch.post('/v1/edf/org/getSystemDate'),
        findAutomatic: () => fetch.post('/v1/biz/bovms/stock/bill/title/findAutomatic'),
        findCustomerList: () => fetch.post('/v1/biz/bovms/stock/bill/title/findCustomerList'),
        findInventoryList: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/findInventoryList', option),
        updateBillTitle: (option) => fetch.post('/v1/biz/bovms/stock/bill/title/updateBillTitle', option),
        getSubjectList: (option) => fetch.post('/v1/biz/bovms/stock/carryovervoucher/getSubjectList', option),
        saveSalesCostDetails: (option) => fetch.post('/v1/biz/bovms/stock/carrymainsheet/saveSalesCostDetails', option),
        // 查询成本单价和实时库存点
        getRealTimeInventoryAndUnitCost: option => fetch.post("/v1/biz/bovms/stock/common/getRealTimeInventoryAndUnitCost", option), //全月加权 销售成本率
        getSaleMobileCostNum: option => fetch.post("/v1/biz/bovms/stock/common/getSaleMobileCostNum", option), //移动加权
        // 先进先出，查询待出库数量
        queryPendingStockOutNum: option => fetch.post("/v1/biz/bovms/stock/fifo/manualAdd/queryPendingStockOutNum", option),
        // 先进先出，根据待出库数量，计算计算待出库单价、金额
        calculatePendingStockOutPriceAndAmount: option => fetch.post("/v1/biz/bovms/stock/fifo/manualAdd/calculatePendingStockOutPriceAndAmount", option),
    }
}