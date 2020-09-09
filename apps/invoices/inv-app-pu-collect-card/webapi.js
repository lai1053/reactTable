/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    invoices: {
        // 下载发票
        fpxxCollection: (option)=>fetch.post('v1/biz/invoice/fpxxCollection', option), 
        // 获取纳税期限代码
        batchQueryZzsNsqxdm: (option)=>fetch.post('v1/biz/invoice/batchQueryZzsNsqxdm', option),
        queryInvoicePlatform: (option) => fetch.post('/v1/biz/invoice/queryInvoicePlatform', option), // 13、查询发票平台采集按钮是否显示
    }
}