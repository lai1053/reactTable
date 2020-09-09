/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */

import {fetch} from 'edf-utils'

export default {
    findRoleAuth: (option) => fetch.post('/v1/yygl/roleAuth/findRoleAuth', option),
    getRoleList: () => fetch.post('/v1/yygl/roleAuth/getAllRoles'),
    updateRoleAuth: (option) => fetch.post('/v1/yygl/roleAuth/updateRoleAuth', option),
    backToDefault: (option) => fetch.post('/v1/yygl/roleAuth/backToDefault', option),
    queryXdzMenus: () => fetch.post('/v1/edf/menu/queryXdzMenus'),
    dzCode: () => fetch.post('/v1/edf/connector/getJcyyCodeFromUc'),
    ifShowYyMenu: () => fetch.post('/v1/yygl/jcyysync/ifExist'),
    ifYyglExistAgencyId: () => fetch.post('/v1/yygl/jcyysync/ifYyglExistAgencyId'),
}
