/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    getList: (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/getBatchGenerateDocListNew', option), //获取初始
    save: (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/batchGenerateDoc', option),//  批量生成
    customer: (option) => fetch.post('v1/ba/customer/queryList', option),
    supplier: (option) => fetch.post('v1/ba/supplier/queryList', option),
    person: (option) => fetch.post('v1/ba/person/queryList', option),
    getCorrespondentUnitsList:  (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/getCorrespondentUnitsList', option), //请求客户往来单位
    saveGenerateDocList: (option) => fetch.post('v1/biz/scm/bank/bankReconciliatio/saveGenerateDocList', option),
    hasCorrespondentUnitsList: (option) => fetch.post('v1/biz/scm/bank/bankReconciliatio/hasCorrespondentUnitsList', option),  //是否弹出往来科目确认
    batchGenerateDocNew: (option) => fetch.post('v1/biz/scm/bank/bankReconciliatio/batchGenerateDocNew', option),//生成单据
    loadBusinessTypes: (option) => fetch.post('v1/biz/scm/bank/bankReconciliatio/loadBusinessTypes', option),//更新收支类型
    // getCode: (option) => fetch.post('/v1/ba/basearchive/getAutoCode', option),
    // fileList:  (name) => fetch.post(`/v1/ba/${name}/queryList`),
    // create:  (option, name) => fetch.post(`/v1/ba/${name}/create`, option),
}