/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch} from 'edf-utils'

export default {
    findRoleAuth: (option) => fetch.post('/v1/yygl/roleAuth/findRoleAuth', option),
    getSbse: (option) => fetch.post('/v1/yygl/statistic/getSbse', option),
    exportSbse: (option) => fetch.formPost('/v1/yygl/statistic/exportSbse', option),
    getRoleList: () => fetch.post('/v1/yygl/roleAuth/getAllRoles'),
    getfpkh: (option) => fetch.post('/v1/yygl/person/getDepartMentList',option),
    getgwxx: (option) => fetch.post('/v1/yygl/statistic/getRoleByCustomerId',option),
    updateWithDetail:(option,date) => fetch.post2('/v1/edf/column/updateWithDetail',option,date),
    reInitByUser:(option,date) => fetch.post2('/v1/edf/column/reInitByUser',option,date),
    initColumn:(option,date) => fetch.post2('/v1/yygl/statistic/initColumn',option,date),
    cxWscSbqcxx: (option) => fetch.post('/v1/yygl/statistic/cxWscSbqcxx',option),
    getSbtzJkxxUrl: (option) => fetch.post('/v1/tax/ysdj/getSbtzJkxxUrl',option),
    judgeUserMenuToDh: (option) => fetch.post('/v1/yygl/roleAuth/judgeUserMenuToDh',option),
}
