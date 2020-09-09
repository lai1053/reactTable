/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {
    reportSet: (option) => fetch.post('/v1/gl/xdz/reportSet/init', option), // 规则设置
    save: (option) => fetch.post('/v1/gl/xdz/reportSet/save', option),
    saveTemplate: (option) => fetch.post('v1/gl/xdz/report/saveTemplate', option),
    queryAll: (option) => fetch.post('/v1/gl/xdz/account/queryAll', option),//系统科目查询
    queryAccountMappingForPage: (option) => fetch.post('/v1/gl/xdz/account/queryAccountMappingForPage', option), //客户源科目保存
    updateAccountMapping: (option) => fetch.post('/v1/gl/xdz/account/updateAccountMapping', option),
    beginRepeatMapping: (option) => fetch.post('/v1/gl/xdz/account/beginRepeatMapping', option),//重新匹配打标记
    queryRepeatMappingFinishState: (option) => fetch.post('/v1/gl/xdz/account/queryRepeatMappingFinishState', option),//重新匹配完成状态查询
    saveOrigAccountsForTest: (option) => fetch.post('/v1/gl/xdz/account/saveOrigAccountsForTest', option),
    saveOrigAccountsForTest: (option) => fetch.post('/v1/gl/xdz/account/saveOrigAccountsForTest', option),
    queryConnectionStatus: (option) => fetch.post('/v1/gl/xdz/account/queryConnectionStatus', option),
    saveGrade1AccountFromTTK: (option) => fetch.post('/v1/gl/xdz/account/saveGrade1AccountFromTTK', option),
}