/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    stock: {
        getInventoryTypesFromArchives: (v) => fetch.post('/v1/biz/bovms/stock/common/getInventoryTypesFromArchives', v), //存货列表
        findEndSonListByPidList: (v) => fetch.post('/v1/biz/bovms/stock/common/findEndSonListByPidList', v), //存货科目下拉列表
        acquisitionCostSubjectList: (v) => fetch.post('/v1/biz/bovms/stock/common/acquisitionCostSubjectList', v), // 获取成本科目下拉   
        updateSubjectMatching: (v) => fetch.post('/v1/biz/bovms/stock/common/updateSubjectMatching', v), // 保存科目匹配结果  
        detectionScopeConflict: (v) => fetch.post('/v1/biz/bovms/stock/common/detectionScopeConflict', v), // 检测科目类型是否有冲突 
        getInventoryGoods: (v) => fetch.post('/v1/biz/bovms/stock/common/getInventoryGoods', v), // 获取存货列表    
    }
}