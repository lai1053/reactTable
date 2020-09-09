/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {

    invoice: {
        queryXxfpPageList: (option) => fetch.post('/v1/biz/invoice/xxfp/queryXxfpPageList', option),
        getSlvcsList: (option) => fetch.get(`/v1/biz/invoice/getSlvcsList?nsrxz=${option.nsrxz}&fplx=${option.fplx}`),
        getFpzlcsList: (option) => fetch.get(`/v1/biz/invoice/getFpzlcsList?nsrxz=${option.nsrxz}&fplx=${option.fplx}`),
        queryColumnVo: (option) => fetch.post('/v1/biz/invoice/queryColumnVo', option),
        deleteColumn: (option) => fetch.post('/v1/biz/invoice/deleteColumn', option),
        upDateColumn: (option) => fetch.post('/v1/biz/invoice/fpxxColumnUpdate', option),
        deleteXxfp: (option) => fetch.post('/v1/biz/invoice/xxfp/deleteXxfp', option),
        fpxxCollection: (option) => fetch.post('/v1/biz/invoice/fpxxCollection', option),  // 发票采集接口
        openInvoicePrintInvoices:(option) => fetch.post('/v1/biz/invoice/openInvoicePrintInvoices',option), //票税宝打印
        bizInvoiceExcelImport:(option) => fetch.post('/v1/biz/invoice/import/bizInvoiceExcelImport10',option) ,//导入
        bizInvoiceExcelImport2:(option) => fetch.post('/v1/biz/invoice/import/bizInvoiceExcelImport20',option) ,//导入2.0
        bizInvoiceExcelImportCustom:(option) => fetch.post('/v1/biz/invoice/import/bizInvoiceExcelImportCustom',option) ,//通用模板导入
        findById:(option) => fetch.post('/v1/edf/org/findById',option), //企业信息查询
        downloadCustomTemplate: (option)=> fetch.formPost('/v1/biz/invoice/downloadCustomTemplate',option), // 通用模板下载
        downlodExportImportFailedExcel: (option)=> fetch.formPost('/v1/biz/invoice/import/downlodExportImportFailedExcel',option), // 下载失败结果
        openInvoiceMainPageUrl:(option) => fetch.post('/v1/biz/invoice/openInvoiceMainPageUrl',option) ,//票税宝补票
        getOrgAddressFromSj: (option) => fetch.post("v1/tax/sb/getOrgAddressFromSj", option), // 导出的跳转页面
        bizInvoiceExcelImportNetwork: (option) => fetch.post("/v1/biz/invoice/import/bizInvoiceExcelImportNetwork", option) // 导出的跳转页面
    }
}