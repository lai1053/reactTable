/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
    queryInvoiceSum:(option)=>fetch.post('/v1/biz/scm/invoice/queryInvoiceSum',option),

    apocRptStatement: {
        query: (option) => fetch.post('/v1/gl/certificatecollect/query', option),
        export: (option) => fetch.formPost('/v1/gl/certificatecollect/export', option),
        print: (option) => fetch.printPost('/v1/gl/certificatecollect/print', option),
        getDocVoucherDate:()=>fetch.post('/v1/gl/doc/findMaxDocVoucherDate', {}),
       

    }

}