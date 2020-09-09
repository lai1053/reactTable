/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    operation: {
        export: (option) => fetch.formPost('/v1/biz/bovms/stock/qcye/export', option),  // 导出存货期初信息（xls文件格式）
        importQc: (option) => fetch.post('/v1/biz/bovms/stock/qcye/importQc', option), // 导入存货期初信息
    }
}