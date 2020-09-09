/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    person: {
        initList: (option) => fetch.post('/v1/biz/invoice/tabList', option), // 请求列表
        educe: (option) => fetch.formPost('/v1/biz/invoice/hgjhrzdc', option), // 待对比数据导出
        refreshs: (option) => fetch.post('/v1/biz/invoice/hgpsxrzjg', option), // 刷新
        deleteBatch: (option) => fetch.post('/v1/biz/invoice/jxfp/deleteJxfp', option), // 删除
        downInvoice: (option) => fetch.post('/v1/biz/invoice/fpxxCollection', option), // 下载发票
        batchQueryZzsNsqxdm: (option) => fetch.post('v1/biz/invoice/batchQueryZzsNsqxdm', option), // 获取纳税期限代码
        downloadTemplate: (option)=> fetch.formPost('/v1/biz/invoice/downloadTemplate',option), // 海关票模板下载
        bizInvoiceExcelImportJxfp: (option)=> fetch.post('/v1/biz/invoice/import/bizInvoiceExcelImportJxfp',option) // 海关票导入
    }
}