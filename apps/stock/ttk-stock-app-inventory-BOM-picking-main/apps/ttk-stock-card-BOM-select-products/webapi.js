/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    stock: {
        // getBOMConfigurationList: (v)=>fetch.post('/v1/biz/bovms/stock/BOMConfiguration/getBOMConfigurationList',v),  // BOM配置清单列表
        // deleteBOM: (v)=>fetch.post('/v1/biz/bovms/stock/BOMConfiguration/deleteBOM',v),  // 删除BOM
        // acquisitionFinishedProducts: (v)=>fetch.post('/v1/biz/bovms/stock/BOMConfiguration/acquisitionFinishedProducts',v),   // 选择BOM配置列表
        // checkBOMConfigurationRefer:(v)=>fetch.post('/v1/biz/bovms/stock/BOMConfiguration/getBOMConfigurationRefer',v), // 校验BOM元素引用状态
        saveBOMConfigurationList: (v)=>fetch.post('/v1/biz/bovms/stock/BOMConfiguration/saveBOMConfigurationList',v),  // 保存bom配置   
        // generateBOMCodes: (v)=>fetch.post('/v1/biz/bovms/stock/BOMConfiguration/generateBOMCodes',v),  // 获取流水号   
    }
}