/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import {
    fetch
} from 'edf-utils'

export default {
    getList: (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/queryPageList', option), //获取列表数据
    delete: (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/deleteBatch', option), //删除对账单
    queryForAccount: (option) => fetch.post('/v1/biz/scm/bank/bankAccount/query', option), //请求账户列表
    getCorrespondentUnitsList:  (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/getCorrespondentUnitsList', option), //请求客户往来单位
    getDisplayDate: (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/queryDate', {}),
    import: (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/import', option), //银行对账单导入
    exporttemplate: () => fetch.formPost('/v1/biz/scm/bank/bankReconciliatio/downloadTemplate') //银行对账单模板下载
}