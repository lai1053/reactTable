/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    voucherHabit: {
        queryByCode: (option) => fetch.post('/v1/biz/core/docGenerateHabit/queryByCode', option),
        queryByCode2: (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/queryByCode', option),
        save: (option) => fetch.post('/v1/biz/core/docGenerateHabit/save', option),
        saveTdo: (option) => fetch.post('/v1/biz/scm/bank/bankReconciliatio/saveDocGenerateHabit ', option),
    }
}