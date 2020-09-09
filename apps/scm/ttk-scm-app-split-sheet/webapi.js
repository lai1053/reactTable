/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    init : (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/getBankReconciliatio', option),
    getCalcObject : (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/getCalcObject', option),
    create : (option) => fetch.post(' /v1/biz/scm/bank/bankReconciliatio/saveBankReconciliatioDetail', option),
}