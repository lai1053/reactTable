/**
 * webapi.js 封装app所需的所有web请求
 * 供app测试使用，app加入网站后webpai应该由网站通过config,提供给每个app
 */


import { fetch } from 'edf-utils'

export default {

    assignUser:{
        // queryJobUser:(option) => fetch.post('/v1/yygl/userCustPlsq/findPersonsByRole', option),//查询岗位下的人员
        queryJobUser:(option) => fetch.post('/v1/yygl/userCustPlsq/findPersonsByRoleQx', option),//查询岗位下的人员加数据权限的
        queryJobUser2:() => fetch.post('/v1/yygl/userCustPlsq/findPersonsByRole710'),//查询全部角色的人员
        saveCustomer:(option) => fetch.post('/v1/yygl/userCust/updateUserCust710',option),//保存人员信息
        getTableHeader:(option) => fetch.post('/v1/yygl/userCustPlsq/findPlsqRoles',option),//查询表头
        queryDGCustomer:() => fetch.post('/v1/yygl/userCustPlsq/findRolePersonsQx'),//单个客户查询所有岗位
    }
}
