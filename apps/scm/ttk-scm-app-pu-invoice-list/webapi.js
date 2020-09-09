/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch, fetchCors } from 'edf-utils'

export default {
  init: (option) => fetch.post('/v1/biz/scm/pu/arrivalList/init', option), //列表初始化
  queryAccountEnable: (option) => fetch.post('/v1/biz/scm/account/enable/queryAccountEnableNew', option), //查询科目启用设置接口
  auditAndExportBatch: (option) => fetch.formPost('/v1/biz/scm/pu/arrival/auditAndExportBatch', option), //生成凭证并导出到T+
  auditAndExportBatchU8: (option) => fetch.formPost('/v1/biz/scm/pu/arrival/auditAndExportBatchU8', option), //生成凭证并导出到U8
  deleteBatch: (option) => fetch.post('/v1/biz/scm/pu/arrival/deleteBatch', option),//批量删除
  delete: (option) => fetch.post('/v1/biz/scm/pu/arrival/delete', option), //删除
  checkAccountInfo: (option) => fetch.post('/v1/biz/scm/invoice/checkAccountInfo', option),
  queryInvoiceSum: (option) => fetch.post('/v1/biz/scm/invoice/queryInvoiceSum', option),//发票汇总
  import: (option) => fetch.post('/v1/biz/invoice/import', option),//导入excel
  bankAccount: (option) => fetch.post('/v1/ba/bankAccount/queryList', option),//账户列表
  collecteData: (option) => fetch.post('/v1/biz/scm/invoice/collecteDataNew', option),//采集发票线上
  collecteData1: (option) => fetch.post('/v1/biz/scm/invoice/collecteDataAsync', option),//采集发票第一步
  asyncRequestResult: (option, date) => fetch.post2('/v1/biz/scm/invoice/asyncRequestResult', option, date),//采集发票第二步
  generateDocument: (option) => fetch.post('/v1/biz/scm/invoice/generateDocument', option),//生单
  settlement: (option) => fetch.post('/v1/biz/scm/invoice/settlement', option),//批量结算
  saveInvoice: (option) => fetch.post('/v1/biz/scm/invoice/saveInvoice', option),//保存
  getDisplayDate: (option) => fetch.post('/v1/biz/scm/invoice/queryTimeRange', option), //初始化时间
  getPrintConfig: () => fetch.post('v1/gl/docManage/printConfig', {}), //打印初始化
  getAudit: (option) => fetch.post('/v1/biz/scm/pu/arrival/auditBatch', option), // 生成凭证（审核）
  delAudit: (option) => fetch.post('/v1/biz/scm/pu/arrival/unauditBatch', option), // 删除凭证（批量反审核）
  inventory: (option) => fetch.post('/v1/ba/inventory/queryList', {}), //存货名称
  supplier: (option) => fetch.post('/v1/ba/supplier/queryList', option), //客户
  findByParam: (option) => fetch.post('/v1/edf/column/findByParam', option),  //查询栏目
  updateWithDetail: (option) => fetch.post('/v1/edf/column/updateWithDetail', option), //更新栏目
  initData: (option) => fetch.post('/v1/edf/column/initData', option),//初始化栏目数据
  reInitByUser: (option) => fetch.post('/v1/edf/column/reInitByUser', option),//栏目重新初始化，恢复成预置数据
  batchUpdate: (option) => fetch.post('/v1/edf/columnDetail/save', option), //批量保存栏目明细
  export: (option) => fetch.formPost('/v1/biz/scm/pu/arrivalList/export', option), //导出
  hasReadSJInfo: (option) => fetch.post('/v1/edf/dlxx/hasReadSJInfo', option),
  audit: (option) => fetch.post('/v1/biz/scm/pu/arrival/audit', option),//审核
  unaudit: (option) => fetch.post('/v1/biz/scm/pu/arrival/unaudit', option),//反审核
  settleBatch: (option) => fetch.post('/v1/biz/scm/pu/arrival/settleBatch', option),//现结
  completeBatch: (option) => fetch.post('/v1/biz/scm/pu/arrival/completeBatch', option),//批量补充,
  auditBatchForTPlus: (option) => fetch.post('/v1/biz/scm/pu/arrival/auditBatchForTPlus', option),//
  getNoDisplay: (option) => fetch.post('/v1/biz/scm/invoice/getNoDisplay ', option),//
  queryAchivalAccount: (option) => fetch.post('/v1/biz/scm/pu/arrival/queryAchivalAccount', option),//
  saveAchivalAccount: (option) => fetch.post('/v1/biz/scm/pu/arrival/saveAchivalAccount', option),//
  getMatchingRule: (option) => fetch.post('/v1/biz/scm/invoice/getMatchingRule', option),//
  getFprzStartParam: (option) => fetch.post('/v1/biz/scm/invoice/getFprzStartParam', option),//获取认证发票
  getInvoiceInvMatch:(option)=>fetch.post('/v1/biz/scm/invoice/getInvoiceInvMatch',option),//列表
  queryCollectParam:(option)=>fetch.post('/v1/biz/scm/invoice/queryCollectParam',option),//
  checkAccountIsUsed: (option) => fetch.post('/v1/biz/scm/account/enable/checkAccountIsUsed', option),
  tplus: {
    configQuery: (option) => fetch.post('/v1/edf/linkConfig/query', option),//查询配置
    configExist: (option) => fetch.post('/v1/edf/linkConfig/exist', option),//是否有配置
    auditBatchForTPlusPu: (option) => fetch.post('v1/biz/scm/pu/arrival/auditBatchForTPlus', option),//
    updateBatchForTPluPu: (option) => fetch.post('/v1/biz/scm/pu/arrival/updateBatchForTPlus', option),//
    common: (url, params, options) => fetchCors.post(url, params, options),//跨域通用接口
    auditUpdate: (option) => fetch.post('/v1/biz/scm/pu/arrival/auditUpdate', option),
  }
}