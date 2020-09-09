/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    invoice: {
        queryAccount: (option) => fetch.post('/v1/biz/invoice/queryAccount', option),
        queryRatio: () => fetch.post('/v1/biz/invoice/queryRatio'),
        saveUpperLimitRatio: (option) => fetch.post('/v1/biz/invoice/saveUpperLimitRatio', option),
        batchReadInvoice: (option) => fetch.post('/v1/biz/invoice/batchReadInvoice', option),
        queryColumnVo: (option) => fetch.post('/v1/biz/invoice/queryColumnVo', option),
        deleteColumn: (option) => fetch.post('/v1/biz/invoice/deleteColumn', option),
        upDateColumn: (option) => fetch.post('/v1/biz/invoice/fpxxColumnUpdate', option),
        queryPermission: (option) => fetch.post('/v1/biz/invoice/queryPermission', option),
        fpxxCollection: (option) => fetch.post('/v1/biz/invoice/fpxxCollection', option),  // 发票采集接口
        queryUserDetail : (option) => fetch.post('/v1/biz/invoice/queryUserDetail ', option),  // 权限查看
        fptjXxfpJxfpMxsjPageList : (option) => fetch.post('/v1/biz/invoice/fptjXxfpJxfpMxsjPageList ', option),  // 进销统计列表查询
        exportFptjXxfpJxfpMxsjList : (option) => fetch.formPost('/v1/biz/invoice/exportFptjXxfpJxfpMxsjList', option),  // 进销统计导出
        
    }
}