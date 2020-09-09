/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    /*
    person: {
        query: (option) => fetch.post('/v1/person/query', option)
    }*/

    stock: {
        createBillTitle: (v) => fetch.post('/v1/biz/bovms/stock/bill/title/createBillTitle', v), // 单条新增  （同结转主营成本）
        getBillCodeTran: (v) => fetch.post('/v1/biz/bovms/stock/common/getBillCodeTran', v), // 获取流水号/单据编号 
        queryDllInventoryInfo: (v) => fetch.post('v1/biz/bovms/stock/llservice/queryDllInventoryInfo', v), // 新增领料、非BOM快速领料，查询待领料存货信息
        getProductShareList: (v) => fetch.post('v1/biz/bovms/stock/productshare/getProductShareList', v), // 快速领料，取数规则
    }
}