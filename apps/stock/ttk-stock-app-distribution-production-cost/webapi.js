/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    stock: {
        getProductShareList: (options)=>fetch.post('/v1/biz/bovms/stock/productshare/getProductShareList',options),  // 获取结转成本列表
        createProductShare: (options)=>fetch.post('/v1/biz/bovms/stock/productshare/createProductShare',options),  // 保存结转成本列表
        getUpdateProductShareList: (options)=>fetch.post('/v1/biz/bovms/stock/productshare/getUpdateProductShareList',options),  // 更新结转成本列表
        cancelProductShare: (options)=>fetch.post('/v1/biz/bovms/stock/productshare/cancelProductShare',options),  // 删除结转成本列表
        getStockAcctCode:(options)=>fetch.post('/v1/biz/bovms/common/getStockAcctCode', options),  // 根据条件查询存货模块科目设置范围下的末级科目
        queryAcctCodeByModule:(options)=>fetch.post('/v1/biz/bovms/stock/bill/acctcode/queryAcctCodeByModule', options),  // 按账套和模块获取科目设置列表信息
        saveOrUpdateAcctCode:(options)=>fetch.post('/v1/biz/bovms/stock/bill/acctcode/saveOrUpdateAcctCode', options),    // 保存或更新科目设置信息
    }
}