/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch, tree } from 'edf-utils'

export default {
    query: (option) => fetch.post('/v1/gl/mec/query',option),//初始查询接口
    check: (option) => fetch.post('/v1/gl/mec/check',option),//结账检查
    monthEndingClosing: (option) => fetch.post('/v1/gl/mec/monthEndingClosing',option),//结账
    undoMonthEndingClosing: (option) => fetch.post('/v1/gl/mec/undoMonthEndingClosing',option),//反结账
    createLossProfitDoc:(option) => fetch.post('/v1/gl/doc/createLossProfitDoc',option),//损益结账,
    fixedArchive: (option, title) => fetch.post(`v1/ba/${title}/queryList`, option),
    userDefineItem: (option) =>  fetch.post('/v1/ba/userdefinearchive/queryListDataByCalcName', option),
    allArchive: (option) => fetch.post('v1/ba/basearchive/queryBaseArchives', option),
    // queryAllCertificate: (option) => fetch.post('/v1/gl/userdefinedcertificatetemplate/queryAllUserDefineDocByPeriod', option),
    del: (option) => fetch.post('/v1/gl/userdefinedcertificatetemplate/delete', option),
    getDisplayPeriod: () => fetch.post('/v1/gl/mec/getNeedMonthlyClosingPeriod'),//当前第一个未结账月份
    isHasProfitAndLossDoc: (option) => fetch.post('/v1/gl/isHasProfitAndLossDoc ', option),//是否已经有审核后的结转损益凭证
    queryAllCertificate: (option) => fetch.post('/v1/gl/periodEndDoc/query', option),//获取全部期末凭证列表
    getAmountAndProportion: (option) => fetch.post('/v1/gl/CarryForwardSalesCost/getAmountAndProportion', option),
    updateCarryForwardModeAndProportion: (option) => fetch.post('/v1/gl/CarryForwardSalesCost/updateCarryForwardModeAndProportion', option),
    getGenarateMode: (option) => fetch.post('/v1/gl/periodEndDoc/getGenarateMode', option),//获取凭证生成方式
    updateGenarateMode: (option) => fetch.post('/v1/gl/periodEndDoc/updateGenarateMode', option),//更新凭证生成方式
    generateDoc: (option) => fetch.post('/v1/gl/periodEndDoc/generateDoc', option),//生成凭证
    hasSaleCostCarryForwardDoc:(option) => fetch.post('/v1/gl/hasSaleCostCarryForwardDocByPeriod', option),//结转销售成本有没有生成凭证
    hasCarryForwardDocByPeriod: (option) => fetch.post('/v1/gl/hasCarryForwardDocByPeriod', option),//判断有没有结转凭证
    exchangeList: (option) => fetch.post('/v1/gl/GlForeignExchangeGainOrLossSet/queryInfo', option),// 结转汇兑损益凭证 
    exchangeUpdate: (option) => fetch.post('/v1/gl/GlForeignExchangeGainOrLossSet/update', option),// 结转汇兑损益凭证 调汇
    getCarryForwardStatus: (option) => fetch.post('/v1/gl/periodEndDoc/getCarryForwardStatus', option),//获取当前结转方式的状态
    auditByPeriod: (option) => fetch.post('/v1/gl/doc/auditByPeriod', option),//按月审核凭证
    monthlyClosingBatch:  (option) => fetch.post('/v1/gl/mec/monthlyClosingBatch', option),//批量月结
    /**
    * 查询科目或存货增量数据
    */
    queryUnSetData: (option) => fetch.post('/v1/gl/SalesCost/queryUnSetData', option),
    /**
     * 自动添加或不添加增量数据
     */
    accountSetSave: (option) => fetch.post('/v1/gl/SalesCost/saveUnSetData', option),
    //损益结转设置
    queryEditInfo: (option) => fetch.post('/v1/gl/periodEndDoc/queryEditInfo', option),
    saveEditProduceModel: (option) => fetch.post('/v1/gl/periodEndDoc/saveEditProduceModel', option),
    /**
     * 获取弹出窗口数据
     */
    getPopAmount: (option) => fetch.post('/v1/gl/SalesCost/getPopAmount', option),
    queryBuBusinessType: (option) => fetch.post('/v1/gl/periodEndDoc/queryBuBusinessType', option), // 结转制造费用查询
}