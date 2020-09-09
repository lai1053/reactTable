/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from "edf-utils"

export default {
    invoice: {
        queryJxfpPageList: option => fetch.post("/v1/biz/invoice/jxfp/queryJxfpPageList", option),
        getFpzlcsList: option =>
            fetch.get(`/v1/biz/invoice/getFpzlcsList?nsrxz=${option.nsrxz}&fplx=${option.fplx}`),
        getSlvcsList: option =>
            fetch.get(`/v1/biz/invoice/getSlvcsList?nsrxz=${option.nsrxz}&fplx=${option.fplx}`),
        queryColumnVo: option => fetch.post("/v1/biz/invoice/queryColumnVo", option),
        deleteColumn: option => fetch.post("/v1/biz/invoice/deleteColumn", option),
        upDateColumn: option => fetch.post("/v1/biz/invoice/fpxxColumnUpdate", option),
        deleteJxfp: option => fetch.post("/v1/biz/invoice/jxfp/deleteJxfp", option),
        exportJxfpInSummary: option =>
            fetch.formPost("/v1/biz/invoice/jxfp/exportJxfpInSummary", option),
        exportJxfpInDetail: option =>
            fetch.formPost("/v1/biz/invoice/jxfp/exportJxfpInDetail", option),
        queryBatchUpdateJxfp: option =>
            fetch.post("/v1/biz/invoice/jxfp/queryBatchUpdateJxfp", option),
        fpxxCollection: option => fetch.post("/v1/biz/invoice/fpxxCollection", option), // 发票采集接口
        openInvoicePrintInvoices: option =>
            fetch.post("/v1/biz/invoice/openInvoicePrintInvoices", option), //票税宝打印
        bizInvoiceExcelImport: option =>
            fetch.post("/v1/biz/invoice/import/bizInvoiceExcelImport10", option), //增值税发票导入
        bizInvoiceExcelImport2: option =>
            fetch.post("/v1/biz/invoice/import/bizInvoiceExcelImport20", option), //导入2.0
        downloadTemplate: option => fetch.formPost("/v1/biz/invoice/downloadTemplate", option), // 海关票模板下载
        bizInvoiceExcelImportJxfp: option =>
            fetch.post("/v1/biz/invoice/import/bizInvoiceExcelImportJxfp", option), // 海关票导入
        downloadCustomTemplate: option =>
            fetch.formPost("/v1/biz/invoice/downloadCustomTemplate", option), // 通用模板下载
        bizInvoiceExcelImportCustom: option =>
            fetch.post("/v1/biz/invoice/import/bizInvoiceExcelImportCustom", option), //通用模板导入
        downlodExportImportFailedExcel: option =>
            fetch.formPost("/v1/biz/invoice/import/downlodExportImportFailedExcel", option), // 下载失败结果
        invoiceCompletionAsync: option =>
            fetch.post("/v1/biz/invoice/invoiceCompletionAsync", option), //获取补全明细流水号
        invoiceCompletionAsyncResult: option =>
            fetch.post("/v1/biz/invoice/invoiceCompletionAsyncResult", option), //轮询查找结果
        openInvoiceMainPageUrl: option =>
            fetch.post("/v1/biz/invoice/openInvoiceMainPageUrl", option), //票税宝补票
        getOrgAddressFromSj: option => fetch.post("v1/tax/sb/getOrgAddressFromSj", option), // 导出的跳转页面
        bizInvoiceExcelImport10: option =>
            fetch.post("/v1/biz/invoice/import/bizInvoiceExcelImport10", option), //农产品导入
    },
}
