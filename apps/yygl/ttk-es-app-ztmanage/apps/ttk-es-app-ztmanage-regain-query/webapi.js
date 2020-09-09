/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch} from 'edf-utils'

export default {
    getOrgJzjdList: (option) => fetch.post('/v1/yygl/statistic/getOrgJzjdList', option),
    // getfpkh: (option) => fetch.post('/v1/yygl/person/getDepartMentList',option),
    // getgwxx: (option) => fetch.post('/v1/yygl/statistic/getRoleByCustomerId',option),
    queryRestoreList: (option) => fetch.post('/v1/yygl/account/restore/queryRestoreListByOrgId',option),
    deleteFzt: (option) => fetch.post('/v1/yygl/account/restore/deleteFzt',option),
}
