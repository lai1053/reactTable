/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {

    assign: {
        queryTableHead: () => fetch.get('/v1/yygl/userCustPlsq/findBusinessRoles'),
        queryUserData: (option) => fetch.post('/v1/yygl/userCustPlsq/findUserPlsq710',option),
        queryJobUser:(option) => fetch.post('/v1/yygl/userCustPlsq/findPersonsByRole', option),//查询岗位下的人员
        getfpkh: (option) => fetch.post('/v1/yygl/person/getDepartMentList',option),
        getLD: () => fetch.post('/v1/yygl/userCustPlsq/pdldgexists'),//查询是否有理单岗
        getTableHeader:(option) => fetch.post('/v1/yygl/userCustPlsq/findPlsqRoles',option),//查询表头
        queryQX:() => fetch.post('/v1/yygl/userCust/queryqx'),//查询数据权限
        getImportAsyncStatusNew: (option) => fetch.post('/v1/yygl/userCust/getImportAsyncStatusNew',option),//
    }
}