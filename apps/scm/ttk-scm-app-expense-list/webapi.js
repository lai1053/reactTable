/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import { fetch } from 'edf-utils'

export default {
    expenseList: {
        init: (option) => fetch.post('/v1/biz/scm/pu/expenseList/init', option), //费用单列表初始化
        create: (option) => fetch.post('/v1/biz/scm/pu/expense/create', option), //费用单保存
        update:(option)=>fetch.post('/v1/biz/scm/pu/expense/update',option),//费用单修改
        delete: (option) => fetch.post('/v1/biz/scm/pu/expense/delete', option), //费用单删除
        deleteBatch: (option) => fetch.post('/v1/biz/scm/pu/expense/deleteBatch', option), //费用单批量删除
        deleteDetail: (option) => fetch.post('/v1/biz/scm/pu/expense/deleteDetail', option), //费用单明细删除
        auditBatch:(option)=>fetch.post('/v1/biz/scm/pu/expense/auditBatch',option),//费用单批量生成凭证
        unauditBatch:(option)=>fetch.post('/v1/biz/scm/pu/expense/unauditBatch',option),//费用单批量删除凭证
        findByParam: (option) => fetch.post('/v1/edf/column/findByParam', option),
        updateWithDetail: (option) => fetch.post('/v1/edf/column/updateWithDetail', option),
        reInitByUser: (option) => fetch.post('/v1/edf/column/reInitByUser', option),//栏目重新初始化，恢复成预置数据
        getPsbBindUrl: (option) => fetch.post('/v1/biz/scm/pu/expense/getPsbBindUrl', option),//获取票税宝绑定 url，已绑定返回空
        importFromPsb: (option) => fetch.post('/v1/biz/scm/pu/expense/importFromPsb', option),//导入票税宝报销单
        accountQuery: (option) => fetch.post('/v1/gl/account/query', option),//科目列表
    }
}