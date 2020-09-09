/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    // import: (option) => fetch.post('/v1/gl/asset/import', option),
    getCode: (option) => fetch.post('/v1/ba/basearchive/getAutoCode', option),
    fileList:  (name) => fetch.post(`/v1/ba/${name}/queryList`),
    create:  (option, name) => fetch.post(`/v1/ba/${name}/create`, option),
    save:  (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/saveCorrespondentUnitsRelationNew', option),
    customer: (option) => fetch.post('v1/ba/customer/queryList', option),
    supplier: (option) => fetch.post('v1/ba/supplier/queryList', option),
    getCorrespondentUnitsListNew: (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/getCorrespondentUnitsListNew', option),//查询列表
    batchGenerateDocNew: (option) => fetch.post('v1/biz/scm/bank/bankReconciliatio/batchGenerateDocNew', option),//生成单据

    // 往来科目
    generateCorrespondentUnitsAccount: (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/generateCorrespondentUnitsAccount', option),  // 自动生成往来科目
    getCorrespondentUnitsAccount: (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/getCorrespondentUnitsAccount', option), 
}