/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import {
    fetch
} from 'edf-utils'

export default {
    getList: (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/queryPageListOfRADS', option), //获取列表数据
    queryForAccount: (option) => fetch.post('/v1/biz/scm/bank/bankAccount/query', option), //请求账户列表
    export: (option) => fetch.formPost('/v1/biz/scm/bank/bankReconciliatio/export', option), //导出
    print: (option) => fetch.printPost('/v1/biz/scm/bank/bankReconciliatio/print', option), //打印
    getDisplayDate: (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/queryDate', {}),
    deleteAccounts: (option) => fetch.post('/v1/biz/scm/bank/bankTransfer/delete', option), //删除账户互转
    deleteReceive: (option) => fetch.post('/v1/biz/scm/arap/receive/delete', option), //删除收款单
    deletePay: (option) => fetch.post('/v1/biz/scm/arap/pay/delete', option), //删除付款单
    deleteRADSBatch: (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/deleteRADSBatch', option), //批量删除
    findByParam: (option) => fetch.post('/v1/edf/column/findByParam', option),
    updateWithDetail: (option) => fetch.post('/v1/edf/column/updateWithDetail', option),
    reInitByUser: (option) => fetch.post('/v1/edf/column/reInitByUser', option),//栏目重新初始化，恢复成预置数据
    batchUpdate: (option) => fetch.post('/v1/edf/columnDetail/save', option), //批量保存栏目明细
    audit: (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/audit', option), //生成凭证
    unaudit: (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/unaudit', option), //删除凭证
    auditBatch: (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/auditBatch', option), //批量生成凭证
    unauditBatch: (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/unauditBatch', option), //批量删除凭证
}