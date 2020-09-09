/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    queryunit: (option) => fetch.post('v1/ba/unit/queryList', option),
    currency: (option) =>  fetch.post('/v1/ba/currency/queryList', option),
    quertSubjects: (option) => fetch.post('/v1/gl/account/query', option),
    update: (option) =>  fetch.post('/v1/gl/account/update', option),
    used: (option) =>  fetch.post('/v1/gl/account/isUsedInCertificate', option), //填制凭证才为科目已使用
    find: (option) =>  fetch.post('/v1/gl/account/getById', option),
    add: (option) =>  fetch.post('/v1/gl/account/create', option),
    getSyncBA: (option) => fetch.post('/v1/gl/account/getSyncBA', option),    
    // delete: (option) =>  fetch.post('/v1/gl/account/delete', option)
    getAccountGrade: () => fetch.post('/v1/gl/account/getAccountGradeSetting', {}), 
    setAccountGrade: (option) => fetch.post('/v1/gl/account/setAccountGradeSetting', option),
    canModifyAccountType: (option) => fetch.post('/v1/gl/account/canModifyAccountType', option),//科目属性是否可以修改
    findGradeOneCode: () => fetch.post('/v1/gl/account/findGradeOneCode'),//新增一级科目 科目编码
    afterOperateTargetGlAccount: (option) => fetch.post('/v1/gl/imp/afterOperateTargetGlAccount', option),
    createRevenueAccount: (option) =>  fetch.post('/v1/biz/scm/invoice/createRevenueAccount', option),
    createRevenueAccountForArrival: (option) =>  fetch.post('/v1/biz/scm/invoice/createRevenueAccountForArrival', option),
    getSonListByPidList: (option) =>  fetch.post('/v1/gl/account/getSonListByPidList', option),
    findFirstUnusedCode: (option) =>  fetch.post('/v1/gl/account/findFirstUnusedCode', option),
    findSonListByPCodeList: (option) =>  fetch.post('/v1/gl/account/getSonListByPCodeList', option),
    /**
     * 获取科目类别
     */
    getAccountTypeList: () => fetch.post('/v1/gl/account/getAccountTypeList', {}),

}