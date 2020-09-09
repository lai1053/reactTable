/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
    apocRptStatement: {
        getInitInfo: (option) => fetch.post('/v1/gl/report/saledetails/getInitInfo', option),
        getPageInfo: (option) => fetch.post('/v1/gl/report/saledetails/getPageInfo', option),
        getPrintConfig: () => fetch.post('/v1/gl/report/saledetails/getPrintConfig', {}),
        savePrintConfig: (option) => fetch.post('/v1/gl/report/saledetails/savePrintConfig', option),
        print: (option) => fetch.printPost('/v1/gl/report/saledetails/print', option),
        export: (option) => fetch.formPost('/v1/gl/report/saledetails/export', option),
        share: (option) => fetch.post('/v1/gl/report/saledetails/share', option),
        printAsync: (option) => fetch.post('/v1/gl/report/saledetails/printAsync', option),
        printAsyncStatus: (option) => fetch.post('/v1/gl/report/saledetails/printAsyncStatus', option),
        printAsyncResult: (option) => fetch.printPost('/v1/gl/report/saledetails/printAsyncResult', option),
        exportAsync: (option) => fetch.post('/v1/gl/report/saledetails/exportAsync', option),
        exportAsyncStatus: (option) => fetch.post('/v1/gl/report/saledetails/exportAsyncStatus', option),
        exportAsyncResult: (option) => fetch.formPost('/v1/gl/report/saledetails/exportAsyncResult', option),


        query: (option) => fetch.post('/v1/gl/certificatecollect/query', option),
        getDisplayDate: () => fetch.post('/v1/gl/report/queryDate', {}), 
        getDocVoucherDate:()=>fetch.post('/v1/gl/doc/findMaxDocVoucherDate', {}),
        getPageSetting: (option) => fetch.post('/v1/edf/org/queryResSetting', option),
        hasAuxRecords: (option) => fetch.post('/v1/gl/hasAuxRecords', option),//打印导出全部之前的校验接口
        setPageSetting: (option) => fetch.post('/v1/edf/org/modifyAppSetting', option),
        getCarryForwardingFlag: () => fetch.post('/v1/gl/job/getCarryForwardingFlag'),
        getExistsDataScope: () => fetch.post('/v1/gl/doc/getExistsDataScope'), //时间轴：获取账套内期初凭证数据的最小和最大期间接口 
    }

}