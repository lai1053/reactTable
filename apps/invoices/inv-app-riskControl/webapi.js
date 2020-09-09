/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
  invoice: {
      queryInvoicePhysicalExamination: (option) => fetch.post('/v1/biz/invoice/swfx/queryInvoicePhysicalExamination', option),  // 初始化获取资料
      fpxxCollection: (option) => fetch.post('/v1/biz/invoice/fpxxCollection', option),  // 发票采集接口
      postInvoicePhysicalExamination:(option) => fetch.post('/v1/biz/invoice/swfx/postInvoicePhysicalExamination',option) // 获取风险体检参数
  }
}