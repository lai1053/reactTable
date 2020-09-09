/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch} from 'edf-utils'

export default {
    findRoleAuth: (option) => fetch.post('/v1/yygl/roleAuth/findRoleAuth', option),
    getRoleList: () => fetch.post('/v1/yygl/roleAuth/getAllRoles'),
    sbjd:{
        querySBList:(option) => fetch.post('/v1/yygl/statistic/getplcxSbqcZt',option),
        getfpkh: (option) => fetch.post('/v1/yygl/person/getDepartMentList',option),
        getgwxx: (option) => fetch.post('/v1/yygl/statistic/getRoleByCustomerId',option),
        getHZ:(option) => fetch.post('/v1/yygl/statistic/getplcxSbqcZtCollect',option),
        updateState:(option) => fetch.post('/v1/yygl/statistic/updateTaxAppraisalYyglAsync',option),
        updateStateReturn:(option) => fetch.post('/v1/yygl/statistic/updateTaxAppraisalYyglAsyncStatusHasReturn',option),
        updateList:(option,date) => fetch.post2('/v1/yygl/khzl/getNsrxxAsyncStatus',option,date),
        updateWithDetail:(option,date) => fetch.post2('/v1/edf/column/updateWithDetail',option,date),
        reInitByUser:(option,date) => fetch.post2('/v1/edf/column/reInitByUser',option,date),
        initColumn:(option,date) => fetch.post2('/v1/yygl/statistic/initColumn',option,date),
        getjzxx: (option) => fetch.post('/v1/yygl/home/getJzjdTj',option),
        cxWscSbqcxx: (option) =>fetch.post('/v1/yygl/statistic/cxWscSbqcxx',option),
        getJzjdOrSbjdTj: (option) => fetch.post('/v1/yygl/home/getJzjdOrSbjdTj',option),
        getSbjzUserParams: (option) => fetch.post('/v1/yygl/statistic/getSbjzUserParams',option),
        exportSbjdList: (option) => fetch.formPost('/v1/yygl/statistic/exportSbjdList',option),
        judgeUserMenuToDh: (option) => fetch.post('/v1/yygl/roleAuth/judgeUserMenuToDh',option),
    },
}
