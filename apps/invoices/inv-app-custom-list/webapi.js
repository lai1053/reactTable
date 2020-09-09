/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from "edf-utils"

export default {
    invoice: {
        queryAccount: option => fetch.post("/v1/biz/invoice/queryAccount", option),
        queryRatio: () => fetch.post("/v1/biz/invoice/queryRatio"),
        saveUpperLimitRatio: option => fetch.post("/v1/biz/invoice/saveUpperLimitRatio", option),
        batchReadInvoice: option => fetch.post("/v1/biz/invoice/batchReadInvoice", option),
        queryColumnVo: option => fetch.post("/v1/biz/invoice/queryColumnVo", option),
        deleteColumn: option => fetch.post("/v1/biz/invoice/deleteColumn", option),
        upDateColumn: option => fetch.post("/v1/biz/invoice/fpxxColumnUpdate", option),
        queryPermission: option => fetch.post("/v1/biz/invoice/queryPermission", option),
        invoiceCollectionXxfpJxfp: option =>
            fetch.post("/v1/biz/invoice/invoiceCollectionXxfpJxfp", option), // 批量页面_发票采集_一键读取销项进项
        fpxxCollection: option => fetch.post("/v1/biz/invoice/fpxxCollection", option), // 发票采集接口
        queryUserDetail: option => fetch.post("/v1/biz/invoice/queryUserDetail ", option), // 权限查看
        callQueryAllSqldseList: option =>
            fetch.post("/v1/biz/invoice/callQueryAllSqldseList ", option), // 上期留底
        exportExcelBatchAccountList: option =>
            fetch.formPost("/v1/biz/invoice/exportExcelBatchAccountList ", option), // 导出
        queryBatchAccountPageList: option =>
            fetch.post("/v1/biz/invoice/queryBatchAccountPageList", option), // 获取列表
        querySingleAccountList: option =>
            fetch.post("/v1/biz/invoice/querySingleAccountList", option),
        queryInvoicePlatform: option => fetch.post("/v1/biz/invoice/queryInvoicePlatform", option), // 13、查询发票平台采集按钮是否显示
        getOrgAddressFromSj: option => fetch.post("v1/tax/sb/getOrgAddressFromSj", option), // 导出的跳转页面
    },
}
