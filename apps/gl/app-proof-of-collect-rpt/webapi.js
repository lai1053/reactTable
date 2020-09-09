/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
    apocRptStatement: {
        query: (option) => fetch.post('/v1/gl/certificatecollect/query', option),
        export: (option) => fetch.formPost('/v1/gl/certificatecollect/export', option),
        print: (option) => fetch.printPost('/v1/gl/certificatecollect/print', option),
        getDisplayDate: () => fetch.post('/v1/gl/report/queryDate', {}), 
        getDocVoucherDate:()=>fetch.post('/v1/gl/doc/findMaxDocVoucherDate', {}),
        getPageSetting: (option) => fetch.post('/v1/edf/org/queryResSetting', option),
        setPageSetting: (option) => fetch.post('/v1/edf/org/modifyAppSetting', option),
        getPrintConfig: (option) => fetch.post('/v1/gl/certificatecollect/getPrintConfig', option),
        savePrintConfig: (option) => fetch.post('/v1/gl/certificatecollect/savePrintConfig', option),
        getExistsDataScope: () => fetch.post('/v1/gl/doc/getExistsDataScope'), //时间轴：获取账套内期初凭证数据的最小和最大期间接口 
    }

}