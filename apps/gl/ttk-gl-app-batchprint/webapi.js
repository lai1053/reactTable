/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */
import { fetch } from 'edf-utils'
export default {
    getCarryForwardingFlag: () => fetch.post('/v1/gl/job/getCarryForwardingFlag'),
    getPrintDataAsync: (option) => fetch.post('/v1/gl/reportBatchPrint/getPrintDataAsync', option),
    printAsyncStatus: (option) => fetch.post('/v1/gl/reportBatchPrint/printAsyncStatus ', option),
    getPrintDataAsyncResult: (option) => fetch.printPost('/v1/gl/reportBatchPrint/getPrintDataAsyncResult', option),
    getExportDataAsyncResult: (option) => fetch.printPost('/v1/gl/reportBatchPrint/getExportDataAsyncResult', option),
}