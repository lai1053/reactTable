/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch} from 'edf-utils'

export default {
    // findRoleAuth: (option) => fetch.post('/v1/yygl/roleAuth/findRoleAuth', option),
    // getRoleList: () => fetch.post('/v1/yygl/roleAuth/getAllRoles'),
    // getOrgJzjdList: (option) => fetch.post('/v1/yygl/statistic/getOrgJzjdList', option),
    // createOrupdate: (option) => fetch.post('/v1/yygl/param/createOrupdate', option),
    queryfinish: () => fetch.post('/v1/yygl/param/query'),
    getfpkh: (option) => fetch.post('/v1/yygl/person/getDepartMentList',option),
    getSbtjList: (option) => fetch.post('/v1/yygl/statistic/getSbtjList',option),
    // getgwxx: (option) => fetch.post('/v1/yygl/statistic/getRoleByCustomerId',option),
    // departList:(option)=> fetch.post('/v1/yygl/department/findAllDepartmentByAuth', option),
    getOrgGztjList:(option)=> fetch.post('/v1/yygl/statistic/getOrgGztjList', option),
    exportGztjList:(option)=> fetch.formPost('/v1/yygl/statistic/exportGztjList', option),
    exportSbOrJzList:(option)=> fetch.formPost('/v1/yygl/statistic/exportSbOrJzList', option),
}
